<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$homePage = \App\Models\Page::where('slug', 'home')->first();

if ($homePage) {
    echo "Home page exists. ID: " . $homePage->id . "\n";
} else {
    echo "Home page does NOT exist.\n";
    // Create it
    try {
        \App\Models\Page::create([
            'title' => 'Home',
            'slug' => 'home',
            'content' => ['hero' => 'Welcome to Totan AI'], // JSON content
            'status' => 'published', // Assuming 'published' is a valid status
            'is_published' => true,
             // Add other required fields if any. checking migration might be good but let's try basic first.
        ]);
        echo "Home page created.\n";
    } catch (\Exception $e) {
        echo "Error creating home page: " . $e->getMessage() . "\n";
    }
}
