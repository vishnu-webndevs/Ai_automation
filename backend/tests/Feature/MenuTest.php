<?php

namespace Tests\Feature;

use App\Models\Admin;
use App\Models\Menu;
use App\Models\MenuItem;
use App\Models\Permission;
use App\Models\Role;
use App\Models\Page;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MenuTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Setup Admin with Permissions
        $this->admin = Admin::factory()->create();
        $role = Role::firstOrCreate(['slug' => 'admin'], ['name' => 'Admin']);
        
        $permission = Permission::firstOrCreate(['slug' => 'manage_menus'], ['name' => 'Manage Menus']);
        $role->permissions()->syncWithoutDetaching([$permission->id]);
        
        $this->admin->roles()->attach($role);
    }

    public function test_can_list_menus()
    {
        Menu::create(['name' => 'Main Menu', 'location' => 'header', 'slug' => 'main-menu']);
        Menu::create(['name' => 'Footer Menu', 'location' => 'footer', 'slug' => 'footer-menu']);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/admin/menus');

        $response->assertStatus(200)
            ->assertJsonCount(2);
    }

    public function test_can_create_menu()
    {
        $data = [
            'name' => 'Sidebar Menu',
            'location' => 'sidebar',
            'is_active' => true,
        ];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/admin/menus', $data);

        $response->assertStatus(201)
            ->assertJsonFragment(['name' => 'Sidebar Menu', 'location' => 'sidebar']);
            
        $this->assertDatabaseHas('menus', ['slug' => 'sidebar-menu']);
    }

    public function test_can_update_menu()
    {
        $menu = Menu::create(['name' => 'Old Menu', 'location' => 'header', 'slug' => 'old-menu']);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->patchJson("/api/admin/menus/{$menu->id}", [
                'name' => 'New Menu Name'
            ]);

        $response->assertStatus(200)
            ->assertJsonFragment(['name' => 'New Menu Name']);
            
        $this->assertDatabaseHas('menus', ['id' => $menu->id, 'name' => 'New Menu Name']);
    }

    public function test_can_delete_menu()
    {
        $menu = Menu::create(['name' => 'Delete Menu', 'location' => 'header', 'slug' => 'delete-menu']);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->deleteJson("/api/admin/menus/{$menu->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('menus', ['id' => $menu->id]);
    }

    public function test_can_add_menu_item()
    {
        $menu = Menu::create(['name' => 'Main Menu', 'location' => 'header', 'slug' => 'main-menu']);
        $page = Page::create(['title' => 'Home', 'slug' => 'home', 'type' => 'page', 'status' => 'published']);

        $data = [
            'label' => 'Home Link',
            'page_id' => $page->id,
            'order' => 1,
        ];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson("/api/admin/menus/{$menu->id}/items", $data);

        $response->assertStatus(201)
            ->assertJsonFragment(['label' => 'Home Link']);
            
        $this->assertDatabaseHas('menu_items', ['menu_id' => $menu->id, 'page_id' => $page->id]);
    }

    public function test_can_update_menu_item()
    {
        $menu = Menu::create(['name' => 'Main Menu', 'location' => 'header', 'slug' => 'main-menu']);
        $item = MenuItem::create([
            'menu_id' => $menu->id,
            'label' => 'Old Label',
            'custom_url' => '/old',
            'order' => 1
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->patchJson("/api/admin/menu-items/{$item->id}", [
                'label' => 'New Label'
            ]);

        $response->assertStatus(200)
            ->assertJsonFragment(['label' => 'New Label']);
    }

    public function test_can_delete_menu_item()
    {
        $menu = Menu::create(['name' => 'Main Menu', 'location' => 'header', 'slug' => 'main-menu']);
        $item = MenuItem::create([
            'menu_id' => $menu->id,
            'label' => 'Delete Me',
            'custom_url' => '/delete',
            'order' => 1
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->deleteJson("/api/admin/menu-items/{$item->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('menu_items', ['id' => $item->id]);
    }
}
