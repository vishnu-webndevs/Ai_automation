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
                            badge: "API Studio is now in beta",
                            heading: "The API Security Framework",
                            subheading: "Our landing page template works on all devices, so you only have to set it up once, and get beautiful results forever.",
                            primary_cta: { text: "Get Started", url: "/signup" },
                            secondary_cta: { text: "Read the docs", url: "/docs" }
                        }
                    },
                    {
                        id: 2,
                        block_type: 'logo_ticker',
                        order: 2,
                        content: {
                            items: ["Facebook", "Tinder", "Airbnb", "Hubspot", "Amazon", "Tesla", "Google"]
                        }
                    },
                    {
                        id: 3,
                        block_type: 'features',
                        order: 3,
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
                        block_type: 'bento_grid',
                        order: 4,
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
                        block_type: 'mobile_section',
                        order: 5,
                        content: {
                            heading: "Spot issues faster",
                            subheading: "The security first platform",
                            description: "All the lorem ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet."
                        }
                    },
                    {
                        id: 6,
                        block_type: 'why_trust',
                        order: 6,
                        content: {
                            heading: "Why trust us?",
                            description: "Many desktop publishing packages and web page editors now use lorem ipsum as their default model text."
                        }
                    },
                    {
                        id: 7,
                        block_type: 'cta',
                        order: 7,
                        content: {
                            heading: "Ready to get started?",
                            subheading: "Join thousands of developers building secure applications.",
                            buttonText: "Get Started for Free",
                            buttonUrl: "/signup"
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
            noindex: false,
            nofollow: false,
            canonical_url: null,
            twitter_card: null,
            schema_markup: null
        }
    }
};
