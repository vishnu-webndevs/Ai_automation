<?php

namespace Tests\Feature;

use App\Models\Admin;
use App\Models\Industry;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\UseCase;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaxonomyTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Setup Admin with Permissions
        $this->admin = Admin::factory()->create();
        $role = Role::firstOrCreate(['slug' => 'admin'], ['name' => 'Admin']);
        
        $permission = Permission::firstOrCreate(['slug' => 'manage_taxonomy'], ['name' => 'Manage Taxonomy']);
        $role->permissions()->syncWithoutDetaching([$permission->id]);
        
        $this->admin->roles()->attach($role);
    }

    // Industry Tests
    public function test_can_list_industries()
    {
        Industry::create(['name' => 'Tech', 'slug' => 'tech']);
        Industry::create(['name' => 'Health', 'slug' => 'health']);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/admin/industries');

        $response->assertStatus(200)
            ->assertJsonCount(2);
    }

    public function test_can_create_industry()
    {
        $data = ['name' => 'Finance', 'description' => 'Money stuff', 'is_active' => true];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/admin/industries', $data);

        $response->assertStatus(201)
            ->assertJsonFragment(['name' => 'Finance', 'slug' => 'finance']);
            
        $this->assertDatabaseHas('industries', ['name' => 'Finance']);
    }

    public function test_can_update_industry()
    {
        $industry = Industry::create(['name' => 'Old Name', 'slug' => 'old-name']);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->putJson("/api/admin/industries/{$industry->id}", ['name' => 'New Name']);

        $response->assertStatus(200)
            ->assertJsonFragment(['name' => 'New Name', 'slug' => 'new-name']);
    }

    public function test_can_delete_industry()
    {
        $industry = Industry::create(['name' => 'Delete Me', 'slug' => 'delete-me']);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->deleteJson("/api/admin/industries/{$industry->id}");

        $response->assertStatus(204);
        $this->assertDatabaseMissing('industries', ['id' => $industry->id]);
    }

    // Service Tests
    public function test_can_list_services()
    {
        $category = ServiceCategory::create(['name' => 'Development', 'slug' => 'development']);
        Service::create(['name' => 'Web Dev', 'slug' => 'web-dev', 'service_category_id' => $category->id]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/admin/services');

        $response->assertStatus(200)
            ->assertJsonCount(1);
    }

    public function test_can_create_service()
    {
        $category = ServiceCategory::create(['name' => 'Marketing', 'slug' => 'marketing']);
        $data = ['name' => 'SEO', 'description' => 'Search Engine Opt', 'service_category_id' => $category->id];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/admin/services', $data);

        $response->assertStatus(201)
            ->assertJsonFragment(['name' => 'SEO', 'slug' => 'seo']);
    }

    // UseCase Tests
    public function test_can_list_use_cases()
    {
        UseCase::create(['name' => 'Lead Gen', 'slug' => 'lead-gen']);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/admin/use-cases');

        $response->assertStatus(200)
            ->assertJsonCount(1);
    }

    public function test_can_create_use_case()
    {
        $data = ['name' => 'Brand Awareness', 'description' => 'Get known'];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/admin/use-cases', $data);

        $response->assertStatus(201)
            ->assertJsonFragment(['name' => 'Brand Awareness', 'slug' => 'brand-awareness']);
    }
}
