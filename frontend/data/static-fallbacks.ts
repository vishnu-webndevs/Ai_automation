import { Page } from '../types';

export const STATIC_PAGES: Record<string, Page> = {
    'home': {
        id: 1,
        title: 'Home',
        slug: 'home',
        status: 'published',
        template_slug: 'default',
        sections: [
            {
                id: 1,
                name: 'Main Section',
                type: 'full-width',
                content: {},
                order: 1,
                blocks: [
                    {
                        id: 1,
                        block_type: 'hero',
                        order: 1,
                        content: {
                            badge: 'AI Solutions for the Future',
                            heading: 'Empower Your Business with AI Automation',
                            subheading: 'Totan.ai offers cutting-edge AI automation services designed to streamline operations, reduce operational costs, and drive unprecedented growth for your business.',
                            primary_cta: { text: 'Get Started', url: '/signup' },
                            secondary_cta: { text: 'Explore Services', url: '/services' }
                        }
                    },
                    {
                        id: 2,
                        block_type: 'logo_ticker',
                        order: 2,
                        content: {
                            items: ['Microsoft', 'OpenAI', 'Google Cloud', 'AWS', 'Meta', 'Hugging Face', 'Anthropic']
                        }
                    },
                    {
                        id: 3,
                        block_type: 'features',
                        order: 3,
                        content: {
                            heading: 'Transform your workflow with intelligent automation',
                            subheading: 'Leverage state-of-the-art machine learning models to automate repetitive tasks, extract valuable insights from data, and provide personalized customer experiences 24/7.',
                            items: [
                                { title: 'Seamless Integration', description: 'Easily integrate our AI solutions into your existing ecosystem without disruption.' },
                                { title: 'Data-Driven Insights', description: 'Make smarter business decisions with predictive analytics and deep learning.' },
                                { title: '24/7 AI Agents', description: 'Automate customer support and internal workflows with tireless digital agents.' }
                            ]
                        }
                    },
                    {
                        id: 4,
                        block_type: 'bento_grid',
                        order: 4,
                        content: {
                            heading: 'Smarter. Faster. Better.',
                            subheading: "By integrating custom AI agents and automation pipelines, you can scale operations securely and interact with customers proactively.",
                            items: [
                                {
                                    title: 'Custom AI Agents',
                                    description: 'Deploy bespoke AI agents trained on your proprietary data to automate customer inquiries, document processing, and more.',
                                    colSpan: 8,
                                    ctaText: 'Learn more',
                                    ctaUrl: '/services'
                                },
                                {
                                    title: 'Process Automation',
                                    description: 'Eliminate manual bottlenecks and accelerate your entire operational workflow.',
                                    colSpan: 4
                                }
                            ]
                        }
                    },
                    {
                        id: 45,
                        block_type: 'latest_services',
                        order: 4.5,
                        content: {
                            heading: 'Explore Our AI Services',
                            count: 3
                        }
                    },
                    {
                        id: 5,
                        block_type: 'mobile_section',
                        order: 5,
                        content: {
                            heading: 'Stay ahead of the curve',
                            subheading: 'The AI-first platform',
                            description: 'Totan.ai ensures your business remains competitive by constantly updating our models to provide the most innovative capabilities in natural language processing and computer vision.'
                        }
                    },
                    {
                        id: 6,
                        block_type: 'why_trust',
                        order: 6,
                        content: {
                            heading: 'Why trust Totan.ai?',
                            description: 'We prioritize data security and system reliability while delivering top-tier performance, helping hundreds of businesses transition into the AI-first era securely.'
                        }
                    },
                    {
                        id: 7,
                        block_type: 'cta',
                        order: 7,
                        content: {
                            heading: 'Ready to automate?',
                            subheading: 'Join the hundreds of forward-thinking businesses upgrading their operations with Totan.ai.',
                            buttonText: 'Get Started for Free',
                            buttonUrl: '/signup'
                        }
                    }
                ]
            }
        ],
        seo_meta: {
            id: 1,
            meta_title: 'Totan AI | Custom AI Agents & Automation Solutions',
            meta_description: 'Totan AI builds custom artificial intelligence, ML agents, and scalable automation pipelines to revolutionize your business operations.',
            og_title: 'Totan AI | Intelligent Automation',
            og_description: 'Totan AI builds custom artificial intelligence, ML agents, and scalable automation pipelines to revolutionize your business operations.',
            og_image: '',
            noindex: false,
            nofollow: false,
            canonical_url: null,
            twitter_card: null,
            schema_markup: null
        }
    }
};
