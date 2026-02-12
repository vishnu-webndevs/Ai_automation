<?php

namespace Tests\Feature;

use App\Models\Admin;
use App\Models\Page;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class SitemapTest extends TestCase
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

    public function test_public_sitemap_xml()
    {
        Page::create(['title' => 'Home', 'slug' => 'home', 'type' => 'page', 'status' => 'published']);
        Page::create(['title' => 'About', 'slug' => 'about', 'type' => 'page', 'status' => 'published']);
        Page::create(['title' => 'Draft', 'slug' => 'draft', 'type' => 'page', 'status' => 'draft']);

        $response = $this->get('/api/sitemap.xml');

        $response->assertStatus(200)
            ->assertHeader('Content-Type', 'application/xml; charset=UTF-8');
            
        $content = $response->getContent();
        $this->assertStringContainsString('<loc>', $content);
        $this->assertStringContainsString('/home', $content);
        $this->assertStringContainsString('/about', $content);
        $this->assertStringNotContainsString('/draft', $content);
    }

    public function test_admin_can_rebuild_sitemap()
    {
        Cache::shouldReceive('forget')->once()->with('public_sitemap_xml');
        Cache::shouldReceive('remember')->andReturn('xml content');

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/admin/sitemap/rebuild');

        $response->assertStatus(200)
            ->assertJson(['message' => 'Sitemap rebuilt successfully']);
    }
}
