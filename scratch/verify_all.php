<?php
require __DIR__ . '/../backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Http\Controllers\Api\Public\SitemapController;
use Illuminate\Http\Request;

echo "=== 1. VERIFYING CATEGORIES AND SERVICES COUNT ===\n";
$targetSlugs = ['software-development', 'web-designing', 'ai-automations'];
foreach ($targetSlugs as $slug) {
    $cat = \App\Models\ServiceCategory::where('slug', $slug)->first();
    if (!$cat) {
        echo "Category '{$slug}': NOT FOUND!\n";
    } else {
        $count = $cat->services()->where('is_active', true)->count();
        echo "Category '{$cat->name}' ({$slug}): ID={$cat->id}, Active Services={$count}\n";
    }
}

echo "\n=== 2. VERIFYING SITEMAP GENERATION (sitemap-services.xml) ===\n";
$controller = new SitemapController();
$res = $controller->show('services');
$xml = $res->getContent();

foreach ($targetSlugs as $slug) {
    $expectedUrl = "https://totan.ai/services/category/{$slug}";
    if (str_contains($xml, $expectedUrl)) {
        echo "Sitemap contains: {$expectedUrl} - YES\n";
    } else {
        echo "Sitemap contains: {$expectedUrl} - NO\n";
    }
}

echo "\n=== 3. VERIFYING ROUTE /ai-trends REDIRECT ===\n";
try {
    $req = Request::create('/ai-trends', 'GET');
    $response = $app->handle($req);
    echo "GET /ai-trends HTTP Status: " . $response->getStatusCode() . "\n";
    echo "Redirect Location: " . $response->headers->get('Location') . "\n";
} catch (\Throwable $e) {
    echo "Error checking /ai-trends: " . $e->getMessage() . "\n";
}
