<?php

namespace Tests\Feature;

use App\Models\Admin;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AiGenerationTest extends TestCase
{
    use RefreshDatabase;

    private function createAdminWithRole(): Admin
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

        return $admin;
    }

    public function test_admin_can_generate_lorum_content(): void
    {
        $admin = $this->createAdminWithRole();
        Sanctum::actingAs($admin);

        $page = $this->postJson('/api/admin/pages', [
            'title' => 'Test Page',
            'type' => 'service',
            'status' => 'draft',
        ])->assertCreated()->json();

        $this->postJson('/api/admin/ai/generate-page', [
            'page_id' => $page['id'],
            'primary_keyword' => 'AI Call Center Services',
            'target_industry' => 'Healthcare',
            'tone' => 'Professional',
            'content_length' => 'Long',
            'model' => 'lorum',
            'confirm_overwrite' => true,
        ])->assertOk()->assertJsonStructure([
            'message',
            'data' => [
                'id',
                'title',
                'slug',
                'sections',
                'seo',
            ],
        ]);

        $this->assertDatabaseHas('seo_meta', ['page_id' => $page['id']]);
        $this->assertDatabaseHas('ai_generation_logs', ['page_id' => $page['id'], 'response_status' => 'success']);
    }

    public function test_regeneration_requires_overwrite_confirmation(): void
    {
        $admin = $this->createAdminWithRole();
        Sanctum::actingAs($admin);

        $page = $this->postJson('/api/admin/pages', [
            'title' => 'Overwrite Test',
            'type' => 'service',
            'status' => 'draft',
        ])->assertCreated()->json();

        $payload = [
            'page_id' => $page['id'],
            'primary_keyword' => 'AI Call Center Services',
            'target_industry' => 'Healthcare',
            'tone' => 'Professional',
            'content_length' => 'Long',
            'model' => 'lorum',
        ];

        $this->postJson('/api/admin/ai/generate-page', $payload + ['confirm_overwrite' => true])->assertOk();
        $this->postJson('/api/admin/ai/generate-page', $payload)->assertStatus(409);
    }

    public function test_admin_routes_require_authentication(): void
    {
        $this->postJson('/api/admin/pages', [
            'title' => 'Unauthorized',
            'type' => 'service',
            'status' => 'draft',
        ])->assertStatus(401);
    }
}

