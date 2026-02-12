<?php

namespace Tests\Feature;

use App\Models\Admin;
use App\Models\MediaAsset;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class MediaTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Setup Admin with Permissions
        $this->admin = Admin::factory()->create();
        $role = Role::firstOrCreate(['slug' => 'admin'], ['name' => 'Admin']);
        
        // Create permission if it doesn't exist (it should be seeded, but for test isolation)
        $permission = Permission::firstOrCreate(['slug' => 'manage_media'], ['name' => 'Manage Media']);
        $role->permissions()->syncWithoutDetaching([$permission->id]);
        
        $this->admin->roles()->attach($role);
    }

    public function test_can_list_media()
    {
        MediaAsset::create([
            'file_name' => 'test.jpg',
            'original_name' => 'test.jpg',
            'mime_type' => 'image/jpeg',
            'size_bytes' => 1024,
            'alt_text' => 'Test Image',
            'path' => 'uploads/test.jpg',
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/admin/media');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'file_name', 'url', 'alt_text']
                ],
                'current_page',
                'total'
            ]);
    }

    public function test_can_upload_media()
    {
        Storage::fake('public');
        
        // Use create() instead of image() to avoid GD requirement
        $file = UploadedFile::fake()->create('test-upload.jpg', 100, 'image/jpeg');

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/admin/media', [
                'file' => $file,
                'alt_text' => 'Uploaded Image'
            ]);

        $response->assertStatus(201)
            ->assertJsonFragment(['alt_text' => 'Uploaded Image']);
            
        // Assert the file was stored...
        // Note: The controller logic determines the path. 
        // We can check if database has the record.
        $this->assertDatabaseHas('media_assets', [
            'original_name' => 'test-upload.jpg',
            'alt_text' => 'Uploaded Image'
        ]);
    }

    public function test_can_update_media_details()
    {
        $media = MediaAsset::create([
            'file_name' => 'update-test.jpg',
            'original_name' => 'update-test.jpg',
            'mime_type' => 'image/jpeg',
            'size_bytes' => 1024,
            'alt_text' => 'Old Alt Text',
            'path' => 'uploads/update-test.jpg',
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->patchJson("/api/admin/media/{$media->id}", [
                'alt_text' => 'New Alt Text'
            ]);

        $response->assertStatus(200)
            ->assertJsonFragment(['alt_text' => 'New Alt Text']);
            
        $this->assertDatabaseHas('media_assets', [
            'id' => $media->id,
            'alt_text' => 'New Alt Text'
        ]);
    }

    public function test_can_delete_media()
    {
        Storage::fake('public');
        
        $media = MediaAsset::create([
            'file_name' => 'delete-test.jpg',
            'original_name' => 'delete-test.jpg',
            'mime_type' => 'image/jpeg',
            'size_bytes' => 1024,
            'alt_text' => 'Delete Me',
            'path' => 'uploads/delete-test.jpg',
        ]);
        
        // Create a fake file to be deleted
        Storage::disk('public')->put('uploads/delete-test.jpg', 'content');

        $response = $this->actingAs($this->admin, 'sanctum')
            ->deleteJson("/api/admin/media/{$media->id}");

        $response->assertStatus(200); // Controller returns 200 with {deleted: true}
        
        $this->assertDatabaseMissing('media_assets', ['id' => $media->id]);
        Storage::disk('public')->assertMissing('uploads/delete-test.jpg');
    }
}
