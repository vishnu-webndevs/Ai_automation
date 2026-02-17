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
                                'heading' => 'Modern Blog Hero',
                                'subheading' => 'Latest insights and stories',
                                'bg_color' => 'bg-slate-900',
                                'text_color' => 'text-white',
                                'layout' => 'center'
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
                                'heading' => 'Classic Blog',
                                'subheading' => 'Timeless wisdom',
                                'layout' => 'left'
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
                                'heading' => 'Launch Your Startup',
                                'subheading' => 'The best platform for growth',
                                'cta_primary' => 'Get Started',
                                'cta_secondary' => 'Learn More',
                                'layout' => 'right'
                            ]
                        ],
                        [
                            'type' => 'features_grid',
                            'order' => 2,
                            'content' => [
                                'heading' => 'Why Choose Us',
                                'layout' => 'left',
                                'features' => [
                                    ['title' => 'Fast', 'icon' => 'zap', 'description' => 'Blazing fast performance'],
                                    ['title' => 'Secure', 'icon' => 'shield', 'description' => 'Bank-grade security'],
                                    ['title' => 'Scalable', 'icon' => 'chart', 'description' => 'Grows with you']
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
            ],
            [
                'name' => 'Home Classic',
                'slug' => 'home-classic',
                'preview_image' => 'https://placehold.co/600x400/020617/e5e7eb?text=Home+Classic+Preview',
                'config_json' => [
                    'sections' => [
                        [
                            'type' => 'hero',
                            'order' => 1,
                            'content' => [
                                'heading' => 'API Security Framework',
                                'subheading' => 'Comprehensive protection for your APIs and microservices.',
                                'cta_text' => 'Book a Demo',
                                'cta_link' => '/contact',
                                'badge' => 'Enterprise Ready'
                            ]
                        ],
                        [
                            'type' => 'features',
                            'order' => 2,
                            'content' => [
                                'title' => 'Why Teams Choose Totan.ai',
                                'features' => [
                                    [
                                        'title' => 'Real-time Protection',
                                        'description' => 'Detect and block threats instantly with AI-powered analysis.'
                                    ],
                                    [
                                        'title' => 'Compliance Automated',
                                        'description' => 'Stay compliant with GDPR, HIPAA, SOC2 without manual effort.'
                                    ],
                                    [
                                        'title' => 'Scalable Architecture',
                                        'description' => 'Scale to billions of requests with minimal latency overhead.'
                                    ]
                                ]
                            ]
                        ],
                        [
                            'type' => 'faq_list',
                            'order' => 3,
                            'content' => [
                                [
                                    'question' => 'How quickly can we get started?',
                                    'answer' => 'Most teams integrate Totan.ai into their stack within a few days.'
                                ],
                                [
                                    'question' => 'Do you support on-prem deployments?',
                                    'answer' => 'Yes, we support cloud, hybrid and on‑premise installations.'
                                ]
                            ]
                        ],
                        [
                            'type' => 'cta_bottom',
                            'order' => 4,
                            'content' => [
                                'title' => 'Ready to secure your APIs?',
                                'button_text' => 'Talk to our team'
                            ]
                        ]
                    ]
                ]
            ],
            [
                'name' => 'Totan Preview Landing',
                'slug' => 'totan-preview',
                'preview_image' => 'https://placehold.co/600x400/020617/e5e7eb?text=Totan+Preview+Landing',
                'config_json' => [
                    'sections' => [
                        [
                            'type' => 'hero',
                            'order' => 1,
                            'content' => [
                                'heading' => 'Automate tasks with purposeful AI guidance and real-time insights.',
                                'subheading' => 'Totan.ai helps you craft smarter prompts, optimize outputs, and automate workflows so your team can focus on what matters.',
                                'badge' => 'Dashboard Automation · AI Copilot',
                                'cta_text' => 'Get Started Free',
                                'cta_link' => '/signup'
                            ]
                        ],
                        [
                            'type' => 'features',
                            'order' => 2,
                            'content' => [
                                'title' => 'Why AI Feels Confusing',
                                'layout' => 'left',
                                'features' => [
                                    [
                                        'title' => 'Don’t know what to ask',
                                        'description' => 'Teams struggle to turn ideas into clear, effective prompts.'
                                    ],
                                    [
                                        'title' => 'Poor results',
                                        'description' => 'Inconsistent outputs mean more manual review and fixes.'
                                    ],
                                    [
                                        'title' => 'Time wasted',
                                        'description' => 'Trying prompts again and again kills productivity.'
                                    ],
                                    [
                                        'title' => 'Too many tools',
                                        'description' => 'Switching between dashboards and chats breaks focus.'
                                    ]
                                ]
                            ]
                        ],
                        [
                            'type' => 'features',
                            'order' => 3,
                            'content' => [
                                'title' => 'Totan.AI Makes AI Simple',
                                'layout' => 'right',
                                'features' => [
                                    [
                                        'title' => 'Smart questions',
                                        'description' => 'Guide users to describe their goals in simple language.'
                                    ],
                                    [
                                        'title' => 'Optimised prompts',
                                        'description' => 'Convert goals into structured, reusable prompt workflows.'
                                    ],
                                    [
                                        'title' => 'Automation workflows',
                                        'description' => 'Trigger actions, send data, and update tools automatically.'
                                    ]
                                ]
                            ]
                        ],
                        [
                            'type' => 'features_grid',
                            'order' => 4,
                            'content' => [
                                'heading' => 'Core Features',
                                'layout' => 'center',
                                'features' => [
                                    [
                                        'title' => 'Prompt Generator',
                                        'description' => 'Turn vague ideas into structured prompts with clear variables.'
                                    ],
                                    [
                                        'title' => 'Automation Workflows',
                                        'description' => 'Connect prompts to emails, CRMs, and internal tools.'
                                    ],
                                    [
                                        'title' => 'Templates',
                                        'description' => 'Save and reuse best performing prompts across teams.'
                                    ],
                                    [
                                        'title' => 'Prompt Improver',
                                        'description' => 'Quickly iterate on existing prompts for better results.'
                                    ],
                                    [
                                        'title' => 'Multi-AI support',
                                        'description' => 'Use multiple models without changing your workflows.'
                                    ],
                                    [
                                        'title' => 'Monitoring',
                                        'description' => 'Track usage, outputs, and performance over time.'
                                    ]
                                ]
                            ]
                        ],
                        [
                            'type' => 'features',
                            'order' => 5,
                            'content' => [
                                'title' => 'Where Totan.AI shines',
                                'layout' => 'left',
                                'features' => [
                                    [
                                        'title' => 'Marketing',
                                        'description' => 'Campaign copy, ad ideas, landing page content, and more.'
                                    ],
                                    [
                                        'title' => 'Content',
                                        'description' => 'Blogs, scripts, outlines, and educational material.'
                                    ],
                                    [
                                        'title' => 'Social Media',
                                        'description' => 'Post ideas, captions, and repurposed content at scale.'
                                    ],
                                    [
                                        'title' => 'Coaching',
                                        'description' => 'Personalised follow-up questions and action plans.'
                                    ],
                                    [
                                        'title' => 'Business Tasks',
                                        'description' => 'Reports, summaries, SOPs, and internal documentation.'
                                    ],
                                    [
                                        'title' => 'Students',
                                        'description' => 'Study plans, summaries, explanations, and revision prompts.'
                                    ]
                                ]
                            ]
                        ],
                        [
                            'type' => 'features_grid',
                            'order' => 6,
                            'content' => [
                                'heading' => 'Screenshots / UI',
                                'layout' => 'center',
                                'features' => [
                                    [
                                        'title' => 'Prompt Flow',
                                        'description' => 'Visualise each step from user input to final result.'
                                    ],
                                    [
                                        'title' => 'Workflow Builder',
                                        'description' => 'Drag-and-drop editor for automations and actions.'
                                    ],
                                    [
                                        'title' => 'Insights',
                                        'description' => 'See which prompts and workflows perform best.'
                                    ]
                                ]
                            ]
                        ],
                        [
                            'type' => 'features',
                            'order' => 7,
                            'content' => [
                                'title' => 'Why teams love Totan.AI',
                                'layout' => 'right',
                                'features' => [
                                    [
                                        'title' => 'Save time',
                                        'description' => 'Reduce manual prompting and copy-paste work.'
                                    ],
                                    [
                                        'title' => 'Better results',
                                        'description' => 'Higher quality outputs with less trial and error.'
                                    ],
                                    [
                                        'title' => 'No skills needed',
                                        'description' => 'Non-technical teams can use AI confidently.'
                                    ],
                                    [
                                        'title' => 'Faster productivity',
                                        'description' => 'Standardised workflows keep everyone aligned.'
                                    ]
                                ]
                            ]
                        ],
                        [
                            'type' => 'features_grid',
                            'order' => 8,
                            'content' => [
                                'heading' => 'Impact speaks louder',
                                'layout' => 'center',
                                'features' => [
                                    [
                                        'title' => '180k+',
                                        'description' => 'Prompts generated and optimised across teams.'
                                    ],
                                    [
                                        'title' => '128',
                                        'description' => 'Workflows automated across different tools.'
                                    ],
                                    [
                                        'title' => '99%',
                                        'description' => 'Average reduction in copy-paste busywork.'
                                    ],
                                    [
                                        'title' => '24/7',
                                        'description' => 'Always-on AI assistant for your team.'
                                    ]
                                ]
                            ]
                        ],
                        [
                            'type' => 'cta_bottom',
                            'order' => 9,
                            'content' => [
                                'title' => 'Start Free Today',
                                'subtitle' => 'Launch your first prompt workflow in minutes and upgrade only when your team is ready.',
                                'button_text' => 'Start Free Trial'
                            ]
                        ]
                    ]
                ]
            ],
            [
                'name' => 'Contact Dark',
                'slug' => 'contact-dark',
                'preview_image' => 'https://placehold.co/600x400/020617/e5e7eb?text=Contact+Dark+Preview',
                'config_json' => [
                    'sections' => [
                        [
                            'type' => 'hero',
                            'order' => 1,
                            'content' => [
                                'heading' => 'Contact our team',
                                'subheading' => 'Tell us about your use case and we will get back within 24 hours.',
                                'layout' => 'center'
                            ]
                        ],
                        [
                            'type' => 'features',
                            'order' => 2,
                            'content' => [
                                'title' => 'How we can help',
                                'features' => [
                                    [
                                        'title' => 'Product questions',
                                        'description' => 'Ask about pricing, capabilities, and implementation details.'
                                    ],
                                    [
                                        'title' => 'Integration support',
                                        'description' => 'Get help connecting Totan.ai to your tools and data.'
                                    ],
                                    [
                                        'title' => 'Partnerships',
                                        'description' => 'Discuss collaborations, reselling, or co‑marketing.'
                                    ]
                                ]
                            ]
                        ],
                        [
                            'type' => 'faq_list',
                            'order' => 3,
                            'content' => [
                                [
                                    'question' => 'How fast do you respond?',
                                    'answer' => 'Most messages get a first reply within one business day.'
                                ],
                                [
                                    'question' => 'Do you offer enterprise plans?',
                                    'answer' => 'Yes, we have custom plans for larger teams and deployments.'
                                ]
                            ]
                        ],
                        [
                            'type' => 'cta_bottom',
                            'order' => 4,
                            'content' => [
                                'title' => 'Prefer email?',
                                'button_text' => 'Email support@totan.ai'
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
