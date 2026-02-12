<?php

namespace Tests\Feature;

use App\Models\Admin;
use App\Models\Page;
use App\Models\SchemaMarkup;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SchemaTest extends TestCase
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

    public function test_can_list_schemas()
    {
        $page = Page::create(['title' => 'Page 1', 'slug' => 'page-1', 'type' => 'page', 'status' => 'published']);
        
        SchemaMarkup::create([
            'page_id' => $page->id,
            'type' => 'Article',
            'schema_json' => ['headline' => 'Test Headline'],
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/admin/schemas');

        $response->assertStatus(200)
            ->assertJsonStructure(['data' => ['*' => ['id', 'page_id', 'type', 'schema_json', 'page']]]);
    }

    public function test_can_create_schema()
    {
        $page = Page::create(['title' => 'Page 1', 'slug' => 'page-1', 'type' => 'page', 'status' => 'published']);

        $data = [
            'page_id' => $page->id,
            'type' => 'Organization',
            'schema_json' => ['name' => 'Totan AI'],
        ];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/admin/schemas', $data);

        $response->assertStatus(201)
            ->assertJsonFragment(['type' => 'Organization']);

        $this->assertDatabaseHas('schema_markup', ['page_id' => $page->id, 'type' => 'Organization']);
    }

    public function test_can_update_schema()
    {
        $page = Page::create(['title' => 'Page 1', 'slug' => 'page-1', 'type' => 'page', 'status' => 'published']);
        
        $schema = SchemaMarkup::create([
            'page_id' => $page->id,
            'type' => 'Article',
            'schema_json' => ['headline' => 'Old Headline'],
        ]);

        $data = [
            'type' => 'NewsArticle',
            'schema_json' => ['headline' => 'New Headline'],
        ];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->putJson("/api/admin/schemas/{$schema->id}", $data);

        $response->assertStatus(200)
            ->assertJsonFragment(['type' => 'NewsArticle']);

        $this->assertDatabaseHas('schema_markup', ['id' => $schema->id, 'type' => 'NewsArticle']);
    }

    public function test_can_delete_schema()
    {
        $page = Page::create(['title' => 'Page 1', 'slug' => 'page-1', 'type' => 'page', 'status' => 'published']);
        
        $schema = SchemaMarkup::create([
            'page_id' => $page->id,
            'type' => 'Article',
            'schema_json' => ['headline' => 'Delete Me'],
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->deleteJson("/api/admin/schemas/{$schema->id}");

        $response->assertStatus(204);

        $this->assertDatabaseMissing('schema_markup', ['id' => $schema->id]);
    }
}
