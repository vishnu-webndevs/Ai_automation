<?php

namespace App\Http\Controllers\Api\Admin\Seo;

use App\Http\Controllers\Controller;
use App\Models\Page;
use App\Models\SitemapCache;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\URL;

class SitemapController extends Controller
{
    public function index()
    {
        $count = SitemapCache::count();
        $lastRebuilt = SitemapCache::orderBy('updated_at', 'desc')->value('updated_at');

        $frontendBase = rtrim(env('FRONTEND_URL', env('PUBLIC_SITE_URL', config('app.url'))), '/');
        $sitemapUrl = $frontendBase . '/sitemap.xml';

        return response()->json([
            'page_count' => $count,
            'last_rebuilt' => $lastRebuilt,
            'url' => $sitemapUrl,
        ]);
    }

    public function rebuild()
    {
        // Clear existing cache
        SitemapCache::truncate();
        \Illuminate\Support\Facades\Cache::forget('public_sitemap_xml');

        $count = 0;

        // Process Pages
        Page::where('status', 'published')->chunk(100, function ($pages) use (&$count) {
            $frontendUrl = rtrim(env('FRONTEND_URL', 'https://totan.ai'), '/');
            $data = [];
            foreach ($pages as $page) {
                $data[] = [
                    'url' => $frontendUrl . '/' . $page->slug,
                    'last_modified' => $page->updated_at,
                    'change_freq' => 'weekly', // Default
                    'priority' => 0.8, // Default
                    'type' => 'page',
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
                $count++;
            }
            SitemapCache::insert($data);
        });

        // Add logic here for other content types (Services, Industries, Blogs) if they have separate public URLs
        // For now, assuming they are all Pages or covered by Page model.
        // If Services have their own dedicated non-Page route, add them here.
        // But the master plan implies everything is a Page or linked to a Page.

        return response()->json(['message' => 'Sitemap rebuilt successfully', 'items_processed' => $count]);
    }
}
