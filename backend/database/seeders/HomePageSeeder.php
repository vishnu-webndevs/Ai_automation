<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Page;
use App\Models\PageSection;
use App\Models\ContentBlock;
use App\Models\SeoMeta;

class HomePageSeeder extends Seeder
{
    public function run()
    {
        // 1. Create Home Page
        $page = Page::firstOrCreate(
            ['slug' => 'home'],
            [
                'title' => 'Home',
                'type' => 'landing',
                'status' => 'published',
                'template' => 'home',
            ]
        );

        // 2. SEO Meta
        SeoMeta::firstOrCreate(
            ['page_id' => $page->id],
            [
                'meta_title' => 'API Security Framework - Secure Your Digital Assets',
                'meta_description' => 'Comprehensive API security solutions for modern enterprises. Protect your data with AI-driven threat detection and automated compliance.',
            ]
        );

        // 3. Hero Section
        $heroSection = PageSection::firstOrCreate(
            ['page_id' => $page->id, 'section_key' => 'hero'],
            ['order' => 1]
        );

        ContentBlock::firstOrCreate(
            ['section_id' => $heroSection->id, 'block_type' => 'hero'],
            [
                'order' => 1,
                'content_json' => [
                    'heading' => 'Secure Your API Infrastructure',
                    'subheading' => 'Advanced protection for the modern web',
                    'cta_text' => 'Get Started',
                    'cta_link' => '/signup',
                ]
            ]
        );

        // 4. Features Section
        $featuresSection = PageSection::firstOrCreate(
            ['page_id' => $page->id, 'section_key' => 'features'],
            ['order' => 2]
        );

        ContentBlock::firstOrCreate(
            ['section_id' => $featuresSection->id, 'block_type' => 'features'],
            [
                'order' => 1,
                'content_json' => [
                    'title' => 'Why Choose Us',
                    'features' => [
                        [
                            'title' => 'Real-time Protection',
                            'description' => 'Detect and block threats instantly with AI-powered analysis.'
                        ],
                        [
                            'title' => 'Compliance Automated',
                            'description' => 'Automatically adhere to GDPR, HIPAA, and SOC2 standards.'
                        ],
                        [
                            'title' => 'Scalable Architecture',
                            'description' => 'Built to handle billions of requests with zero latency impact.'
                        ]
                    ]
                ]
            ]
        );
    }
}
