import { Page } from '../types';

export const STATIC_PAGES: Record<string, Page> = {
    'home': {
        id: 1,
        title: 'Home',
        slug: 'home',
        status: 'published',
        template: 'default',
        sections: [
            {
                id: 1,
                page_id: 1,
                type: 'full-width',
                sort_order: 1,
                blocks: [
                    {
                        id: 1,
                        section_id: 1,
                        block_type: 'hero',
                        sort_order: 1,
                        content: {
                            badge: "API Studio is now in beta",
                            heading: "The API Security Framework",
                            subheading: "Our landing page template works on all devices, so you only have to set it up once, and get beautiful results forever.",
                            primary_cta: { text: "Get Started", url: "/signup" },
                            secondary_cta: { text: "Read the docs", url: "/docs" }
                        }
                    },
                    {
                        id: 2,
                        section_id: 1,
                        block_type: 'logo_ticker',
                        sort_order: 2,
                        content: {
                            items: ["Facebook", "Tinder", "Airbnb", "Hubspot", "Amazon", "Tesla", "Google"]
                        }
                    },
                    {
                        id: 3,
                        section_id: 1,
                        block_type: 'features',
                        sort_order: 3,
                        content: {
                            heading: "Simplify your security with authentication services",
                            subheading: "Define access roles for the end-users, and extend your authorization capabilities to implement dynamic access control.",
                            items: [
                                { title: 'Simplify your security', description: '' },
                                { title: 'Customer identity', description: '' },
                                { title: 'Adaptable authentication', description: '' }
                            ]
                        }
                    },
                    {
                        id: 4,
                        section_id: 1,
                        block_type: 'bento_grid',
                        sort_order: 4,
                        content: {
                            heading: "Faster. Smarter.",
                            subheading: "There are many variations available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable.",
                            items: [
                                {
                                    title: "Optimized for security",
                                    description: "Optimize for user experience and privacy. Use social login integrations, lower user friction, incorporate rich user profiling.",
                                    colSpan: 8,
                                    ctaText: "Learn more",
                                    ctaUrl: "#"
                                },
                                {
                                    title: "Extensibility",
                                    description: "Your login box must find the right balance between user convenience, privacy and security.",
                                    colSpan: 4
                                }
                            ]
                        }
                    },
                    {
                        id: 5,
                        section_id: 1,
                        block_type: 'mobile_section',
                        sort_order: 5,
                        content: {
                            heading: "Spot issues faster",
                            subheading: "The security first platform",
                            description: "All the lorem ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet."
                        }
                    },
                    {
                        id: 6,
                        section_id: 1,
                        block_type: 'why_trust',
                        sort_order: 6,
                        content: {
                             heading: "Why trust us?",
                             description: "Many desktop publishing packages and web page editors now use lorem ipsum as their default model text."
                        }
                    },
                    {
                        id: 7,
                        section_id: 1,
                        type: 'pricing',
                        sort_order: 7,
                        content: {
                            heading: "Flexible plans and features",
                            subheading: "All the lorem ipsum generators on the Internet tend to repeat predefined chunks as necessary.",
                            plans: [
                                { 
                                    name: 'Pro', 
                                    price: 24, 
                                    desc: 'Everything at your fingertips.', 
                                    features: ['100 Placeholder text', '4 Placeholder text', 'Unlimited', '1 Placeholder'],
                                    featured: false,
                                    cta_text: 'Get Started',
                                    cta_url: '/signup'
                                },
                                { 
                                    name: 'Team', 
                                    price: 49, 
                                    desc: 'Everything at your fingertips.', 
                                    features: ['Unlimited Placeholder', 'Unlimited Placeholder', 'Unlimited', '5 Placeholder', 'Early Access'],
                                    featured: true,
                                    cta_text: 'Get Started',
                                    cta_url: '/signup'
                                },
                                { 
                                    name: 'Enterprise', 
                                    price: 79, 
                                    desc: 'Everything at your fingertips.', 
                                    features: ['Unlimited', 'Unlimited', 'Unlimited', 'Unlimited', '24/7 Support'],
                                    featured: false,
                                    cta_text: 'Get Started',
                                    cta_url: '/contact'
                                }
                            ]
                        }
                    },
                    {
                        id: 8,
                        section_id: 1,
                        type: 'testimonials',
                        sort_order: 8,
                        content: {
                            items: [
                                {
                                    quote: "As a busy professional, I don't have a lot of time to devote to working out. But with this fitness program, I have seen amazing results in just a few short weeks. The workouts are efficient and effective.",
                                    author: "Jeff Kahl",
                                    role: "Appy Product Lead",
                                    image: "https://picsum.photos/100/100"
                                }
                            ]
                        }
                    }
                ]
            }
        ],
        seo_meta: {
            id: 1,
            meta_title: "API Security Framework | Totan AI",
            meta_description: "The most secure API framework for modern applications.",
            og_title: "API Security Framework",
            og_description: "Secure your APIs with Totan AI.",
            og_image: "",
            no_index: false,
            no_follow: false
        }
    }
};
