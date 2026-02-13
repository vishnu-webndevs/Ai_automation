<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$slug = 'how-we-scaled-to-1m-users';
$page = App\Models\Page::where('slug', $slug)->first();

if ($page) {
    echo "Page found: " . $page->title . "\n";
    echo "Template: " . $page->template_slug . "\n";
    echo "Sections count: " . $page->sections()->count() . "\n";
    
    foreach ($page->sections as $section) {
        echo "  Section Type: " . $section->type . "\n";
    }
} else {
    echo "Page not found: " . $slug . "\n";
}
