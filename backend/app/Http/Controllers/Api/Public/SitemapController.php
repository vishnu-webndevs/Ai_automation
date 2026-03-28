<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\BlogCategory;
use App\Models\Industry;
use App\Models\Integration;
use App\Models\Page;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\Solution;
use App\Models\UseCase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;

class SitemapController extends Controller
{
    public function index()
    {
        $generate = function () {
            try {
                $baseUrl = rtrim(env('FRONTEND_URL') ?: env('PUBLIC_SITE_URL') ?: request()->getSchemeAndHttpHost(), '/');

                $safeReport = function (\Throwable $e): void {
                    try {
                        report($e);
                    } catch (\Throwable $ignored) {
                    }
                };

                $toXml = function (array $urls): string {
                    $lines = [
                        '<?xml version="1.0" encoding="UTF-8"?>',
                        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
                    ];

                    foreach ($urls as $url) {
                        $loc = isset($url['loc']) ? (string) $url['loc'] : '';
                        $loc = rtrim($loc, '/');
                        if ($loc === '') {
                            continue;
                        }

                        $lines[] = '  <url>';
                        $lines[] = '    <loc>' . htmlspecialchars($loc, ENT_XML1 | ENT_QUOTES, 'UTF-8') . '</loc>';

                        $lastmod = $url['lastmod'] ?? null;
                        if (!empty($lastmod)) {
                            $lines[] = '    <lastmod>' . htmlspecialchars((string) $lastmod, ENT_XML1 | ENT_QUOTES, 'UTF-8') . '</lastmod>';
                        }

                        $lines[] = '  </url>';
                    }

                    $lines[] = '</urlset>';
                    return implode("\n", $lines);
                };

                $selectColumns = function (string $table, array $columns): array {
                    $selected = [];
                    foreach ($columns as $column) {
                        if (Schema::hasColumn($table, $column)) {
                            $selected[] = $column;
                        }
                    }
                    return $selected;
                };

                $applyIsActiveFilter = function ($query, string $table) {
                    if (Schema::hasTable($table) && Schema::hasColumn($table, 'is_active')) {
                        $query->where('is_active', true);
                    }
                    return $query;
                };

                $urlsByLoc = [];

                $addUrl = function (string $loc, $lastmod = null) use (&$urlsByLoc) {
                    $loc = rtrim($loc, '/');
                    if ($loc === '') return;
                    if (isset($urlsByLoc[$loc])) return;
                    $urlsByLoc[$loc] = [
                        'loc' => $loc,
                        'lastmod' => $lastmod,
                    ];
                };

                if (Schema::hasTable('pages') && Schema::hasColumn('pages', 'slug')) {
                    $pageColumns = $selectColumns('pages', ['id', 'slug', 'updated_at']);
                    $pagesQuery = Page::query()->select($pageColumns);

                    if (Schema::hasColumn('pages', 'status')) {
                        $pagesQuery->where('status', 'published');
                    }

                    if (Schema::hasTable('seo_meta') && Schema::hasColumn('seo_meta', 'noindex')) {
                        $pagesQuery->whereDoesntHave('seo', function ($q) {
                            $q->where('noindex', true);
                        });
                    }

                    if (Schema::hasColumn('pages', 'updated_at')) {
                        $pagesQuery->orderBy('updated_at', 'desc');
                    }

                    $pages = $pagesQuery->get();

                    foreach ($pages as $page) {
                        $loc = $baseUrl . '/' . ltrim($page->slug, '/');
                        $lastmod = Schema::hasColumn('pages', 'updated_at') ? optional($page->updated_at)->toAtomString() : null;
                        $addUrl($loc, $lastmod);
                    }
                }

                if (Schema::hasTable('services') && Schema::hasColumn('services', 'slug')) {
                    $servicesColumns = $selectColumns('services', ['slug', 'updated_at']);
                    $servicesQuery = $applyIsActiveFilter(Service::query(), 'services')->select($servicesColumns);
                    if (Schema::hasColumn('services', 'updated_at')) {
                        $servicesQuery->orderBy('updated_at', 'desc');
                    }
                    $services = $servicesQuery->get();

                    foreach ($services as $service) {
                        $addUrl(
                            $baseUrl . '/services/' . ltrim($service->slug, '/'),
                            Schema::hasColumn('services', 'updated_at') ? optional($service->updated_at)->toAtomString() : null
                        );
                    }
                }

                if (Schema::hasTable('service_categories') && Schema::hasColumn('service_categories', 'slug')) {
                    $serviceCategoryColumns = $selectColumns('service_categories', ['slug', 'updated_at']);
                    $serviceCategoriesQuery = $applyIsActiveFilter(ServiceCategory::query(), 'service_categories')->select($serviceCategoryColumns);
                    if (Schema::hasColumn('service_categories', 'updated_at')) {
                        $serviceCategoriesQuery->orderBy('updated_at', 'desc');
                    }
                    $serviceCategories = $serviceCategoriesQuery->get();

                    foreach ($serviceCategories as $category) {
                        $addUrl(
                            $baseUrl . '/services/category/' . ltrim($category->slug, '/'),
                            Schema::hasColumn('service_categories', 'updated_at') ? optional($category->updated_at)->toAtomString() : null
                        );
                    }
                }

                if (Schema::hasTable('industries') && Schema::hasColumn('industries', 'slug')) {
                    $industryColumns = $selectColumns('industries', ['slug', 'updated_at']);
                    $industriesQuery = $applyIsActiveFilter(Industry::query(), 'industries')->select($industryColumns);
                    if (Schema::hasColumn('industries', 'updated_at')) {
                        $industriesQuery->orderBy('updated_at', 'desc');
                    }
                    $industries = $industriesQuery->get();

                    foreach ($industries as $industry) {
                        $addUrl(
                            $baseUrl . '/industries/' . ltrim($industry->slug, '/'),
                            Schema::hasColumn('industries', 'updated_at') ? optional($industry->updated_at)->toAtomString() : null
                        );
                    }
                }

                if (Schema::hasTable('use_cases') && Schema::hasColumn('use_cases', 'slug')) {
                    $useCaseColumns = $selectColumns('use_cases', ['slug', 'updated_at']);
                    $useCasesQuery = $applyIsActiveFilter(UseCase::query(), 'use_cases')->select($useCaseColumns);
                    if (Schema::hasColumn('use_cases', 'updated_at')) {
                        $useCasesQuery->orderBy('updated_at', 'desc');
                    }
                    $useCases = $useCasesQuery->get();

                    foreach ($useCases as $useCase) {
                        $addUrl(
                            $baseUrl . '/use-cases/' . ltrim($useCase->slug, '/'),
                            Schema::hasColumn('use_cases', 'updated_at') ? optional($useCase->updated_at)->toAtomString() : null
                        );
                    }
                }

                if (Schema::hasTable('solutions') && Schema::hasColumn('solutions', 'slug')) {
                    $solutionColumns = $selectColumns('solutions', ['slug', 'updated_at']);
                    $solutionsQuery = $applyIsActiveFilter(Solution::query(), 'solutions')->select($solutionColumns);
                    if (Schema::hasColumn('solutions', 'updated_at')) {
                        $solutionsQuery->orderBy('updated_at', 'desc');
                    }
                    $solutions = $solutionsQuery->get();

                    foreach ($solutions as $solution) {
                        $addUrl(
                            $baseUrl . '/solutions/' . ltrim($solution->slug, '/'),
                            Schema::hasColumn('solutions', 'updated_at') ? optional($solution->updated_at)->toAtomString() : null
                        );
                    }
                }

                if (Schema::hasTable('integrations') && Schema::hasColumn('integrations', 'slug')) {
                    $integrationColumns = $selectColumns('integrations', ['slug', 'updated_at']);
                    $integrationsQuery = $applyIsActiveFilter(Integration::query(), 'integrations')->select($integrationColumns);
                    if (Schema::hasColumn('integrations', 'updated_at')) {
                        $integrationsQuery->orderBy('updated_at', 'desc');
                    }
                    $integrations = $integrationsQuery->get();

                    foreach ($integrations as $integration) {
                        $addUrl(
                            $baseUrl . '/integrations/' . ltrim($integration->slug, '/'),
                            Schema::hasColumn('integrations', 'updated_at') ? optional($integration->updated_at)->toAtomString() : null
                        );
                    }
                }

                if (Schema::hasTable('blog_categories') && Schema::hasColumn('blog_categories', 'slug')) {
                    $blogCategoryColumns = $selectColumns('blog_categories', ['slug', 'updated_at']);
                    $blogCategoriesQuery = $applyIsActiveFilter(BlogCategory::query(), 'blog_categories')->select($blogCategoryColumns);
                    if (Schema::hasColumn('blog_categories', 'updated_at')) {
                        $blogCategoriesQuery->orderBy('updated_at', 'desc');
                    }
                    $blogCategories = $blogCategoriesQuery->get();

                    foreach ($blogCategories as $blogCategory) {
                        $addUrl(
                            $baseUrl . '/blog/category/' . ltrim($blogCategory->slug, '/'),
                            Schema::hasColumn('blog_categories', 'updated_at') ? optional($blogCategory->updated_at)->toAtomString() : null
                        );
                    }
                }

                return $toXml(array_values($urlsByLoc));
            } catch (\Throwable $e) {
                try {
                    report($e);
                } catch (\Throwable $ignored) {
                }
                $baseUrl = rtrim(env('FRONTEND_URL') ?: env('PUBLIC_SITE_URL') ?: request()->getSchemeAndHttpHost(), '/');
                return '<?xml version="1.0" encoding="UTF-8"?>' . "\n"
                    . '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n"
                    . '  <url>' . "\n"
                    . '    <loc>' . htmlspecialchars(rtrim($baseUrl, '/'), ENT_XML1 | ENT_QUOTES, 'UTF-8') . '</loc>' . "\n"
                    . '    <lastmod>' . htmlspecialchars(now()->toAtomString(), ENT_XML1 | ENT_QUOTES, 'UTF-8') . '</lastmod>' . "\n"
                    . '  </url>' . "\n"
                    . '</urlset>';
            }
        };

        try {
            $xml = Cache::remember('public_sitemap_xml', 600, $generate);
        } catch (\Throwable $e) {
            try {
                report($e);
            } catch (\Throwable $ignored) {
            }
            $xml = $generate();
        }

        return response($xml, 200)->header('Content-Type', 'application/xml; charset=UTF-8');
    }
}
