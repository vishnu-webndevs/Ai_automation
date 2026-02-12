<?php

namespace Tests\Feature;

use App\Models\Admin;
use App\Models\BlogCategory;
use App\Models\BlogTag;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BlogTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Setup Admin with Permissions
        $this->admin = Admin::factory()->create();
        $role = Role::firstOrCreate(['slug' => 'admin'], ['name' => 'Admin']);
        
        $permission = Permission::firstOrCreate(['slug' => 'manage_content'], ['name' => 'Manage Content']);
        $role->permissions()->syncWithoutDetaching([$permission->id]);
        
        $this->admin->roles()->attach($role);
    }

    // Blog Category Tests
    public function test_can_list_blog_categories()
    {
        BlogCategory::create(['name' => 'News', 'slug' => 'news']);
        BlogCategory::create(['name' => 'Updates', 'slug' => 'updates']);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/admin/blog-categories');

        $response->assertStatus(200)
            ->assertJsonCount(2);
    }

    public function test_can_create_blog_category()
    {
        $data = ['name' => 'Tutorials', 'slug' => 'tutorials'];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/admin/blog-categories', $data);

        $response->assertStatus(201)
            ->assertJsonFragment(['name' => 'Tutorials', 'slug' => 'tutorials']);
    }

    // Blog Tag Tests
    public function test_can_list_blog_tags()
    {
        BlogTag::create(['name' => 'Laravel', 'slug' => 'laravel']);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/admin/blog-tags');

        $response->assertStatus(200)
            ->assertJsonCount(1);
    }

    public function test_can_create_blog_tag()
    {
        $data = ['name' => 'PHP', 'slug' => 'php'];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/admin/blog-tags', $data);

        $response->assertStatus(201)
            ->assertJsonFragment(['name' => 'PHP', 'slug' => 'php']);
    }
}
