<?php

namespace Tests\Feature;

use App\Models\Admin;
use App\Models\Page;
use App\Models\Role;
use App\Models\Permission;
use App\Jobs\GeneratePageContent;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class BulkGenerationTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->admin = Admin::factory()->create();
        $role = Role::firstOrCreate(['slug' => 'admin'], ['name' => 'Admin']);
        $permission = Permission::firstOrCreate(['slug' => 'manage_pages'], ['name' => 'Manage Pages']);
        $role->permissions()->syncWithoutDetaching([$permission->id]);
        $this->admin->roles()->attach($role);
    }

    public function test_bulk_create_pages()
    {
        $data = [
            'items' => [
                [
                    'title' => 'Bulk Page 1',
                    'type' => 'service',
                    'target_industry' => 'Tech',
                    'primary_keyword' => 'Software'
                ],
                [
                    'title' => 'Bulk Page 2',
                    'type' => 'blog',
                    'target_industry' => 'Health',
                    'primary_keyword' => 'Wellness'
                ]
            ]
        ];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/admin/pages/bulk', $data);

        $response->assertStatus(201)
            ->assertJsonCount(2);

        $this->assertDatabaseHas('pages', ['title' => 'Bulk Page 1']);
        $this->assertDatabaseHas('pages', ['title' => 'Bulk Page 2']);
        $this->assertDatabaseHas('industries', ['name' => 'Tech']);
        $this->assertDatabaseHas('industries', ['name' => 'Health']);
        
        // Check SEO
        $page1 = Page::where('title', 'Bulk Page 1')->first();
        $this->assertDatabaseHas('seo_meta', ['page_id' => $page1->id, 'meta_keywords' => 'Software']);
    }

    public function test_bulk_generate_dispatches_jobs()
    {
        Queue::fake();

        $page1 = Page::create(['title' => 'P1', 'slug' => 'p1', 'type' => 'page', 'status' => 'draft']);
        $page2 = Page::create(['title' => 'P2', 'slug' => 'p2', 'type' => 'page', 'status' => 'draft']);

        $data = [
            'page_ids' => [$page1->id, $page2->id],
            'model' => 'lorum', // Assuming lorum is valid
            'tone' => 'Professional',
            'content_length' => 'Medium'
        ];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/admin/ai/generate-page-bulk', $data);

        $response->assertStatus(200);

        Queue::assertPushed(GeneratePageContent::class, 2);
    }

    public function test_bulk_create_stress_test()
    {
        $items = [];
        for ($i = 0; $i < 50; $i++) {
            $items[] = [
                'title' => "Stress Test Page $i",
                'type' => 'service',
                'target_industry' => 'Tech',
                'primary_keyword' => "Keyword $i"
            ];
        }

        $data = ['items' => $items];

        $start = microtime(true);
        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/admin/pages/bulk', $data);
        $end = microtime(true);

        $response->assertStatus(201)
            ->assertJsonCount(50);
            
        $this->assertDatabaseCount('pages', 50); // Assuming clean db or +50
        
        // Ensure it's reasonably fast (e.g. under 5 seconds for 50 simple inserts)
        $this->assertLessThan(5.0, $end - $start, "Bulk creation took too long");
    }
}
