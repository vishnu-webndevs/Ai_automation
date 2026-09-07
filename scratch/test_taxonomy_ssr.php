<?php
require __DIR__ . '/../backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Http\Request;

echo "=== 1. TESTING PAGERENDERCONTROLLER TAXONOMY SSR OUTPUT ===\n";

$testUrls = [
    '/services/wordpress-development-services',
    '/services/ai-chatbot-development',
    '/services/category/web-designing',
    '/services/category/software-development',
    '/blog/tag/ai',
    '/blog/category/tech-trends',
    '/integrations',
    '/industries',
    '/solutions',
];

foreach ($testUrls as $url) {
    try {
        $req = Request::create($url, 'GET');
        $response = $app->handle($req);
        $status = $response->getStatusCode();
        $html = $response->getContent();

        preg_match('/<title>(.*?)<\/title>/s', $html, $titleMatch);
        preg_match('/<meta name="description" content="(.*?)"/s', $html, $descMatch);
        preg_match('/<link rel="canonical" href="(.*?)"/s', $html, $canonMatch);
        $hasSchema = str_contains($html, 'ld+json');

        $title = $titleMatch[1] ?? 'NO TITLE';
        $desc = $descMatch[1] ?? 'NO DESC';
        $canon = $canonMatch[1] ?? 'NO CANONICAL';

        echo "URL: {$url}\n";
        echo "  - Status: {$status}\n";
        echo "  - Title: {$title}\n";
        echo "  - Description: {$desc}\n";
        echo "  - Canonical: {$canon}\n";
        echo "  - Schema JSON-LD: " . ($hasSchema ? "YES" : "NO") . "\n\n";
    } catch (\Throwable $e) {
        echo "URL: {$url} -> ERROR: " . $e->getMessage() . "\n\n";
    }
}

echo "=== 2. TESTING WWW REDIRECT & API NOINDEX HEADERS ===\n";
try {
    $reqWww = Request::create('https://www.totan.ai/services/wordpress-development-services', 'GET');
    $resWww = $app->handle($reqWww);
    echo "WWW Request Status: " . $resWww->getStatusCode() . "\n";
    echo "WWW Location: " . $resWww->headers->get('Location') . "\n";

    $reqApi = Request::create('https://api.totan.ai/', 'GET');
    $resApi = $app->handle($reqApi);
    echo "API Request Status: " . $resApi->getStatusCode() . "\n";
    echo "API X-Robots-Tag: " . $resApi->headers->get('X-Robots-Tag') . "\n";
} catch (\Throwable $e) {
    echo "Header test note: " . $e->getMessage() . "\n";
}
