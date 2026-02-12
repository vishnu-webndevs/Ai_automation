<?php

namespace Tests\Feature;

use App\Models\Admin;
use App\Models\InternalLink;
use App\Models\Page;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InternalLinkTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Setup Admin with Permissions
        $this->admin = Admin::factory()->create();
        $role = Role::firstOrCreate(['slug' => 'admin'], ['name' => 'Admin']);
        
        $permission = Permission::firstOrCreate(['slug' => 'manage_seo'], ['name' => 'Manage SEO']);
        $role->permissions()->syncWithoutDetaching([$permission->id]);
        
        $this->admin->roles()->attach($role);
    }

    public function test_can_list_internal_links()
    {
        $page1 = Page::create(['title' => 'Page 1', 'slug' => 'page-1', 'type' => 'page', 'status' => 'published']);
        $page2 = Page::create(['title' => 'Page 2', 'slug' => 'page-2', 'type' => 'page', 'status' => 'published']);

        InternalLink::create([
            'source_page_id' => $page1->id,
            'target_page_id' => $page2->id,
            'anchor_text' => 'Go to Page 2',
            'relevance_score' => 0.8
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/admin/internal-links');

        $response->assertStatus(200)
            ->assertJsonStructure(['data' => ['*' => ['id', 'source_page_id', 'target_page_id', 'anchor_text']]]);
    }

    public function test_can_create_internal_link()
    {
        $page1 = Page::create(['title' => 'Page 1', 'slug' => 'page-1', 'type' => 'page', 'status' => 'published']);
        $page2 = Page::create(['title' => 'Page 2', 'slug' => 'page-2', 'type' => 'page', 'status' => 'published']);

        $data = [
            'source_page_id' => $page1->id,
            'target_page_id' => $page2->id,
            'anchor_text' => 'Click Here',
            'auto_generated' => false,
        ];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/admin/internal-links', $data);

        $response->assertStatus(201)
            ->assertJsonFragment(['anchor_text' => 'Click Here']);
            
        $this->assertDatabaseHas('internal_links', ['source_page_id' => $page1->id, 'target_page_id' => $page2->id]);
    }

    public function test_prevent_duplicate_internal_link()
    {
        $page1 = Page::create(['title' => 'Page 1', 'slug' => 'page-1', 'type' => 'page', 'status' => 'published']);
        $page2 = Page::create(['title' => 'Page 2', 'slug' => 'page-2', 'type' => 'page', 'status' => 'published']);

        InternalLink::create([
            'source_page_id' => $page1->id,
            'target_page_id' => $page2->id,
            'anchor_text' => 'Same Anchor',
        ]);

        $data = [
            'source_page_id' => $page1->id,
            'target_page_id' => $page2->id,
            'anchor_text' => 'Same Anchor',
        ];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/admin/internal-links', $data);

        $response->assertStatus(409);
    }

    public function test_suggest_internal_links()
    {
        $source = Page::create(['title' => 'Source Page', 'slug' => 'source', 'type' => 'page', 'status' => 'published']);
        // Need to add some content to source page
        // But suggest logic uses relations. Let's rely on Title match for simplicity if controller supports it.
        // Controller logic: 
        // 1. Get all other published pages
        // 2. Check if other page title is in source content
        
        // Add content to source page that mentions "Target Page"
        // Since we don't easily add sections in test without factories, let's assume title match works or simple content.
        // Wait, controller flattens source content from sections.
        // Let's create a section with block.
        $section = $source->sections()->create(['section_key' => 'main', 'order' => 1]);
        $section->blocks()->create([
            'block_type' => 'text',
            'content_json' => ['text' => 'Check out the Target Page for more info.'],
            'order' => 1
        ]);

        $target = Page::create(['title' => 'Target Page', 'slug' => 'target', 'type' => 'page', 'status' => 'published']);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson("/api/admin/internal-links/suggest?source_page_id={$source->id}");

        $response->assertStatus(200);
        // Should find Target Page because "Target Page" is in content
        $response->assertJsonFragment(['target_page_title' => 'Target Page']);
    }
}
