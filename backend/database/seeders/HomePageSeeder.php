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
                'meta_title' => 'Totan.ai – AI Automation for Real-World Workflows',
                'meta_description' => 'Design, run, and monitor AI-powered automations across your tools without extra engineering.',
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
                    'heading' => 'Automate work with AI, not manual tasks',
                    'subheading' => 'Totan.ai turns your existing tools and processes into smart, end-to-end automations.',
                    'cta_text' => 'Get Started Free',
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
                    'title' => 'Why teams automate with Totan.ai',
                    'features' => [
                        [
                            'title' => 'Automate repetitive work',
                            'description' => 'Replace manual copy-paste, updates, and approvals with reliable AI workflows.'
                        ],
                        [
                            'title' => 'Connect your tools',
                            'description' => 'Plug into the CRMs, support tools, docs, and data sources you already use.'
                        ],
                        [
                            'title' => 'Stay in control',
                            'description' => 'Review, approve, and monitor every automation with clear guardrails and audit trails.'
                        ]
                    ]
                ]
            ]
        );
    }
}
