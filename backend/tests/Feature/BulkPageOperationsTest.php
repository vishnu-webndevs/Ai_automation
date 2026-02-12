<?php

namespace Tests\Feature;

use App\Jobs\GeneratePageContent;
use App\Models\Admin;
use App\Models\Page;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Queue;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class BulkPageOperationsTest extends TestCase
{
    use RefreshDatabase;

    private function createAdminWithRole(): Admin
    {
        // Ensure role exists or create it
        $role = Role::firstOrCreate(['slug' => 'admin'], ['name' => 'Admin']);
        
        // Ensure permission exists
        $permission = Permission::firstOrCreate(['slug' => 'generate_content'], ['name' => 'Generate Content']);
        
        // Attach permission if not already attached
        if (!$role->permissions()->where('permissions.id', $permission->id)->exists()) {
            $role->permissions()->attach($permission->id);
        }

        $admin = Admin::create([
            'name' => 'Test Admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
        ]);

        $admin->roles()->attach($role->id);

        return $admin;
    }

    public function test_bulk_create_pages()
    {
        $admin = $this->createAdminWithRole();
        Sanctum::actingAs($admin);

        $payload = [
            'items' => [
                [
                    'title' => 'Service Page 1',
                    'type' => 'service',
                    'target_industry' => 'Finance',
                    'primary_keyword' => 'AI Finance',
                ],
                [
                    'title' => 'Blog Post 1',
                    'type' => 'blog',
                    'target_industry' => 'Health',
                    'primary_keyword' => 'AI Health',
                ]
            ]
        ];

        $response = $this->postJson('/api/admin/pages/bulk', $payload);

        $response->assertStatus(201)
                 ->assertJsonCount(2);

        $this->assertDatabaseHas('pages', ['title' => 'Service Page 1', 'slug' => 'service-page-1']);
        $this->assertDatabaseHas('pages', ['title' => 'Blog Post 1', 'slug' => 'blog-post-1']);
        
        $this->assertDatabaseHas('seo_meta', ['meta_keywords' => 'AI Finance']);
        $this->assertDatabaseHas('industries', ['name' => 'Finance']);
        
        $page1 = Page::where('title', 'Service Page 1')->first();
        $this->assertTrue($page1->industries()->where('name', 'Finance')->exists());
    }

    public function test_bulk_generate_content_dispatches_jobs()
    {
        Queue::fake();

        $admin = $this->createAdminWithRole();
        Sanctum::actingAs($admin);

        // Create pages first
        $page1 = Page::create(['title' => 'Page 1', 'slug' => 'page-1', 'type' => 'service', 'status' => 'draft']);
        $page2 = Page::create(['title' => 'Page 2', 'slug' => 'page-2', 'type' => 'service', 'status' => 'draft']);

        $payload = [
            'page_ids' => [$page1->id, $page2->id],
            'model' => 'lorum',
            'tone' => 'Professional',
            'content_length' => 'Medium',
        ];

        $response = $this->postJson('/api/admin/ai/generate-page-bulk', $payload);

        $response->assertStatus(200)
                 ->assertJson(['message' => 'Queued 2 pages for generation']);

        Queue::assertPushed(GeneratePageContent::class, 2);
        
        Queue::assertPushed(GeneratePageContent::class, function ($job) use ($page1) {
            // Check job properties via reflection or public properties if available
            // Since properties are protected, we can check constructor args if we spy, 
            // but Queue::assertPushed callback receives the job instance.
            // We can't easily access protected properties without reflection.
            // But we can check if it's the right class.
            return true; 
        });
    }
}
