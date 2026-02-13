<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Admin\AuthController;
use App\Http\Controllers\Api\Admin\LockController;
use App\Http\Controllers\Api\Admin\MediaController;
use App\Http\Controllers\Api\Admin\MenuController as AdminMenuController;
use App\Http\Controllers\Api\Admin\PageController;
use App\Http\Controllers\Api\Admin\PageTemplateController;
use App\Http\Controllers\Api\Public\MenuController as PublicMenuController;
use App\Http\Controllers\Api\Public\PageController as PublicPageController;
use App\Http\Controllers\Api\Public\SitemapController;
use App\Http\Controllers\Api\Public\AuthController as PublicAuthController;
use App\Http\Controllers\Api\Public\ServiceController as PublicServiceController;
use App\Http\Controllers\Api\Public\IndustryController as PublicIndustryController;
use App\Http\Controllers\Api\Public\UseCaseController as PublicUseCaseController;
use App\Http\Controllers\Api\Public\BlogController as PublicBlogController;
use App\Http\Controllers\Api\Public\SolutionController as PublicSolutionController;
use App\Http\Controllers\Api\Public\IntegrationController as PublicIntegrationController;
use App\Http\Controllers\Api\Public\BlogCategoryController as PublicBlogCategoryController;
use App\Http\Controllers\Api\Admin\Taxonomy\ServiceController;

use App\Http\Controllers\Api\Admin\Taxonomy\ServiceCategoryController;
use App\Http\Controllers\Api\Admin\Taxonomy\IndustryController;
use App\Http\Controllers\Api\Admin\Taxonomy\UseCaseController;
use App\Http\Controllers\Api\Admin\Blog\BlogCategoryController;
use App\Http\Controllers\Api\Admin\Blog\BlogTagController;
use App\Http\Controllers\Api\Admin\Seo\RedirectController;
use App\Http\Controllers\Api\Admin\Seo\SchemaController;
use App\Http\Controllers\Api\Admin\Seo\SitemapController as AdminSitemapController;
use App\Http\Controllers\Api\Admin\Seo\InternalLinkController;
use App\Http\Controllers\Api\Admin\Content\VersionController;
use App\Http\Controllers\Api\Admin\Content\CtaController;
use App\Http\Controllers\Api\Admin\System\AuditLogController;
use App\Http\Controllers\Api\Admin\SearchController;

Route::get('/health', function () {
    return response()->json(['status' => 'ok', 'service' => 'backend-api', 'timestamp' => now()]);
});

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/pages/{slug}', [PublicPageController::class, 'show']);
Route::get('/menus/{location}', [PublicMenuController::class, 'show']);
Route::get('/sitemap.xml', [SitemapController::class, 'index']);

// Public Taxonomy Routes
Route::get('/services', [PublicServiceController::class, 'index']);
Route::get('/services/{slug}', [PublicServiceController::class, 'show']);
Route::get('/solutions', [PublicSolutionController::class, 'index']);
Route::get('/solutions/{slug}', [PublicSolutionController::class, 'show']);
Route::get('/integrations', [PublicIntegrationController::class, 'index']);
Route::get('/integrations/{slug}', [PublicIntegrationController::class, 'show']);
Route::get('/industries', [PublicIndustryController::class, 'index']);
Route::get('/industries/{slug}', [PublicIndustryController::class, 'show']);
Route::get('/use-cases', [PublicUseCaseController::class, 'index']);
Route::get('/use-cases/{slug}', [PublicUseCaseController::class, 'show']);
Route::get('/blogs', [PublicBlogController::class, 'index']); // Blog Listing
Route::get('/blog-categories', [PublicBlogCategoryController::class, 'index']);
Route::get('/blog-categories/{slug}', [PublicBlogCategoryController::class, 'show']);


Route::post('/auth/register', [PublicAuthController::class, 'register']);
Route::post('/auth/login', [PublicAuthController::class, 'login']);
Route::middleware('auth:sanctum')->post('/auth/logout', [PublicAuthController::class, 'logout']);

Route::prefix('admin')->group(function () {
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::middleware('auth:sanctum')->post('/auth/logout', [AuthController::class, 'logout']);
    Route::middleware('auth:sanctum')->get('/auth/me', function (Request $request) {
        return $request->user();
    });

    Route::middleware('auth:sanctum')->get('/global-search', [SearchController::class, 'globalSearch']);
    
    Route::middleware('auth:sanctum')->post('/lock/{resource}/{id}', [LockController::class, 'toggle']);

    Route::middleware(['auth:sanctum', 'admin.role:admin'])->group(function () {
        Route::get('/pages', [PageController::class, 'index']);
        Route::post('/pages', [PageController::class, 'store']);
        Route::get('/pages/{id}', [PageController::class, 'show']);
        Route::patch('/pages/{id}', [PageController::class, 'update']);
        Route::delete('/pages/{id}', [PageController::class, 'destroy']);
        Route::post('/pages/bulk', [PageController::class, 'bulkCreate']);
        Route::post('/pages/bulk-status', [PageController::class, 'bulkStatus']);
        Route::post('/pages/validate-slug', [PageController::class, 'validateSlug']);
        Route::post('/pages/check-keyword', [PageController::class, 'checkKeyword']);
        Route::post('/pages/{id}/toggle-publish', [PageController::class, 'togglePublish']);
        Route::post('/pages/{id}/duplicate', [PageController::class, 'duplicate']);
        Route::post('/ai/generate-page', [PageController::class, 'generateContent'])->middleware('throttle:ai-generation');
        Route::post('/ai/generate-page-bulk', [PageController::class, 'bulkGenerate'])->middleware('throttle:ai-generation');

        // Page Templates
        Route::get('/page-templates', [PageTemplateController::class, 'index']);
        Route::post('/pages/{id}/apply-template', [PageTemplateController::class, 'apply']);

        Route::middleware(['admin.permission:manage_menus'])->group(function () {
            Route::get('/menus', [AdminMenuController::class, 'index']);
            Route::post('/menus', [AdminMenuController::class, 'store']);
            Route::get('/menus/{id}', [AdminMenuController::class, 'show']);
            Route::patch('/menus/{id}', [AdminMenuController::class, 'update']);
            Route::delete('/menus/{id}', [AdminMenuController::class, 'destroy']);
            Route::get('/menus/{id}/items', [AdminMenuController::class, 'items']);
            Route::post('/menus/{id}/items', [AdminMenuController::class, 'addItem']);
            Route::patch('/menu-items/{id}', [AdminMenuController::class, 'updateItem']);
            Route::delete('/menu-items/{id}', [AdminMenuController::class, 'deleteItem']);
            Route::post('/menus/{id}/reorder', [AdminMenuController::class, 'reorder']);
        });

        Route::middleware(['admin.permission:manage_media'])->group(function () {
            Route::get('/media', [MediaController::class, 'index']);
            Route::post('/media', [MediaController::class, 'store']);
            Route::get('/media/{id}', [MediaController::class, 'show']);
            Route::patch('/media/{id}', [MediaController::class, 'update']);
            Route::post('/media/{id}/replace', [MediaController::class, 'replace']);
            Route::delete('/media/{id}', [MediaController::class, 'destroy']);
            Route::post('/media/scan-usage', [MediaController::class, 'scanUsage']);
        });

        // Taxonomy Modules
        Route::middleware(['admin.permission:manage_taxonomy'])->group(function () {
            // Toggle Active Routes
            Route::patch('services/{id}/toggle-active', [ServiceController::class, 'toggleActive']);
            Route::patch('industries/{id}/toggle-active', [IndustryController::class, 'toggleActive']);
            Route::patch('use-cases/{id}/toggle-active', [UseCaseController::class, 'toggleActive']);
            
            Route::apiResource('services', ServiceController::class);
            Route::apiResource('service-categories', ServiceCategoryController::class);
            Route::apiResource('industries', IndustryController::class);
            Route::apiResource('use-cases', UseCaseController::class);
        });

        // Advanced Blog System
        Route::middleware(['admin.permission:manage_content'])->group(function () {
            Route::apiResource('blogs', \App\Http\Controllers\Api\Admin\Blog\BlogController::class);
            Route::apiResource('blog-categories', BlogCategoryController::class);
            Route::apiResource('blog-tags', BlogTagController::class);
        });

        // SEO Infrastructure
        Route::middleware(['admin.permission:manage_seo'])->group(function () {
            Route::apiResource('redirects', RedirectController::class);
            Route::apiResource('schemas', SchemaController::class);
            Route::get('sitemap', [AdminSitemapController::class, 'index']);
            Route::get('sitemap/rebuild', [AdminSitemapController::class, 'rebuild']);
            Route::get('internal-links/suggest', [InternalLinkController::class, 'suggest']);
            Route::get('internal-links/orphans', [InternalLinkController::class, 'orphans']);
            Route::apiResource('internal-links', InternalLinkController::class);
        });

        // Content Versioning & CTAs
        Route::middleware(['admin.permission:manage_content'])->group(function () {
             Route::get('pages/{id}/versions', [VersionController::class, 'index']);
             Route::post('pages/{id}/versions', [VersionController::class, 'store']); // Manually create snapshot
             Route::post('versions/{id}/restore', [VersionController::class, 'restore']);
             Route::apiResource('ctas', CtaController::class);
        });

        // Audit Logging
        Route::middleware(['admin.permission:manage_settings'])->group(function () {
            Route::get('audit-logs', [AuditLogController::class, 'index']);
        });
    });
});
