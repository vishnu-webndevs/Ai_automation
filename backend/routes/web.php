<?php

use App\Http\Controllers\Public\PageRenderController;
use Illuminate\Support\Facades\Route;

// Redirect www.totan.ai (and any www.* subdomains) -> totan.ai (301 Moved Permanently)
$host = request()->getHost() ?: (request()->header('host') ?? '');
if (str_starts_with(strtolower($host), 'www.')) {
    $targetHost = preg_replace('/^www\./i', '', $host);
    $scheme = request()->getScheme() ?: 'https';
    return redirect()->to("{$scheme}://{$targetHost}" . request()->getRequestUri(), 301);
}

// Add noindex header to api and admin subdomains
if (in_array(request()->getHost(), ['api.totan.ai', 'admin.totan.ai'], true)) {
    header('X-Robots-Tag: noindex, nofollow', true);
}

Route::get('/', function () {
    $host = request()->getHost();
    if ($host === 'api.totan.ai' || $host === 'admin.totan.ai') {
        return response()->json(['message' => 'API is running'], 200, ['X-Robots-Tag' => 'noindex, nofollow']);
    }
    return response()->json(['message' => 'API is running']);
});

Route::get('/robots.txt', function () {
    $host = request()->getHost();
    
    // Disallow admin and api subdomains specifically
    if ($host === 'api.totan.ai' || $host === 'admin.totan.ai') {
        return response("User-agent: *\nDisallow: /\n", 200)
            ->header('Content-Type', 'text/plain; charset=UTF-8')
            ->header('X-Robots-Tag', 'noindex, nofollow');
    }

    $baseUrl = env('FRONTEND_URL') ?: env('PUBLIC_SITE_URL');
    if (!$baseUrl || str_contains($baseUrl, 'api.totan.ai')) {
        $baseUrl = 'https://totan.ai';
    }
    $sitemapUrl = rtrim($baseUrl, '/') . '/sitemap.xml';

    return response("User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\nSitemap: {$sitemapUrl}\n", 200)->header('Content-Type', 'text/plain; charset=UTF-8');
});

Route::get('/sitemap.index.xml', [\App\Http\Controllers\Api\Public\SitemapController::class, 'index']);
Route::get('/sitemap-index.xml', [\App\Http\Controllers\Api\Public\SitemapController::class, 'index']);
Route::get('/sitemap.xml', [\App\Http\Controllers\Api\Public\SitemapController::class, 'index']);
Route::get('/sitemap.xsl', [\App\Http\Controllers\Api\Public\SitemapController::class, 'xsl']);
Route::get('/sitemaps/{name}.xml', [\App\Http\Controllers\Api\Public\SitemapController::class, 'show']);

Route::redirect('/ai-trends', '/blog/category/tech-trends', 301);

Route::get('/{slug}', [PageRenderController::class, 'show'])
    ->where('slug', '^(?!api|up|robots\.txt|sitemap.*\.xml|sitemap\.xsl|sitemaps/).*$');
