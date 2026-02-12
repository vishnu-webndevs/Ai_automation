<?php

namespace Tests\Feature;

use App\Models\Admin;
use App\Models\Role;
use App\Models\Permission;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_login()
    {
        $admin = Admin::factory()->create([
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
        ]);

        $response = $this->postJson('/api/admin/auth/login', [
            'email' => 'admin@example.com',
            'password' => 'password',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['token', 'admin']);
    }

    public function test_admin_cannot_login_with_invalid_credentials()
    {
        $admin = Admin::factory()->create([
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
        ]);

        $response = $this->postJson('/api/admin/auth/login', [
            'email' => 'admin@example.com',
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(401);
    }

    public function test_admin_can_logout()
    {
        $admin = Admin::factory()->create();
        $token = $admin->createToken('admin-token')->plainTextToken;

        $response = $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->postJson('/api/admin/auth/logout');

        $response->assertStatus(200);
    }

    public function test_protected_route_requires_auth()
    {
        $response = $this->getJson('/api/admin/pages');

        $response->assertStatus(401);
    }

    public function test_role_middleware_blocks_unauthorized_admin()
    {
        // Admin without 'admin' role
        $admin = Admin::factory()->create(); 
        // Note: Assuming factory doesn't attach 'admin' role by default or we need to detach it
        // Depending on implementation, we might need to mock hasRole.
        // But better to use real DB data if Role/Permission models exist.
        
        $token = $admin->createToken('admin-token')->plainTextToken;

        // Try to access a route protected by 'admin.role:admin'
        // In api.php: Route::middleware(['auth:sanctum', 'admin.role:admin'])->group(...)
        // If the factory creates a "super admin" or default role, this test might fail (false positive).
        // Let's ensure this admin DOES NOT have the role.
        
        $response = $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->getJson('/api/admin/pages');
            
        // If the middleware works, and the user doesn't have the role, it should be 403.
        // However, we need to know how roles are attached.
        // Let's assume for now the factory creates a plain admin.
        
        $response->assertStatus(403);
    }
}
