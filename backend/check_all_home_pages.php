<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$pages = App\Models\Page::whereIn('slug', ['home', '/'])->get();

foreach ($pages as $p) {
    echo "ID: " . $p->id . " Slug: " . $p->slug . " Title: " . $p->title . " Status: " . $p->status . " Template: " . $p->template_slug . "\n";
}
