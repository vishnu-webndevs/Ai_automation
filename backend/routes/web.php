<?php

use App\Http\Controllers\Public\PageRenderController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json(['message' => 'API is running']);
});

Route::get('/robots.txt', function () {
    $host = request()->getHost();
    
    // Disallow admin and api subdomains specifically
    if ($host === 'api.totan.ai' || $host === 'admin.totan.ai') {
        return response("User-agent: *\nDisallow: /\n", 200)->header('Content-Type', 'text/plain; charset=UTF-8');
    }

    $baseUrl = env('FRONTEND_URL') ?: env('PUBLIC_SITE_URL');
    if (!$baseUrl || str_contains($baseUrl, 'api.totan.ai')) {
        $baseUrl = 'https://totan.ai';
    }
    $sitemapUrl = rtrim($baseUrl, '/') . '/sitemap.index.xml';

    return response("User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\nSitemap: {$sitemapUrl}\n", 200)->header('Content-Type', 'text/plain; charset=UTF-8');
});

Route::get('/sitemap.index.xml', [\App\Http\Controllers\Api\Public\SitemapController::class, 'index']);
Route::get('/sitemap-index.xml', [\App\Http\Controllers\Api\Public\SitemapController::class, 'index']);
Route::get('/sitemap.xml', [\App\Http\Controllers\Api\Public\SitemapController::class, 'index']);
Route::get('/sitemap.xsl', [\App\Http\Controllers\Api\Public\SitemapController::class, 'xsl']);
Route::get('/sitemaps/{name}.xml', [\App\Http\Controllers\Api\Public\SitemapController::class, 'show']);

Route::get('/{slug}', [PageRenderController::class, 'show'])
    ->where('slug', '^(?!api|up|robots\.txt|sitemap.*\.xml|sitemap\.xsl|sitemaps/).*$');
