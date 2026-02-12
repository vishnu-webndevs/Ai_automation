<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Faker\Factory as Faker;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\ServiceFeature;
use App\Models\Industry;
use App\Models\UseCase;
use App\Models\BlogCategory;
use App\Models\BlogTag;
use App\Models\Page;
use App\Models\Redirect;
use App\Models\InternalLink;
use App\Models\SeoMeta;
use App\Models\SchemaMarkup;
use App\Models\Cta;
use App\Models\Menu;
use App\Models\MenuItem;
use App\Models\MediaAsset;
use App\Models\User;
use App\Models\Admin;

class ComprehensiveSeeder extends Seeder
{
    public function run()
    {
        $faker = Faker::create();

        // 1. Service Categories (5 records)
        $serviceCategories = [];
        for ($i = 0; $i < 5; $i++) {
            $name = $faker->unique()->words(2, true) . ' Services';
            $serviceCategories[] = ServiceCategory::firstOrCreate(
                ['slug' => Str::slug($name)],
                [
                    'name' => ucfirst($name),
                    'description' => $faker->sentence(),
                    'is_active' => true,
                ]
            );
        }

        // 2. Services (15 records)
        $services = [];
        foreach ($serviceCategories as $category) {
            for ($i = 0; $i < 3; $i++) {
                $name = $faker->unique()->catchPhrase();
                $service = Service::firstOrCreate(
                    ['slug' => Str::slug($name)],
                    [
                        'service_category_id' => $category->id,
                        'name' => $name,
                        'short_description' => $faker->sentence(),
                        'full_description' => $faker->paragraphs(3, true),
                        'is_active' => $faker->boolean(90),
                    ]
                );
                $services[] = $service;

                // Service Features (3-5 per service)
                for ($j = 0; $j < $faker->numberBetween(3, 5); $j++) {
                    ServiceFeature::create([
                        'service_id' => $service->id,
                        'title' => $faker->words(3, true),
                        'description' => $faker->sentence(),
                        'icon' => 'check-circle',
                        'sort_order' => $j,
                    ]);
                }
            }
        }

        // 3. Industries (12 records)
        $industries = [];
        $industryNames = [
            'Fintech', 'Healthcare', 'E-commerce', 'Real Estate', 'Logistics', 
            'EdTech', 'AgriTech', 'Manufacturing', 'Retail', 'Travel', 'Energy', 'Legal'
        ];
        foreach ($industryNames as $name) {
            $industries[] = Industry::firstOrCreate(
                ['slug' => Str::slug($name)],
                [
                    'name' => $name,
                    'description' => $faker->paragraph(),
                    'is_active' => true,
                ]
            );
        }

        // 4. Use Cases (15 records)
        $useCases = [];
        for ($i = 0; $i < 15; $i++) {
            $name = $faker->unique()->bs();
            $useCases[] = UseCase::firstOrCreate(
                ['slug' => Str::slug($name)],
                [
                    'name' => ucwords($name),
                    'description' => $faker->paragraph(),
                ]
            );
        }

        // 5. Blog Categories (8 records)
        $blogCategories = [];
        for ($i = 0; $i < 8; $i++) {
            $name = $faker->unique()->word() . ' ' . $faker->word();
            $blogCategories[] = BlogCategory::firstOrCreate(
                ['slug' => Str::slug($name)],
                [
                    'name' => ucwords($name),
                    'description' => $faker->sentence(),
                ]
            );
        }

        // 6. Blog Tags (20 records)
        $blogTags = [];
        for ($i = 0; $i < 20; $i++) {
            $name = $faker->unique()->word();
            $blogTags[] = BlogTag::firstOrCreate(
                ['slug' => Str::slug($name)],
                ['name' => ucfirst($name)]
            );
        }

        // 7. Pages & Blogs (Total ~30 records)
        // Create 10 static pages
        for ($i = 0; $i < 10; $i++) {
            $title = $faker->unique()->sentence(3);
            $page = Page::firstOrCreate(
                ['slug' => Str::slug($title)],
                [
                    'title' => trim($title, '.'),
                    'type' => 'static',
                    'status' => $faker->randomElement(['published', 'draft', 'scheduled']),
                    'template' => 'default',
                ]
            );
            
            // Attach relationships randomly
            if ($faker->boolean(70)) {
                $page->services()->sync($faker->randomElements($services, rand(1, 3)));
            }
            if ($faker->boolean(70)) {
                $page->industries()->sync($faker->randomElements($industries, rand(1, 2)));
            }
            
            // SEO Meta
            SeoMeta::firstOrCreate(
                ['page_id' => $page->id],
                [
                    'meta_title' => $page->title . ' | Totan AI',
                    'meta_description' => $faker->text(160),
                    'meta_keywords' => implode(', ', $faker->words(5)),
                    'canonical_url' => 'https://totan.ai/' . $page->slug,
                    // 'og_title' => $page->title, // Removed
                    // 'og_description' => $faker->text(160), // Removed
                    // 'indexable' => $faker->boolean(90), // Removed
                ]
            );
        }

        // Create 20 blog posts
        foreach (range(1, 20) as $index) {
            $title = $faker->unique()->realText(50);
            $page = Page::firstOrCreate(
                ['slug' => Str::slug($title)],
                [
                    'title' => trim($title, '.'),
                    'type' => 'blog',
                    'status' => $faker->randomElement(['published', 'draft', 'archived']),
                    'template' => 'blog-post',
                ]
            );

            // Attach Blog Taxonomy
            $page->blogCategories()->sync($faker->randomElements($blogCategories, 1));
            $page->blogTags()->sync($faker->randomElements($blogTags, rand(2, 5)));

            // SEO Meta
            SeoMeta::firstOrCreate(
                ['page_id' => $page->id],
                [
                    'meta_title' => $page->title,
                    'meta_description' => $faker->text(150),
                ]
            );
        }

        // 8. Redirects (15 records)
        // Mix of 301, 302, 410, active/inactive, loops
        for ($i = 0; $i < 15; $i++) {
            Redirect::firstOrCreate(
                ['source_url' => '/' . $faker->slug(2)],
                [
                    'target_url' => '/' . $faker->slug(2),
                    'status_code' => $faker->randomElement([301, 302, 307]),
                    'is_active' => $faker->boolean(80),
                ]
            );
        }

        // 9. Internal Links (30 records)
        $allPages = Page::all();
        if ($allPages->count() > 5) {
            for ($i = 0; $i < 30; $i++) {
                $source = $allPages->random();
                $target = $allPages->where('id', '!=', $source->id)->random();
                
                InternalLink::firstOrCreate(
                    [
                        'source_page_id' => $source->id,
                        'target_page_id' => $target->id,
                    ],
                    [
                        'anchor_text' => $faker->words(rand(2, 5), true),
                        'auto_generated' => $faker->boolean(30),
                    ]
                );
            }
        }

        // 10. Schemas (10 records)
        $schemaTypes = ['Article', 'Organization', 'Product', 'FAQPage', 'BreadcrumbList'];
        foreach ($allPages->random(min(10, $allPages->count())) as $page) {
            SchemaMarkup::firstOrCreate(
                ['page_id' => $page->id],
                [
                    'type' => $faker->randomElement($schemaTypes),
                    'schema_json' => json_encode([
                        '@context' => 'https://schema.org',
                        '@type' => 'WebPage',
                        'name' => $page->title,
                        'description' => $faker->sentence(),
                        'url' => 'https://totan.ai/' . $page->slug,
                    ]),
                ]
            );
        }

        // 11. CTAs (10 records)
        for ($i = 0; $i < 10; $i++) {
            Cta::firstOrCreate(
                ['name' => 'CTA ' . $faker->word()],
                [
                    // 'type' => ... (removed)
                    'content' => $faker->sentence(),
                    'button_text' => $faker->word(),
                    'link' => '/contact',
                    'active_status' => true,
                ]
            );
        }

        // 12. Menus (3 records: Main, Footer, Sidebar)
        $menuLocations = ['header-main', 'footer-primary', 'sidebar-quick'];
        foreach ($menuLocations as $location) {
            $menu = Menu::firstOrCreate(
                ['location' => $location],
                [
                    'name' => ucfirst(str_replace('-', ' ', $location)),
                    'slug' => Str::slug($location),
                ]
            );
            
            // Add items
            for ($j = 0; $j < 5; $j++) {
                MenuItem::firstOrCreate(
                    [
                        'menu_id' => $menu->id, 
                        'label' => $faker->word()
                    ],
                    [
                        'custom_url' => '/' . $faker->slug(),
                        'order' => $j,
                        // 'target' => '_self', // Removed
                    ]
                );
            }
        }
        
        // 13. Media Assets (Mock Data) (20 records)
        for ($i = 0; $i < 20; $i++) {
            $type = $faker->randomElement(['image', 'document', 'video']);
            $ext = $type === 'image' ? 'jpg' : ($type === 'video' ? 'mp4' : 'pdf');
            $fileName = $faker->uuid() . '.' . $ext;
            MediaAsset::firstOrCreate(
                ['file_name' => $fileName],
                [
                    'path' => 'uploads/' . $faker->year() . '/' . $faker->month() . '/' . $fileName,
                    'original_name' => $faker->words(3, true) . '.' . $ext,
                    'mime_type' => $type . '/' . $ext,
                    'size_bytes' => $faker->numberBetween(1000, 5000000),
                    'alt_text' => $faker->sentence(),
                ]
            );
        }
        
        // 14. Admin Users (5 Extra Admins)
        for ($i = 0; $i < 5; $i++) {
            Admin::firstOrCreate(
                ['email' => $faker->unique()->companyEmail()],
                [
                    'name' => $faker->name(),
                    'password' => bcrypt('password'),
                    // Role and permissions would be handled by pivot tables usually, 
                    // assuming basic setup here or relying on default nulls
                ]
            );
        }
    }
}
