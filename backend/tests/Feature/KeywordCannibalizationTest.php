<?php

namespace Tests\Feature;

use App\Models\Admin;
use App\Models\Page;
use App\Models\SeoMeta;
use App\Models\Role;
use App\Models\Permission;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class KeywordCannibalizationTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->admin = Admin::factory()->create();
        $role = Role::firstOrCreate(['slug' => 'admin'], ['name' => 'Admin']);
        $permission = Permission::firstOrCreate(['slug' => 'manage_pages'], ['name' => 'Manage Pages']); // Access to pages
        $role->permissions()->syncWithoutDetaching([$permission->id]);
        $this->admin->roles()->attach($role);
    }

    public function test_detects_cannibalization()
    {
        // 1. Create a published page with keyword "AI Services"
        $page1 = Page::create(['title' => 'Page 1', 'slug' => 'page-1', 'type' => 'page', 'status' => 'published']);
        SeoMeta::create(['page_id' => $page1->id, 'meta_keywords' => 'AI Services, Machine Learning']);

        // 2. Check "AI Services" (Should detect)
        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/admin/pages/check-keyword', [
                'keyword' => 'AI Services'
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'cannibalization_detected' => true,
            ])
            ->assertJsonFragment(['slug' => 'page-1']);
    }

    public function test_ignores_draft_pages()
    {
        // 1. Create a DRAFT page with keyword "AI Services"
        $page1 = Page::create(['title' => 'Page 1', 'slug' => 'page-1', 'type' => 'page', 'status' => 'draft']);
        SeoMeta::create(['page_id' => $page1->id, 'meta_keywords' => 'AI Services']);

        // 2. Check "AI Services" (Should NOT detect because it's draft)
        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/admin/pages/check-keyword', [
                'keyword' => 'AI Services'
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'cannibalization_detected' => false,
            ]);
    }

    public function test_ignores_self()
    {
        // 1. Create a published page
        $page1 = Page::create(['title' => 'Page 1', 'slug' => 'page-1', 'type' => 'page', 'status' => 'published']);
        SeoMeta::create(['page_id' => $page1->id, 'meta_keywords' => 'AI Services']);

        // 2. Check "AI Services" FOR Page 1 (Should ignore itself)
        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/admin/pages/check-keyword', [
                'keyword' => 'AI Services',
                'page_id' => $page1->id
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'cannibalization_detected' => false,
            ]);
    }

    public function test_partial_match_detection()
    {
         // 1. Create a published page with keyword "Best AI Services"
         $page1 = Page::create(['title' => 'Page 1', 'slug' => 'page-1', 'type' => 'page', 'status' => 'published']);
         SeoMeta::create(['page_id' => $page1->id, 'meta_keywords' => 'Best AI Services']);
 
         // 2. Check "AI Services" (Should find "Best AI Services" as conflict due to 'like' query)
         // My implementation used 'like %keyword%'.
         // So searching "AI Services" will find "Best AI Services".
         
         $response = $this->actingAs($this->admin, 'sanctum')
             ->postJson('/api/admin/pages/check-keyword', [
                 'keyword' => 'AI Services'
             ]);
 
         $response->assertStatus(200)
             ->assertJson([
                 'cannibalization_detected' => true,
             ]);
    }
}
