<?php

namespace Database\Seeders;

use App\Models\PageTemplate;
use Illuminate\Database\Seeder;

class PageTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $templates = [
            [
                'name' => 'Blog Modern',
                'slug' => 'blog-modern',
                'preview_image' => 'https://placehold.co/600x400/e2e8f0/1e293b?text=Blog+Modern+Preview',
                'config_json' => [
                    'sections' => [
                        [
                            'type' => 'hero',
                            'order' => 1,
                            'content' => [
                                'title' => 'Modern Blog Hero',
                                'subtitle' => 'Latest insights and stories',
                                'bg_color' => 'bg-slate-900',
                                'text_color' => 'text-white'
                            ]
                        ],
                        [
                            'type' => 'blog-grid',
                            'order' => 2,
                            'content' => [
                                'columns' => 3,
                                'show_categories' => true
                            ]
                        ],
                        [
                            'type' => 'newsletter',
                            'order' => 3,
                            'content' => [
                                'title' => 'Subscribe to our newsletter',
                                'button_text' => 'Join Now'
                            ]
                        ]
                    ]
                ]
            ],
            [
                'name' => 'Blog Classic',
                'slug' => 'blog-classic',
                'preview_image' => 'https://placehold.co/600x400/f8fafc/475569?text=Blog+Classic+Preview',
                'config_json' => [
                    'sections' => [
                        [
                            'type' => 'hero_simple',
                            'order' => 1,
                            'content' => [
                                'title' => 'Classic Blog',
                                'subtitle' => 'Timeless wisdom'
                            ]
                        ],
                        [
                            'type' => 'blog-list',
                            'order' => 2,
                            'content' => [
                                'sidebar' => true,
                                'pagination' => true
                            ]
                        ]
                    ]
                ]
            ],
            [
                'name' => 'Landing Startup',
                'slug' => 'landing-startup',
                'preview_image' => 'https://placehold.co/600x400/0f172a/cbd5e1?text=Landing+Startup+Preview',
                'config_json' => [
                    'sections' => [
                        [
                            'type' => 'hero_split',
                            'order' => 1,
                            'content' => [
                                'title' => 'Launch Your Startup',
                                'subtitle' => 'The best platform for growth',
                                'cta_primary' => 'Get Started',
                                'cta_secondary' => 'Learn More'
                            ]
                        ],
                        [
                            'type' => 'features_grid',
                            'order' => 2,
                            'content' => [
                                'title' => 'Why Choose Us',
                                'features' => [
                                    ['title' => 'Fast', 'icon' => 'zap'],
                                    ['title' => 'Secure', 'icon' => 'shield'],
                                    ['title' => 'Scalable', 'icon' => 'chart']
                                ]
                            ]
                        ],
                        [
                            'type' => 'pricing',
                            'order' => 3,
                            'content' => [
                                'plans' => ['Starter', 'Pro', 'Enterprise']
                            ]
                        ],
                        [
                            'type' => 'cta_bottom',
                            'order' => 4,
                            'content' => [
                                'title' => 'Ready to begin?',
                                'button_text' => 'Sign Up Now'
                            ]
                        ]
                    ]
                ]
            ]
        ];

        foreach ($templates as $template) {
            PageTemplate::updateOrCreate(
                ['slug' => $template['slug']],
                $template
            );
        }
    }
}
