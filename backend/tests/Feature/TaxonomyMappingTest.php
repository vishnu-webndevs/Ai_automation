<?php

namespace Tests\Feature;

use App\Models\Admin;
use App\Models\Page;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\Industry;
use App\Models\Role;
use App\Models\Permission;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaxonomyMappingTest extends TestCase
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

    public function test_service_to_page_mapping()
    {
        $category = ServiceCategory::create(['name' => 'Dev', 'slug' => 'dev']);
        $service = Service::create(['name' => 'Web Dev', 'slug' => 'web-dev', 'service_category_id' => $category->id]);
        $page = Page::create(['title' => 'Service Page', 'slug' => 'service-page', 'type' => 'service', 'status' => 'draft']);

        $data = [
            'services' => [$service->id],
        ];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->patchJson("/api/admin/pages/{$page->id}", $data);

        $response->assertStatus(200);
        
        $this->assertDatabaseHas('page_service_map', [
            'page_id' => $page->id,
            'service_id' => $service->id,
        ]);
    }

    public function test_industry_to_page_mapping()
    {
        $industry = Industry::create(['name' => 'Healthcare', 'slug' => 'healthcare']);
        $page = Page::create(['title' => 'Industry Page', 'slug' => 'industry-page', 'type' => 'industry', 'status' => 'draft']);

        $data = [
            'industries' => [$industry->id],
        ];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->patchJson("/api/admin/pages/{$page->id}", $data);

        $response->assertStatus(200);
        
        $this->assertDatabaseHas('page_industry_map', [
            'page_id' => $page->id,
            'industry_id' => $industry->id,
        ]);
    }

    public function test_mapping_syncs_correctly()
    {
        $category = ServiceCategory::create(['name' => 'Dev', 'slug' => 'dev']);
        $service1 = Service::create(['name' => 'S1', 'slug' => 's1', 'service_category_id' => $category->id]);
        $service2 = Service::create(['name' => 'S2', 'slug' => 's2', 'service_category_id' => $category->id]);
        $page = Page::create(['title' => 'Page', 'slug' => 'page', 'type' => 'page', 'status' => 'draft']);

        // Attach S1
        $this->actingAs($this->admin, 'sanctum')
            ->patchJson("/api/admin/pages/{$page->id}", ['services' => [$service1->id]]);

        $this->assertDatabaseHas('page_service_map', ['page_id' => $page->id, 'service_id' => $service1->id]);
        $this->assertDatabaseMissing('page_service_map', ['page_id' => $page->id, 'service_id' => $service2->id]);

        // Sync to S2 (S1 should be removed)
        $this->actingAs($this->admin, 'sanctum')
            ->patchJson("/api/admin/pages/{$page->id}", ['services' => [$service2->id]]);

        $this->assertDatabaseMissing('page_service_map', ['page_id' => $page->id, 'service_id' => $service1->id]);
        $this->assertDatabaseHas('page_service_map', ['page_id' => $page->id, 'service_id' => $service2->id]);
    }
}
