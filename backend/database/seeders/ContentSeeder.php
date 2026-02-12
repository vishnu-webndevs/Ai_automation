<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Service;
use App\Models\Industry;
use App\Models\UseCase;
use App\Models\BlogCategory;
use App\Models\BlogTag;
use App\Models\Page;
use App\Models\Redirect;
use App\Models\InternalLink;
use App\Models\SeoMeta;
use Illuminate\Support\Str;

use App\Models\ServiceCategory;

class ContentSeeder extends Seeder
{
    public function run()
    {
        // 0. Service Category
        $category = ServiceCategory::firstOrCreate(
            ['slug' => 'core-services'],
            [
                'name' => 'Core Services',
                'description' => 'Main offerings',
                'is_active' => true,
            ]
        );

        // 1. Services
        $services = [
            ['name' => 'Web Development', 'description' => 'Custom high-performance websites.'],
            ['name' => 'Mobile App Development', 'description' => 'Native and cross-platform mobile apps.'],
            ['name' => 'AI Solutions', 'description' => 'Machine learning and AI integration.'],
            ['name' => 'Cloud Infrastructure', 'description' => 'Scalable cloud architecture.'],
            ['name' => 'Data Analytics', 'description' => 'Actionable insights from your data.'],
        ];

        foreach ($services as $service) {
            Service::firstOrCreate(
                ['slug' => Str::slug($service['name'])],
                [
                    'service_category_id' => $category->id,
                    'name' => $service['name'],
                    'short_description' => $service['description'],
                    'full_description' => $service['description'],
                    'is_active' => true,
                ]
            );
        }

        // 2. Industries
        $industries = [
            ['name' => 'Fintech', 'description' => 'Financial technology solutions.'],
            ['name' => 'Healthcare', 'description' => 'Digital health and patient management.'],
            ['name' => 'E-commerce', 'description' => 'Online retail and shopping platforms.'],
            ['name' => 'Real Estate', 'description' => 'Property management and listing systems.'],
        ];

        foreach ($industries as $ind) {
            Industry::firstOrCreate(
                ['slug' => Str::slug($ind['name'])],
                [
                    'name' => $ind['name'],
                    'description' => $ind['description'],
                    'is_active' => true,
                ]
            );
        }

        // 3. Use Cases
        $useCases = [
            ['name' => 'Customer Support Automation', 'description' => 'AI chatbots for 24/7 support.'],
            ['name' => 'Predictive Maintenance', 'description' => 'IoT sensors to predict failures.'],
            ['name' => 'Fraud Detection', 'description' => 'Real-time transaction monitoring.'],
        ];

        foreach ($useCases as $uc) {
            UseCase::firstOrCreate(
                ['slug' => Str::slug($uc['name'])],
                [
                    'name' => $uc['name'],
                    'description' => $uc['description'],
                    // 'is_active' => true, // Column does not exist
                ]
            );
        }

        // 4. Blog Categories
        $categories = ['Tech Trends', 'Case Studies', 'Company News'];
        $catIds = [];
        foreach ($categories as $cat) {
            $c = BlogCategory::firstOrCreate(
                ['slug' => Str::slug($cat)],
                ['name' => $cat]
            );
            $catIds[] = $c->id;
        }

        // 5. Blog Tags
        $tags = ['AI', 'React', 'Laravel', 'Cloud', 'Startup'];
        foreach ($tags as $tag) {
            BlogTag::firstOrCreate(
                ['slug' => Str::slug($tag)],
                ['name' => $tag]
            );
        }

        // 6. Blog Posts (Pages with type='blog')
        $blogs = [
            [
                'title' => 'The Future of AI in 2025',
                'excerpt' => 'Exploring how AI will transform industries.',
                'status' => 'published',
            ],
            [
                'title' => 'How We Scaled to 1M Users',
                'excerpt' => 'A technical deep dive into our architecture.',
                'status' => 'published',
            ],
            [
                'title' => '5 Best Practices for React Security',
                'excerpt' => 'Keep your frontend secure with these tips.',
                'status' => 'draft',
            ],
        ];

        foreach ($blogs as $index => $blog) {
            $slug = Str::slug($blog['title']);
            $page = Page::firstOrCreate(
                ['slug' => $slug],
                [
                    'title' => $blog['title'],
                    'type' => 'blog',
                    'status' => $blog['status'],
                    'template' => 'default',
                    // 'published_at' removed as it's not in schema
                ]
            );

            // Attach category
            $page->blogCategories()->syncWithoutDetaching([$catIds[$index % count($catIds)]]);

            // Create SeoMeta for the blog
            SeoMeta::firstOrCreate(
                ['page_id' => $page->id],
                [
                    'meta_title' => $blog['title'],
                    'meta_description' => $blog['excerpt'],
                ]
            );
        }

        // 7. Redirects
        Redirect::firstOrCreate(
            ['source_url' => '/old-pricing'],
            ['target_url' => '/pricing', 'status_code' => 301, 'is_active' => true]
        );
        Redirect::firstOrCreate(
            ['source_url' => '/services/web-design'],
            ['target_url' => '/services/web-development', 'status_code' => 301, 'is_active' => true]
        );

        // 8. Internal Links (Sample)
        // Need IDs of existing pages. Let's pick two random published pages.
        $pages = Page::where('status', 'published')->take(2)->get();
        if ($pages->count() >= 2) {
            InternalLink::firstOrCreate(
                [
                    'source_page_id' => $pages[0]->id,
                    'target_page_id' => $pages[1]->id,
                ],
                [
                    'anchor_text' => 'Read more about ' . $pages[1]->title,
                    'auto_generated' => false,
                ]
            );
        }
    }
}
