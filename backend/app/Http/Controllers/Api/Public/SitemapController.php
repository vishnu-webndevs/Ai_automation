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
        $xml = Cache::remember('public_sitemap_xml', 600, function () {
            $baseUrl = rtrim(env('FRONTEND_URL', env('PUBLIC_SITE_URL', config('app.url'))), '/');

            $applyIsActiveFilter = function ($query, string $table) {
                if (Schema::hasColumn($table, 'is_active')) {
                    $query->where('is_active', true);
                }
                return $query;
            };

            $pages = Page::query()
                ->select(['id', 'slug', 'updated_at'])
                ->where('status', 'published')
                ->whereDoesntHave('seo', function ($q) {
                    $q->where('noindex', true);
                })
                ->orderBy('updated_at', 'desc')
                ->get();

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

            foreach ($pages as $page) {
                $loc = $baseUrl . '/' . ltrim($page->slug, '/');
                $lastmod = optional($page->updated_at)->toAtomString();
                $addUrl($loc, $lastmod);
            }

            $services = $applyIsActiveFilter(Service::query(), 'services')
                ->select(['slug', 'updated_at'])
                ->orderBy('updated_at', 'desc')
                ->get();

            foreach ($services as $service) {
                $addUrl($baseUrl . '/services/' . ltrim($service->slug, '/'), optional($service->updated_at)->toAtomString());
            }

            $serviceCategories = $applyIsActiveFilter(ServiceCategory::query(), 'service_categories')
                ->select(['slug', 'updated_at'])
                ->orderBy('updated_at', 'desc')
                ->get();

            foreach ($serviceCategories as $category) {
                $addUrl($baseUrl . '/services/category/' . ltrim($category->slug, '/'), optional($category->updated_at)->toAtomString());
            }

            $industries = $applyIsActiveFilter(Industry::query(), 'industries')
                ->select(['slug', 'updated_at'])
                ->orderBy('updated_at', 'desc')
                ->get();

            foreach ($industries as $industry) {
                $addUrl($baseUrl . '/industries/' . ltrim($industry->slug, '/'), optional($industry->updated_at)->toAtomString());
            }

            $useCases = $applyIsActiveFilter(UseCase::query(), 'use_cases')
                ->select(['slug', 'updated_at'])
                ->orderBy('updated_at', 'desc')
                ->get();

            foreach ($useCases as $useCase) {
                $addUrl($baseUrl . '/use-cases/' . ltrim($useCase->slug, '/'), optional($useCase->updated_at)->toAtomString());
            }

            $solutions = $applyIsActiveFilter(Solution::query(), 'solutions')
                ->select(['slug', 'updated_at'])
                ->orderBy('updated_at', 'desc')
                ->get();

            foreach ($solutions as $solution) {
                $addUrl($baseUrl . '/solutions/' . ltrim($solution->slug, '/'), optional($solution->updated_at)->toAtomString());
            }

            $integrations = $applyIsActiveFilter(Integration::query(), 'integrations')
                ->select(['slug', 'updated_at'])
                ->orderBy('updated_at', 'desc')
                ->get();

            foreach ($integrations as $integration) {
                $addUrl($baseUrl . '/integrations/' . ltrim($integration->slug, '/'), optional($integration->updated_at)->toAtomString());
            }

            $blogCategories = $applyIsActiveFilter(BlogCategory::query(), 'blog_categories')
                ->select(['slug', 'updated_at'])
                ->orderBy('updated_at', 'desc')
                ->get();

            foreach ($blogCategories as $blogCategory) {
                $addUrl($baseUrl . '/blog/category/' . ltrim($blogCategory->slug, '/'), optional($blogCategory->updated_at)->toAtomString());
            }

            return view('public.sitemap', [
                'urls' => array_values($urlsByLoc),
            ])->render();
        });

        return response($xml, 200)->header('Content-Type', 'application/xml; charset=UTF-8');
    }
}
