<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$page = App\Models\Page::with('sections.blocks')->where('slug', 'home')->first();

if ($page) {
    foreach ($page->sections as $section) {
        echo "Section ID: " . $section->id . " Type: " . $section->type . "\n";
        foreach ($section->blocks as $block) {
            echo "  Block ID: " . $block->id . " Type: " . $block->block_type . "\n";
        }
    }
}
