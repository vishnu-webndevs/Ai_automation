<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$slug = 'how-we-scaled-to-1m-users';
$page = App\Models\Page::with('sections.blocks')->where('slug', $slug)->first();

if ($page) {
    foreach ($page->sections as $section) {
        echo "Section Type: " . $section->type . "\n";
        foreach ($section->blocks as $block) {
            echo "  Block Type: " . $block->block_type . "\n";
            echo "  Content: " . json_encode($block->content_json) . "\n";
        }
    }
}
