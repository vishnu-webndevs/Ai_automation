<?php

namespace Tests\Feature;

use App\Models\Admin;
use App\Models\Page;
use App\Models\Service;
use App\Models\Industry;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\Role;

class PageCrudTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Create admin and authenticate
        $this->admin = Admin::factory()->create();
        $role = Role::firstOrCreate(['slug' => 'admin'], ['name' => 'Admin']);
        $this->admin->roles()->attach($role);
    }

    public function test_can_list_pages()
    {
        Page::create([
            'title' => 'Test Page 1',
            'slug' => 'test-page-1',
            'type' => 'service',
            'status' => 'draft',
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/admin/pages');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'title', 'slug', 'type', 'status', 'created_at', 'updated_at']
                ],
                'current_page',
                'total'
            ]);
    }

    public function test_can_create_page()
    {
        $data = [
            'title' => 'New Page',
            'type' => 'service',
            'status' => 'draft',
            'slug' => 'new-page',
            // Add relationships if needed, but keeping it simple for now
        ];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/admin/pages', $data);

        $response->assertStatus(201)
            ->assertJsonFragment(['title' => 'New Page']);
        
        $this->assertDatabaseHas('pages', ['slug' => 'new-page']);
    }

    public function test_can_update_page()
    {
        $page = Page::create([
            'title' => 'Old Title',
            'slug' => 'old-title',
            'type' => 'service',
            'status' => 'draft',
        ]);

        $data = [
            'title' => 'Updated Title',
            'status' => 'published',
        ];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->patchJson("/api/admin/pages/{$page->id}", $data);

        $response->assertStatus(200)
            ->assertJsonFragment(['title' => 'Updated Title', 'status' => 'published']);
        
        $this->assertDatabaseHas('pages', ['id' => $page->id, 'title' => 'Updated Title']);
    }

    public function test_can_show_page()
    {
        $page = Page::create([
            'title' => 'Show Page',
            'slug' => 'show-page',
            'type' => 'service',
            'status' => 'draft',
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson("/api/admin/pages/{$page->id}");

        $response->assertStatus(200)
            ->assertJsonFragment(['title' => 'Show Page']);
    }

    public function test_can_delete_page()
    {
        $page = Page::create([
            'title' => 'Delete Page',
            'slug' => 'delete-page',
            'type' => 'service',
            'status' => 'draft',
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->deleteJson("/api/admin/pages/{$page->id}");

        $response->assertStatus(204);
        
        $this->assertDatabaseMissing('pages', ['id' => $page->id]);
    }

    public function test_create_page_validation()
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/admin/pages', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['title', 'type', 'status']);
    }
}
