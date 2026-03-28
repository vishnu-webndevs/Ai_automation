<?php

use App\Http\Controllers\Public\PageRenderController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json(['message' => 'API is running']);
});

Route::get('/robots.txt', function () {
    $env = config('app.env');
    $baseUrl = rtrim(env('FRONTEND_URL', env('PUBLIC_SITE_URL', config('app.url'))), '/');
    $sitemapUrl = $baseUrl . '/sitemap.xml';

    if ($env !== 'production') {
        return response("User-agent: *\nDisallow: /\n", 200)->header('Content-Type', 'text/plain; charset=UTF-8');
    }

    return response("User-agent: *\nAllow: /\nSitemap: {$sitemapUrl}\n", 200)->header('Content-Type', 'text/plain; charset=UTF-8');
});

Route::get('/sitemap.xml', [\App\Http\Controllers\Api\Public\SitemapController::class, 'index']);
Route::get('/sitemaps/{name}.xml', [\App\Http\Controllers\Api\Public\SitemapController::class, 'show']);

Route::get('/{slug}', [PageRenderController::class, 'show'])
    ->where('slug', '^(?!api|up|robots\.txt|sitemap\.xml|sitemaps/).*$');
