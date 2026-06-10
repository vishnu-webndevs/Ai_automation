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
    },
    'about-us': {
        id: 4,
        title: 'About Us',
        slug: 'about-us',
        status: 'published',
        template_slug: undefined,
        sections: [
            {
                id: 51,
                name: 'Hero',
                type: 'full-width',
                content: {},
                order: 0,
                blocks: [
                    {
                        id: 80,
                        block_type: 'heading',
                        order: 0,
                        content: 'Welcome to Our Company' as any
                    },
                    {
                        id: 81,
                        block_type: 'paragraph',
                        order: 1,
                        content: 'Learn more about our story, our mission, and the values that drive us towards excellence. We are committed to delivering top-notch services across various industries.' as any
                    }
                ]
            },
            {
                id: 52,
                name: 'Features',
                type: 'default',
                content: {},
                order: 1,
                blocks: [
                    {
                        id: 82,
                        block_type: 'heading',
                        order: 0,
                        content: 'What Sets Us Apart' as any
                    },
                    {
                        id: 83,
                        block_type: 'list',
                        order: 1,
                        content: [
                            'Exceptional Customer Service',
                            'Innovative Solutions',
                            'Proven Expertise',
                            'Sustainable Practices'
                        ] as any
                    }
                ]
            },
            {
                id: 53,
                name: 'CTA',
                type: 'full-width',
                content: {},
                order: 2,
                blocks: [
                    {
                        id: 84,
                        block_type: 'heading',
                        order: 0,
                        content: 'Join Us on Our Journey' as any
                    },
                    {
                        id: 85,
                        block_type: 'paragraph',
                        order: 1,
                        content: 'We invite you to explore our services and discover how we can make a difference together. Connect with us today to learn more.' as any
                    },
                    {
                        id: 86,
                        block_type: 'button',
                        order: 2,
                        content: {
                            url: '/contact',
                            label: 'Contact Us'
                        } as any
                    }
                ]
            },
            {
                id: 54,
                name: 'FAQs',
                type: 'default',
                content: {},
                order: 1000,
                blocks: [
                    {
                        id: 87,
                        block_type: 'faq_list',
                        order: 0,
                        content: [
                            {
                                question: 'What is your mission?',
                                answer: 'Our mission is to provide innovative solutions that enhance the lives of our customers while ensuring sustainable and ethical business practices.'
                            },
                            {
                                question: 'How can I get in touch with you?',
                                answer: 'You can contact us via the contact form on our website or call us at our customer service number available on the contact page.'
                            }
                        ] as any
                    }
                ]
            },
            {
                id: 55,
                name: 'Internal Links',
                type: 'default',
                content: {},
                order: 1001,
                blocks: [
                    {
                        id: 88,
                        block_type: 'internal_links',
                        order: 0,
                        content: [
                            { url: '/services', text: 'Our Services' },
                            { url: '/contact', text: 'Contact' }
                        ] as any
                    }
                ]
            }
        ],
        seo_meta: {
            id: 10,
            meta_title: 'About Us - Professional Overview',
            meta_description: 'Discover who we are, our mission, and the values that guide us. Learn more about our journey.',
            canonical_url: null,
            og_title: 'About Us - Professional Overview',
            og_description: 'Discover who we are, our mission, and the values that guide us. Learn more about our journey.',
            og_image: null,
            twitter_card: null,
            noindex: false,
            nofollow: false,
            schema_markup: null
        }
    }
};
