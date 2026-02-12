<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Page;
use App\Services\Menus\MenuService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class PageRenderController extends Controller
{
    public function show(string $slug, MenuService $menuService)
    {
        $cacheKey = 'public_page_render:' . $slug;

        $payload = Cache::remember($cacheKey, 600, function () use ($slug, $menuService) {
            $page = Page::with(['sections.blocks', 'seo'])
                ->where('slug', $slug)
                ->where('status', 'published')
                ->firstOrFail();

            $baseUrl = rtrim(env('PUBLIC_SITE_URL', config('app.url')), '/');
            $canonical = $page->seo?->canonical_url ?: ($baseUrl . '/' . ltrim($page->slug, '/'));

            $metaTitle = $page->seo?->meta_title ?: $page->title;
            $metaDescription = $page->seo?->meta_description ?: Str::limit($this->extractPlainText($page), 160, '');

            $structuredData = $this->buildStructuredData($page, $canonical, $baseUrl);
            $headerMenu = $menuService->getMenuTreeByLocation('header');
            $footerMenu = $menuService->getMenuTreeByLocation('footer');

            return [
                'page' => $page,
                'canonical' => $canonical,
                'metaTitle' => $metaTitle,
                'metaDescription' => $metaDescription,
                'structuredData' => $structuredData,
                'headerMenu' => $headerMenu,
                'footerMenu' => $footerMenu,
            ];
        });

        return response()->view('public.page', $payload);
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

