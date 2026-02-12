<?php

namespace Tests\Feature;

use App\Models\Admin;
use App\Models\Page;
use App\Models\PageSection;
use App\Models\ContentBlock;
use App\Models\SeoMeta;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\ContentVersion;
use App\Models\Industry;
use App\Models\UseCase;
use App\Models\Cta;
use App\Models\Role;
use App\Models\Permission;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VersioningTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->admin = Admin::factory()->create();
        $role = Role::firstOrCreate(['slug' => 'admin'], ['name' => 'Admin']);
        $permission = Permission::firstOrCreate(['slug' => 'manage_content'], ['name' => 'Manage Content']);
        $role->permissions()->syncWithoutDetaching([$permission->id]);
        $this->admin->roles()->attach($role);
    }

    public function test_can_create_version_snapshot()
    {
        $page = Page::create(['title' => 'Original', 'slug' => 'original', 'type' => 'page', 'status' => 'draft']);
        
        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson("/api/admin/pages/{$page->id}/versions");

        $response->assertStatus(201)
            ->assertJsonFragment(['version_number' => 1]);
            
        $this->assertDatabaseHas('content_versions', ['page_id' => $page->id, 'version_number' => 1]);
    }

    public function test_can_restore_version()
    {
        // 1. Create Page with Initial State (Version 1)
        $page = Page::create(['title' => 'V1 Title', 'slug' => 'v1', 'type' => 'page', 'status' => 'published']);
        
        // Setup relationships
        $category = ServiceCategory::create(['name' => 'Dev', 'slug' => 'dev']);
        $service = Service::create(['name' => 'V1 Service', 'slug' => 'v1-service', 'service_category_id' => $category->id]);
        $industry = Industry::create(['name' => 'V1 Industry', 'slug' => 'v1-industry']);
        $useCase = UseCase::create(['name' => 'V1 UseCase', 'slug' => 'v1-usecase']);
        $cta = Cta::create(['name' => 'V1 CTA', 'type' => 'button', 'content' => 'Click Me']);
        
        $page->services()->attach($service->id);
        $page->industries()->attach($industry->id);
        $page->useCases()->attach($useCase->id);
        $page->ctas()->attach($cta->id, ['placement' => 'bottom']);
        
        // Setup SEO & Content
        SeoMeta::create(['page_id' => $page->id, 'meta_title' => 'V1 SEO']);
        $page->keywords()->create(['keyword' => 'V1 Keyword', 'relevance' => 10]);
        
        $section = $page->sections()->create(['section_key' => 'hero', 'order' => 0]);
        $section->blocks()->create(['block_type' => 'text', 'content_json' => ['text' => 'V1 Content'], 'order' => 0]);

        // 2. Create Snapshot (Version 1)
        $this->actingAs($this->admin, 'sanctum')
            ->postJson("/api/admin/pages/{$page->id}/versions");

        // 3. Modify Page to New State (V2)
        $page->update(['title' => 'V2 Title']);
        $page->seo->update(['meta_title' => 'V2 SEO']);
        $page->services()->sync([]); 
        $page->industries()->sync([]);
        $page->useCases()->sync([]);
        $page->ctas()->sync([]);
        $page->keywords()->delete();
        $page->sections()->delete(); 

        // 4. Restore Version 1
        $version = ContentVersion::where('page_id', $page->id)->first();
        
        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson("/api/admin/versions/{$version->id}/restore");

        $response->assertStatus(200);

        // 5. Verify Restoration
        $page->refresh();
        $this->assertEquals('V1 Title', $page->title);
        $this->assertEquals('V1 SEO', $page->seo->meta_title);
        
        // Verify Relations
        $this->assertTrue($page->services->contains($service), 'Service not restored');
        $this->assertTrue($page->industries->contains($industry), 'Industry not restored');
        $this->assertTrue($page->useCases->contains($useCase), 'UseCase not restored');
        $this->assertTrue($page->ctas->contains($cta), 'CTA not restored');
        
        // Verify Keywords
        $this->assertEquals(1, $page->keywords()->count(), 'Keywords count mismatch');
        $this->assertEquals('V1 Keyword', $page->keywords()->first()->keyword, 'Keyword content mismatch');

        // Verify Content
        $this->assertEquals(1, $page->sections->count(), 'Sections count mismatch');
        $this->assertEquals('V1 Content', $page->sections->first()->blocks->first()->content_json['text'], 'Block content mismatch');
    }
}
