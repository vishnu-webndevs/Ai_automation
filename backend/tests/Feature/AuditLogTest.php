<?php

namespace Tests\Feature;

use App\Models\Admin;
use App\Models\AuditLog;
use App\Models\Page;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuditLogTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Setup Admin with Permissions
        $this->admin = Admin::factory()->create();
        $role = Role::firstOrCreate(['slug' => 'admin'], ['name' => 'Admin']);
        
        $permission = Permission::firstOrCreate(['slug' => 'manage_settings'], ['name' => 'Manage Settings']);
        $role->permissions()->syncWithoutDetaching([$permission->id]);
        
        // Also need manage_content to update page
        $contentPermission = Permission::firstOrCreate(['slug' => 'manage_content'], ['name' => 'Manage Content']);
        $role->permissions()->syncWithoutDetaching([$contentPermission->id]);

        $this->admin->roles()->attach($role);
    }

    public function test_audit_log_created_on_page_update()
    {
        $page = Page::create(['title' => 'Original Title', 'slug' => 'original-slug', 'type' => 'page', 'status' => 'draft']);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->patchJson("/api/admin/pages/{$page->id}", ['title' => 'New Title']);

        $response->assertStatus(200);

        // Verify Audit Log
        $this->assertDatabaseHas('audit_logs', [
            'entity_type' => Page::class,
            'entity_id' => $page->id,
            'action_type' => 'updated',
            'admin_id' => $this->admin->id,
        ]);

        $log = AuditLog::where('entity_id', $page->id)->where('action_type', 'updated')->first();
        $this->assertNotNull($log);
        $this->assertStringContainsString('Original Title', $log->change_summary ?? json_encode($log->old_values));
        $this->assertStringContainsString('New Title', $log->change_summary ?? json_encode($log->new_values));
    }

    public function test_can_list_audit_logs()
    {
        // Create some logs manually or via action
        AuditLog::create([
            'admin_id' => $this->admin->id,
            'action_type' => 'created',
            'entity_type' => Page::class,
            'entity_id' => 1,
            'change_summary' => json_encode(['title' => 'New Page']),
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/admin/audit-logs');

        $response->assertStatus(200)
            ->assertJsonStructure(['data' => ['*' => ['id', 'admin_id', 'action_type', 'entity_type', 'change_summary']]]);
    }

    public function test_can_filter_audit_logs()
    {
        AuditLog::create([
            'admin_id' => $this->admin->id,
            'action_type' => 'deleted',
            'entity_type' => Page::class,
            'entity_id' => 1,
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/admin/audit-logs?action_type=deleted');

        $response->assertStatus(200)
            ->assertJsonFragment(['action_type' => 'deleted']);
    }
}
