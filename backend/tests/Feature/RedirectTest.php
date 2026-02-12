<?php

namespace Tests\Feature;

use App\Models\Admin;
use App\Models\Redirect;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RedirectTest extends TestCase
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

    public function test_can_list_redirects()
    {
        Redirect::create([
            'source_url' => '/old-page',
            'target_url' => '/new-page',
            'status_code' => 301,
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/admin/redirects');

        $response->assertStatus(200)
            ->assertJsonStructure(['*' => ['id', 'source_url', 'target_url', 'status_code', 'is_active']]);
    }

    public function test_can_create_redirect()
    {
        $data = [
            'source_url' => '/source',
            'target_url' => '/target',
            'status_code' => 301,
            'is_active' => true,
        ];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/admin/redirects', $data);

        $response->assertStatus(201)
            ->assertJsonFragment(['source_url' => '/source']);

        $this->assertDatabaseHas('redirects', ['source_url' => '/source']);
    }

    public function test_validate_redirect_creation()
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/admin/redirects', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['source_url', 'target_url']);
    }

    public function test_can_update_redirect()
    {
        $redirect = Redirect::create([
            'source_url' => '/old',
            'target_url' => '/new',
            'status_code' => 302,
        ]);

        $data = [
            'target_url' => '/newer',
            'status_code' => 301,
        ];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->putJson("/api/admin/redirects/{$redirect->id}", $data);

        $response->assertStatus(200)
            ->assertJsonFragment(['target_url' => '/newer', 'status_code' => 301]);

        $this->assertDatabaseHas('redirects', ['id' => $redirect->id, 'target_url' => '/newer']);
    }

    public function test_detects_redirect_loop()
    {
        Redirect::create([
            'source_url' => '/page-a',
            'target_url' => '/page-b',
            'status_code' => 301,
        ]);

        Redirect::create([
            'source_url' => '/page-b',
            'target_url' => '/page-c',
            'status_code' => 301,
        ]);

        // Try to create C -> A (Loop)
        $data = [
            'source_url' => '/page-c',
            'target_url' => '/page-a',
            'status_code' => 301,
        ];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/admin/redirects', $data);

        $response->assertStatus(422)
            ->assertJsonFragment(['message' => 'Redirect loop detected.']);
    }

    public function test_can_delete_redirect()
    {
        $redirect = Redirect::create([
            'source_url' => '/delete-me',
            'target_url' => '/gone',
            'status_code' => 301,
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->deleteJson("/api/admin/redirects/{$redirect->id}");

        $response->assertStatus(204);

        $this->assertDatabaseMissing('redirects', ['id' => $redirect->id]);
    }
}
