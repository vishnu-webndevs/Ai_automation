<?php

namespace Tests\Feature;

use App\Models\Admin;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class MenuManagerTest extends TestCase
{
    use RefreshDatabase;

    private function actingAsAdminWithPermission(string $permissionSlug): Admin
    {
        $permission = Permission::create(['name' => $permissionSlug, 'slug' => $permissionSlug]);
        $role = Role::create(['name' => 'Admin', 'slug' => 'admin']);
        $role->permissions()->attach($permission->id);

        $admin = Admin::create([
            'name' => 'Test Admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
        ]);
        $admin->roles()->attach($role->id);

        Sanctum::actingAs($admin);

        return $admin;
    }

    public function test_menu_crud_and_items_reorder(): void
    {
        $this->actingAsAdminWithPermission('manage_menus');

        $menu = $this->postJson('/api/admin/menus', [
            'name' => 'Header Menu',
            'location' => 'header',
            'is_active' => true,
        ])->assertCreated()->json();

        $a = $this->postJson("/api/admin/menus/{$menu['id']}/items", [
            'label' => 'Home',
            'custom_url' => '/',
        ])->assertCreated()->json();

        $b = $this->postJson("/api/admin/menus/{$menu['id']}/items", [
            'label' => 'Contact',
            'custom_url' => '/contact',
        ])->assertCreated()->json();

        $this->postJson("/api/admin/menus/{$menu['id']}/reorder", [
            'items' => [
                ['id' => $b['id'], 'parent_id' => null, 'order' => 0],
                ['id' => $a['id'], 'parent_id' => null, 'order' => 1],
            ],
        ])->assertOk();

        $items = $this->getJson("/api/admin/menus/{$menu['id']}/items")->assertOk()->json();
        $this->assertSame($b['id'], $items[0]['id']);

        $public = $this->getJson('/api/menus/header')->assertOk()->json();
        $this->assertSame('header', $public['location']);
        $this->assertCount(2, $public['items']);
    }

    public function test_menus_are_forbidden_without_permission(): void
    {
        $permission = Permission::create(['name' => 'Generate Content', 'slug' => 'generate_content']);
        $role = Role::create(['name' => 'Admin', 'slug' => 'admin']);
        $role->permissions()->attach($permission->id);

        $admin = Admin::create([
            'name' => 'Test Admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
        ]);
        $admin->roles()->attach($role->id);
        Sanctum::actingAs($admin);

        $this->getJson('/api/admin/menus')->assertStatus(403);
    }
}

