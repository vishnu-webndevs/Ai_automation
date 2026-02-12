<?php

namespace Tests\Feature;

use App\Models\Admin;
use App\Models\ContentBlock;
use App\Models\MediaAsset;
use App\Models\Page;
use App\Models\PageSection;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class MediaLibraryTest extends TestCase
{
    use RefreshDatabase;

    private function tinyPng(): UploadedFile
    {
        $png = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO7+oYcAAAAASUVORK5CYII=');
        return UploadedFile::fake()->createWithContent('test.png', $png);
    }

    private function actingAsAdminWithPermissions(array $permissionSlugs): Admin
    {
        $role = Role::create(['name' => 'Admin', 'slug' => 'admin']);

        $permissionIds = [];
        foreach ($permissionSlugs as $slug) {
            $permission = Permission::create(['name' => $slug, 'slug' => $slug]);
            $permissionIds[] = $permission->id;
        }
        $role->permissions()->attach($permissionIds);

        $admin = Admin::create([
            'name' => 'Test Admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
        ]);
        $admin->roles()->attach($role->id);

        Sanctum::actingAs($admin);
        return $admin;
    }

    public function test_media_upload_requires_alt_and_creates_asset(): void
    {
        $this->actingAsAdminWithPermissions(['manage_media']);
        Storage::fake('public');

        $this->withHeaders(['Accept' => 'application/json'])->post('/api/admin/media', [
            'file' => $this->tinyPng(),
        ])->assertStatus(422);

        $res = $this->withHeaders(['Accept' => 'application/json'])->post('/api/admin/media', [
            'file' => $this->tinyPng(),
            'alt_text' => 'A descriptive alt text',
        ])->assertCreated();

        $payload = $res->json();
        $this->assertNotEmpty($payload['id']);
        $this->assertSame('A descriptive alt text', $payload['alt_text']);

        Storage::disk('public')->assertExists("media/{$payload['id']}/original.png");
    }

    public function test_usage_scan_detects_image_block_media_id(): void
    {
        $this->actingAsAdminWithPermissions(['manage_media']);
        Storage::fake('public');

        $media = MediaAsset::create([
            'disk' => 'public',
            'path' => 'media/1/original.jpg',
            'file_name' => 'original.jpg',
            'alt_text' => 'Alt',
            'size_bytes' => 0,
        ]);

        $page = Page::create(['title' => 'Test', 'slug' => 'test', 'type' => 'service', 'status' => 'draft']);
        $section = PageSection::create(['page_id' => $page->id, 'section_key' => 'hero', 'order' => 0]);

        ContentBlock::create([
            'section_id' => $section->id,
            'block_type' => 'image',
            'content_json' => ['media_id' => $media->id, 'src' => "/storage/media/{$media->id}/original.jpg"],
            'order' => 0,
        ]);

        $this->postJson('/api/admin/media/scan-usage')->assertOk()->assertJson([
            'created' => 1,
        ]);

        $list = $this->getJson('/api/admin/media')->assertOk()->json();
        $this->assertGreaterThan(0, $list['data'][0]['usages_count']);
    }

    public function test_publishing_fails_when_image_alt_missing(): void
    {
        $this->actingAsAdminWithPermissions(['generate_content']);

        $media = MediaAsset::create([
            'disk' => 'public',
            'path' => 'media/1/original.jpg',
            'file_name' => 'original.jpg',
            'alt_text' => '',
            'size_bytes' => 0,
        ]);

        $page = Page::create(['title' => 'Alt Gate', 'slug' => 'alt-gate', 'type' => 'service', 'status' => 'draft']);
        $section = PageSection::create(['page_id' => $page->id, 'section_key' => 'hero', 'order' => 0]);

        ContentBlock::create([
            'section_id' => $section->id,
            'block_type' => 'image',
            'content_json' => ['media_id' => $media->id, 'src' => "/storage/media/{$media->id}/original.jpg"],
            'order' => 0,
        ]);

        $this->postJson("/api/admin/pages/{$page->id}/toggle-publish")->assertStatus(422);
    }
}

