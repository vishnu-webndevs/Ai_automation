<?php

namespace Tests\Feature;

use App\Models\Admin;
use App\Models\Cta;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CtaTest extends TestCase
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

    public function test_can_list_ctas()
    {
        Cta::create(['name' => 'CTA 1', 'content' => 'Content 1']);
        Cta::create(['name' => 'CTA 2', 'content' => 'Content 2']);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/admin/ctas');

        $response->assertStatus(200)
            ->assertJsonCount(2);
    }

    public function test_can_create_cta()
    {
        $data = [
            'name' => 'New CTA',
            'content' => '<h1>Call to Action</h1>',
            'button_text' => 'Click Me',
            'link' => '/contact',
            'active_status' => true,
        ];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/admin/ctas', $data);

        $response->assertStatus(201)
            ->assertJsonFragment(['name' => 'New CTA']);
            
        $this->assertDatabaseHas('ctas', ['name' => 'New CTA', 'link' => '/contact']);
    }

    public function test_can_update_cta()
    {
        $cta = Cta::create(['name' => 'Old CTA', 'content' => 'Old Content']);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->patchJson("/api/admin/ctas/{$cta->id}", [
                'name' => 'Updated CTA'
            ]);

        $response->assertStatus(200)
            ->assertJsonFragment(['name' => 'Updated CTA']);
            
        $this->assertDatabaseHas('ctas', ['id' => $cta->id, 'name' => 'Updated CTA']);
    }

    public function test_can_delete_cta()
    {
        $cta = Cta::create(['name' => 'Delete Me', 'content' => 'Bye']);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->deleteJson("/api/admin/ctas/{$cta->id}");

        $response->assertStatus(204);
        $this->assertDatabaseMissing('ctas', ['id' => $cta->id]);
    }
}
