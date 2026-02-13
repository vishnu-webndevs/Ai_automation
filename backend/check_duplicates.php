<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$pages = App\Models\Page::where('slug', 'how-we-scaled-to-1m-users')->get();
foreach ($pages as $p) {
    echo "ID: " . $p->id . " Slug: " . $p->slug . " Template: " . $p->template_slug . "\n";
}
