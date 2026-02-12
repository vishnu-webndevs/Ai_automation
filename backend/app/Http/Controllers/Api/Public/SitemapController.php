<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Page;
use App\Models\SitemapCache;
use Illuminate\Support\Facades\Cache;

class SitemapController extends Controller
{
    public function index()
    {
        $xml = Cache::remember('public_sitemap_xml', 3600, function () {
            $baseUrl = rtrim(env('PUBLIC_SITE_URL', config('app.url')), '/');
            
            // Try getting from SitemapCache first
            $sitemapItems = SitemapCache::all();

            $urls = [];

            if ($sitemapItems->isNotEmpty()) {
                foreach ($sitemapItems as $item) {
                    $urls[] = [
                        'loc' => $item->url,
                        'lastmod' => optional($item->last_modified)->toAtomString(),
                        'changefreq' => $item->change_freq,
                        'priority' => $item->priority,
                    ];
                }
            } else {
                // Fallback to live Page data
                $pages = Page::query()
                    ->select(['id', 'slug', 'updated_at'])
                    ->where('status', 'published')
                    ->whereDoesntHave('seo', function ($q) {
                        $q->where('noindex', true);
                    })
                    ->orderBy('updated_at', 'desc')
                    ->get();

                foreach ($pages as $page) {
                    $loc = $baseUrl . '/' . ltrim($page->slug, '/');
                    $lastmod = optional($page->updated_at)->toAtomString();

                    $urls[] = [
                        'loc' => $loc,
                        'lastmod' => $lastmod,
                    ];
                }
            }

            return view('public.sitemap', [
                'urls' => $urls,
            ])->render();
        });

        return response($xml, 200)->header('Content-Type', 'application/xml; charset=UTF-8');
    }
}

