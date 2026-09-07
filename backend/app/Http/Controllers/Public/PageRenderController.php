<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\BlogCategory;
use App\Models\BlogTag;
use App\Models\Industry;
use App\Models\Integration;
use App\Models\Page;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\Solution;
use App\Models\UseCase;
use App\Services\Menus\MenuService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class PageRenderController extends Controller
{
    public function show(string $slug, MenuService $menuService)
    {
        $cleanSlug = trim($slug, '/');
        $cacheKey = 'public_page_render:' . md5($cleanSlug);

        $payload = Cache::remember($cacheKey, 600, function () use ($cleanSlug, $menuService) {
            $baseUrl = 'https://totan.ai';

            // 1. Service Category Route: services/category/{catSlug}
            if (str_starts_with($cleanSlug, 'services/category/')) {
                $categorySlug = substr($cleanSlug, 18);
                $category = ServiceCategory::where('slug', $categorySlug)->where('is_active', true)->first();
                if ($category) {
                    $canonical = $baseUrl . '/services/category/' . $category->slug;
                    $title = $category->name . ' Services';
                    $description = Str::limit($category->description ?: "Explore {$category->name} services and custom AI automations on Totan.ai.", 160);
                    
                    return $this->buildPayload(
                        $title,
                        "{$category->name} Services | Totan.ai",
                        $description,
                        $canonical,
                        'service_category',
                        $this->buildTaxonomyStructuredData($category->name, $canonical, $description, $baseUrl),
                        $menuService
                    );
                }
            }

            // 2. Service Detail Route: services/{serviceSlug}
            if (str_starts_with($cleanSlug, 'services/')) {
                $serviceSlug = substr($cleanSlug, 9);
                $service = Service::where('slug', $serviceSlug)->where('is_active', true)->first();
                if ($service) {
                    $canonical = $baseUrl . '/services/' . $service->slug;
                    $description = Str::limit($service->short_description ?: "Transform operations with {$service->name} by Totan.ai.", 160);
                    
                    return $this->buildPayload(
                        $service->name,
                        "{$service->name} | Totan.ai",
                        $description,
                        $canonical,
                        'service',
                        $this->buildServiceStructuredData($service->name, $canonical, $description, $baseUrl),
                        $menuService
                    );
                }
            }

            // 3. Industry Detail Route: industries/{indSlug}
            if (str_starts_with($cleanSlug, 'industries/')) {
                $indSlug = substr($cleanSlug, 11);
                $industry = Industry::where('slug', $indSlug)->where('is_active', true)->first();
                if ($industry) {
                    $canonical = $baseUrl . '/industries/' . $industry->slug;
                    $description = Str::limit($industry->description ?: "AI automation solutions tailored for {$industry->name} by Totan.ai.", 160);

                    return $this->buildPayload(
                        $industry->name,
                        "{$industry->name} AI Solutions | Totan.ai",
                        $description,
                        $canonical,
                        'industry',
                        $this->buildTaxonomyStructuredData($industry->name, $canonical, $description, $baseUrl),
                        $menuService
                    );
                }
            }

            // 4. Use Case Detail Route: use-cases/{useSlug}
            if (str_starts_with($cleanSlug, 'use-cases/')) {
                $useSlug = substr($cleanSlug, 10);
                $useCase = UseCase::where('slug', $useSlug)->first();
                if ($useCase && ($useCase->is_active ?? true)) {
                    $canonical = $baseUrl . '/use-cases/' . $useCase->slug;
                    $description = Str::limit($useCase->description ?: "Discover {$useCase->name} automation use cases on Totan.ai.", 160);

                    return $this->buildPayload(
                        $useCase->name,
                        "{$useCase->name} Use Case | Totan.ai",
                        $description,
                        $canonical,
                        'use_case',
                        $this->buildTaxonomyStructuredData($useCase->name, $canonical, $description, $baseUrl),
                        $menuService
                    );
                }
            }

            // 5. Solution / Tool Route: solutions/{solSlug} or tools/{solSlug}
            if (str_starts_with($cleanSlug, 'solutions/') || str_starts_with($cleanSlug, 'tools/')) {
                $parts = explode('/', $cleanSlug);
                $prefix = $parts[0];
                $solSlug = $parts[1] ?? '';
                $solution = Solution::where('slug', $solSlug)->where('is_active', true)->first();
                if ($solution) {
                    $canonical = $baseUrl . '/' . $prefix . '/' . $solution->slug;
                    $description = Str::limit($solution->description ?: "AI-powered {$solution->name} solution by Totan.ai.", 160);

                    return $this->buildPayload(
                        $solution->name,
                        "{$solution->name} | Totan.ai",
                        $description,
                        $canonical,
                        'solution',
                        $this->buildTaxonomyStructuredData($solution->name, $canonical, $description, $baseUrl),
                        $menuService
                    );
                }
            }

            // 6. Integration Detail Route: integrations/{intSlug}
            if (str_starts_with($cleanSlug, 'integrations/')) {
                $intSlug = substr($cleanSlug, 13);
                $integration = Integration::where('slug', $intSlug)->where('is_active', true)->first();
                if ($integration) {
                    $canonical = $baseUrl . '/integrations/' . $integration->slug;
                    $description = Str::limit($integration->description ?: "Seamless {$integration->name} AI integration by Totan.ai.", 160);

                    return $this->buildPayload(
                        $integration->name,
                        "{$integration->name} Integration | Totan.ai",
                        $description,
                        $canonical,
                        'integration',
                        $this->buildTaxonomyStructuredData($integration->name, $canonical, $description, $baseUrl),
                        $menuService
                    );
                }
            }

            // 7. Blog Category Route: blog/category/{bCatSlug}
            if (str_starts_with($cleanSlug, 'blog/category/')) {
                $bCatSlug = substr($cleanSlug, 14);
                $bCat = BlogCategory::where('slug', $bCatSlug)->first();
                if ($bCat && ($bCat->is_active ?? true)) {
                    $canonical = $baseUrl . '/blog/category/' . $bCat->slug;
                    $description = Str::limit($bCat->description ?: "Latest articles and insights on {$bCat->name} by Totan.ai.", 160);

                    return $this->buildPayload(
                        $bCat->name,
                        "{$bCat->name} Articles | Totan.ai",
                        $description,
                        $canonical,
                        'blog_category',
                        $this->buildTaxonomyStructuredData($bCat->name, $canonical, $description, $baseUrl),
                        $menuService
                    );
                }
            }

            // 8. Blog Tag Route: blog/tag/{bTagSlug}
            if (str_starts_with($cleanSlug, 'blog/tag/')) {
                $bTagSlug = substr($cleanSlug, 9);
                $bTag = BlogTag::where('slug', $bTagSlug)->first();
                if ($bTag && ($bTag->is_active ?? true)) {
                    $canonical = $baseUrl . '/blog/tag/' . $bTag->slug;
                    $description = "Articles tagged with #{$bTag->name} on Totan.ai.";

                    return $this->buildPayload(
                        "#" . $bTag->name,
                        "#{$bTag->name} Articles | Totan.ai",
                        $description,
                        $canonical,
                        'blog_tag',
                        $this->buildTaxonomyStructuredData('#' . $bTag->name, $canonical, $description, $baseUrl),
                        $menuService
                    );
                }
            }

            // 9. Standard Page / Blog Article Route
            $pageSlug = str_starts_with($cleanSlug, 'blog/') ? substr($cleanSlug, 5) : $cleanSlug;
            $page = Page::with(['sections.blocks', 'seo'])
                ->where('slug', $pageSlug)
                ->where('status', 'published')
                ->first();

            if ($page) {
                $prefix = $page->type === 'blog' ? '/blog/' : '/';
                $canonical = $page->seo?->canonical_url ?: ($baseUrl . $prefix . ltrim($page->slug, '/'));
                $metaTitle = $page->seo?->meta_title ?: "{$page->title} | Totan.ai";
                $metaDescription = $page->seo?->meta_description ?: Str::limit($this->extractPlainText($page), 160, '');
                $structuredData = $this->buildStructuredData($page, $canonical, $baseUrl);

                return [
                    'page' => $page,
                    'canonical' => $canonical,
                    'metaTitle' => $metaTitle,
                    'metaDescription' => $metaDescription,
                    'structuredData' => $structuredData,
                    'headerMenu' => $menuService->getMenuTreeByLocation('header'),
                    'footerMenu' => $menuService->getMenuTreeByLocation('footer'),
                ];
            }

            // 10. Fallback Static Frontend Pages (services, industries, use-cases, blog, solutions, tools, integrations, platform, etc.)
            $knownStatic = [
                'services' => 'Custom AI & Automation Services',
                'industries' => 'Industries We Empower',
                'use-cases' => 'AI & Automation Use Cases',
                'solutions' => 'Enterprise AI Solutions',
                'tools' => 'AI Tools & Utilities',
                'integrations' => 'Seamless Integrations',
                'platform' => 'Totan.ai Platform',
                'blog' => 'Blog & AI Insights',
                'contact-us' => 'Contact Us',
                'about-us' => 'About Us',
                'pricing' => 'Pricing & Plans',
                'customers' => 'Our Customers',
                'changelog' => 'Product Changelog',
            ];

            if (isset($knownStatic[$cleanSlug])) {
                $title = $knownStatic[$cleanSlug];
                $canonical = $baseUrl . '/' . $cleanSlug;
                $desc = "{$title} on Totan.ai - Custom AI agents and automation solutions.";
                return $this->buildPayload(
                    $title,
                    "{$title} | Totan.ai",
                    $desc,
                    $canonical,
                    'page',
                    $this->buildTaxonomyStructuredData($title, $canonical, $desc, $baseUrl),
                    $menuService
                );
            }

            return null;
        });

        if (!$payload) {
            return response()->view('public.page', [
                'page' => (object) ['title' => 'Page Not Found', 'sections' => collect([])],
                'canonical' => 'https://totan.ai/' . ltrim($slug, '/'),
                'metaTitle' => '404 Page Not Found | Totan.ai',
                'metaDescription' => 'The page you requested could not be found on Totan.ai.',
                'structuredData' => [
                    '@context' => 'https://schema.org',
                    '@graph' => [
                        [
                            '@type' => 'Organization',
                            'name' => 'Totan.ai',
                            'url' => 'https://totan.ai',
                        ]
                    ]
                ],
                'headerMenu' => $menuService->getMenuTreeByLocation('header'),
                'footerMenu' => $menuService->getMenuTreeByLocation('footer'),
            ], 404)->header('X-Robots-Tag', 'noindex, follow');
        }

        return response()->view('public.page', $payload);
    }

    private function buildPayload(
        string $title,
        string $metaTitle,
        string $metaDescription,
        string $canonical,
        string $type,
        array $structuredData,
        MenuService $menuService
    ): array {
        $dummyPage = (object) [
            'id' => 0,
            'title' => $title,
            'slug' => $canonical,
            'type' => $type,
            'status' => 'published',
            'sections' => collect([]),
        ];

        return [
            'page' => $dummyPage,
            'canonical' => $canonical,
            'metaTitle' => $metaTitle,
            'metaDescription' => $metaDescription,
            'structuredData' => $structuredData,
            'headerMenu' => $menuService->getMenuTreeByLocation('header'),
            'footerMenu' => $menuService->getMenuTreeByLocation('footer'),
        ];
    }

    private function buildTaxonomyStructuredData(string $title, string $canonical, string $description, string $baseUrl): array
    {
        return [
            '@context' => 'https://schema.org',
            '@graph' => [
                [
                    '@type' => 'Organization',
                    '@id' => $baseUrl . '#organization',
                    'name' => 'Totan.ai',
                    'url' => $baseUrl,
                ],
                [
                    '@type' => 'BreadcrumbList',
                    'itemListElement' => [
                        ['@type' => 'ListItem', 'position' => 1, 'name' => 'Home', 'item' => $baseUrl . '/'],
                        ['@type' => 'ListItem', 'position' => 2, 'name' => $title, 'item' => $canonical],
                    ],
                ],
                [
                    '@type' => 'WebPage',
                    'name' => $title,
                    'url' => $canonical,
                    'description' => $description,
                ]
            ],
        ];
    }

    private function buildServiceStructuredData(string $title, string $canonical, string $description, string $baseUrl): array
    {
        return [
            '@context' => 'https://schema.org',
            '@graph' => [
                [
                    '@type' => 'Organization',
                    '@id' => $baseUrl . '#organization',
                    'name' => 'Totan.ai',
                    'url' => $baseUrl,
                ],
                [
                    '@type' => 'BreadcrumbList',
                    'itemListElement' => [
                        ['@type' => 'ListItem', 'position' => 1, 'name' => 'Home', 'item' => $baseUrl . '/'],
                        ['@type' => 'ListItem', 'position' => 2, 'name' => 'Services', 'item' => $baseUrl . '/services'],
                        ['@type' => 'ListItem', 'position' => 3, 'name' => $title, 'item' => $canonical],
                    ],
                ],
                [
                    '@type' => 'Service',
                    'name' => $title,
                    'url' => $canonical,
                    'description' => $description,
                    'provider' => [
                        '@id' => $baseUrl . '#organization',
                    ],
                ]
            ],
        ];
    }

    private function buildStructuredData(Page $page, string $canonical, string $baseUrl): array
    {
        $graph = [];

        $graph[] = [
            '@type' => 'Organization',
            '@id' => $baseUrl . '#organization',
            'name' => 'Totan.ai',
            'url' => $baseUrl,
        ];

        $breadcrumbs = $this->buildBreadcrumbs($page, $canonical, $baseUrl);

        $graph[] = [
            '@type' => 'BreadcrumbList',
            'itemListElement' => $breadcrumbs,
        ];

        if ($page->type === 'service') {
            $graph[] = [
                '@type' => 'Service',
                'name' => $page->title,
                'url' => $canonical,
                'description' => $page->seo?->meta_description ?: null,
                'provider' => [
                    '@id' => $baseUrl . '#organization',
                ],
            ];
        }

        $faq = $this->extractFaqEntities($page);
        if (count($faq) > 0) {
            $graph[] = [
                '@type' => 'FAQPage',
                'mainEntity' => $faq,
            ];
        }

        $fromDb = $page->seo?->schema_json;
        if (is_array($fromDb) && count($fromDb) > 0) {
            $graph[] = $fromDb;
        }

        return [
            '@context' => 'https://schema.org',
            '@graph' => $graph,
        ];
    }

    private function buildBreadcrumbs(Page $page, string $canonical, string $baseUrl): array
    {
        $items = [];

        $items[] = [
            '@type' => 'ListItem',
            'position' => 1,
            'name' => 'Home',
            'item' => $baseUrl . '/',
        ];

        $items[] = [
            '@type' => 'ListItem',
            'position' => 2,
            'name' => $page->title,
            'item' => $canonical,
        ];

        return $items;
    }

    private function extractFaqEntities(Page $page): array
    {
        foreach ($page->sections as $section) {
            foreach ($section->blocks as $block) {
                if ($block->block_type !== 'faq_list') {
                    continue;
                }

                $faqItems = is_array($block->content_json) ? $block->content_json : [];
                $entities = [];

                foreach ($faqItems as $item) {
                    $question = is_array($item) ? ($item['question'] ?? null) : null;
                    $answer = is_array($item) ? ($item['answer'] ?? null) : null;

                    if (!$question || !$answer) {
                        continue;
                    }

                    $entities[] = [
                        '@type' => 'Question',
                        'name' => $question,
                        'acceptedAnswer' => [
                            '@type' => 'Answer',
                            'text' => $answer,
                        ],
                    ];
                }

                return $entities;
            }
        }

        return [];
    }

    private function extractPlainText(Page $page): string
    {
        $chunks = [$page->title];

        foreach ($page->sections as $section) {
            foreach ($section->blocks as $block) {
                $content = $block->content_json;
                if (is_string($content)) {
                    $chunks[] = $content;
                    continue;
                }
                if (is_array($content)) {
                    $chunks[] = json_encode($content);
                }
            }
        }

        return trim(preg_replace('/\s+/', ' ', strip_tags(implode(' ', $chunks))));
    }
}
