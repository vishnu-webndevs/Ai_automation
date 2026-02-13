<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$page = App\Models\Page::where('slug', 'home')->first();

if ($page) {
    echo "Page: " . $page->title . "\n";
    echo "Template Slug: " . $page->template_slug . "\n";
    echo "Template: " . $page->template . "\n";
}
