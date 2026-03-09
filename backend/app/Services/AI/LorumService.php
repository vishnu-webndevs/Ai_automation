<?php

namespace App\Services\AI;

class LorumService implements AIServiceInterface
{
    public function generatePageContent(array $context): array
    {
        $industry = $context['target_industry'] ?? 'General';
        $keyword = trim((string)($context['primary_keyword'] ?? 'AI Services'));
        $structureHint = (string)($context['page_structure'] ?? '');

        $lowerKeyword = mb_strtolower($keyword);
        $isContactPage = str_contains($lowerKeyword, 'contact')
            || str_contains($lowerKeyword, 'support')
            || str_contains($lowerKeyword, 'talk to sales')
            || str_contains(mb_strtolower($structureHint), 'contact');

        if ($isContactPage) {
            return [
                'title' => $keyword !== '' ? $keyword : 'Contact Totan.ai',
                'meta_title' => 'Contact Totan.ai | Talk to Our Team',
                'meta_description' => 'Get in touch with the Totan.ai team for demos, pricing, or support. Share your details and we will respond quickly.',
                'sections' => [
                    [
                        'section_key' => 'hero',
                        'content_blocks' => [
                            ['type' => 'heading', 'content' => 'Talk to an AI expert'],
                            ['type' => 'paragraph', 'content' => 'Share a few details about your business and our team will show you exactly how Totan.ai can help.'],
                        ],
                    ],
                    [
                        'section_key' => 'contact_details',
                        'content_blocks' => [
                            ['type' => 'heading', 'content' => 'Ways to reach us'],
                            ['type' => 'list', 'content' => [
                                'Email: hello@totan.ai',
                                'Demo requests: book a 30-minute session',
                                'Support: response within one business day',
                            ]],
                        ],
                    ],
                    [
                        'section_key' => 'cta',
                        'content_blocks' => [
                            ['type' => 'heading', 'content' => 'Ready to see Totan.ai in action?'],
                            ['type' => 'paragraph', 'content' => 'Fill in the form and we will follow up with a tailored walkthrough for your team.'],
                            ['type' => 'button', 'content' => 'Request a demo'],
                        ],
                    ],
                ],
                'faqs' => [
                    [
                        'question' => 'How quickly will someone contact me?',
                        'answer' => 'We usually respond within one business day with next steps or a demo invite.',
                    ],
                    [
                        'question' => 'Can I talk to a real person?',
                        'answer' => 'Yes. Our team will schedule a live session to understand your use case and answer questions.',
                    ],
                ],
                'internal_links' => [
                    ['text' => 'See all solutions', 'url' => '/services'],
                    ['text' => 'Learn about Totan.ai', 'url' => '/about'],
                ],
            ];
        }

        return [
            'title' => "AI Services for {$industry}",
            'meta_title' => "AI Solutions for {$industry} | Totan.ai",
            'meta_description' => "SEO-optimized AI solutions for {$industry}. Improve efficiency, reduce cost, and scale with Totan.ai.",
            'sections' => [
                [
                    'section_key' => 'hero',
                    'content_blocks' => [
                        ['type' => 'heading', 'content' => "AI {$industry} Solutions"],
                        ['type' => 'paragraph', 'content' => 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'],
                    ],
                ],
                [
                    'section_key' => 'features',
                    'content_blocks' => [
                        ['type' => 'heading', 'content' => 'Key Features'],
                        ['type' => 'list', 'content' => ['Automated Workflows', 'Smart Analytics', '24/7 Support']],
                    ],
                ],
                [
                    'section_key' => 'cta',
                    'content_blocks' => [
                        ['type' => 'heading', 'content' => 'Get Started'],
                        ['type' => 'paragraph', 'content' => 'Request a demo to see how Totan.ai can help your team.'],
                        ['type' => 'button', 'content' => 'Book a Demo'],
                    ],
                ],
            ],
            'faqs' => [
                ['question' => 'What is AI?', 'answer' => 'AI stands for Artificial Intelligence.'],
                ['question' => 'How can it help?', 'answer' => 'It automates tasks and provides insights.'],
            ],
            'internal_links' => [
                ['text' => 'Contact Us', 'url' => '/contact'],
                ['text' => 'Services', 'url' => '/services'],
            ],
        ];
    }
}
