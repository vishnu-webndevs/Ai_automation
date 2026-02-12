<?php

namespace Database\Seeders;

use App\Models\Admin;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        // Define all permissions
        $permissionsList = [
            'manage_pages' => 'Manage Pages',
            'generate_content' => 'Generate Content',
            'manage_taxonomy' => 'Manage Taxonomy',
            'manage_blog' => 'Manage Blog',
            'manage_menus' => 'Manage Menus',
            'manage_media' => 'Manage Media',
            'publish_page' => 'Publish Page',
            'generate_ai' => 'Generate AI',
            'manage_seo' => 'Manage SEO',
            'manage_redirects' => 'Manage Redirects',
            'manage_schema' => 'Manage Schema',
            'manage_ctas' => 'Manage CTAs',
            'manage_users' => 'Manage Users',
            'restore_versions' => 'Restore Versions',
            'manage_content' => 'Manage Content',
            'manage_settings' => 'Manage Settings',
        ];

        $permissions = [];
        foreach ($permissionsList as $slug => $name) {
            $permissions[$slug] = Permission::firstOrCreate(['slug' => $slug], ['name' => $name]);
        }

        // Define Roles and their permissions
        $rolesDefinitions = [
            'super_admin' => [
                'name' => 'Super Admin',
                'permissions' => array_keys($permissionsList), // All permissions
            ],
            'content_manager' => [
                'name' => 'Content Manager',
                'permissions' => ['generate_content', 'publish_page', 'generate_ai', 'manage_media', 'manage_menus', 'restore_versions'],
            ],
            'seo_manager' => [
                'name' => 'SEO Manager',
                'permissions' => ['manage_redirects', 'manage_schema', 'generate_content'], // Added generate_content as they might need to edit content for SEO
            ],
            'media_manager' => [
                'name' => 'Media Manager',
                'permissions' => ['manage_media'],
            ],
        ];

        foreach ($rolesDefinitions as $slug => $data) {
            $role = Role::firstOrCreate(['slug' => $slug], ['name' => $data['name']]);
            
            $permissionIds = [];
            foreach ($data['permissions'] as $permSlug) {
                if (isset($permissions[$permSlug])) {
                    $permissionIds[] = $permissions[$permSlug]->id;
                }
            }
            $role->permissions()->syncWithoutDetaching($permissionIds);
        }

        // Create Super Admin User
        $admin = Admin::firstOrCreate(
            ['email' => 'admin@totan.ai'],
            ['name' => 'Totan Admin', 'password' => Hash::make('Admin123!')]
        );

        $superAdminRole = Role::where('slug', 'super_admin')->first();
        if ($superAdminRole) {
            $admin->roles()->syncWithoutDetaching([$superAdminRole->id]);
        }
    }
}
