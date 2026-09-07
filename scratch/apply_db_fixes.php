<?php
require __DIR__ . '/../backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

echo "1. ATTACKING CATEGORY ID 2 (Software Development)\n";
$cat2 = DB::table('service_categories')->where('slug', 'software-development')->first();
if ($cat2) {
    // Services for Software Development (Web app, SaaS, API, Custom website, etc.)
    $serviceIds = [16, 17, 18, 19, 20, 21, 22, 23];
    foreach ($serviceIds as $sId) {
        $exists = DB::table('service_category_service')
            ->where('service_id', $sId)
            ->where('service_category_id', $cat2->id)
            ->exists();
        if (!$exists) {
            DB::table('service_category_service')->insert([
                'service_id' => $sId,
                'service_category_id' => $cat2->id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            echo "Linked Service ID {$sId} to Category ID {$cat2->id} (Software Development)\n";
        }
    }
}

echo "\n2. CHECKING REDIRECTS TABLE FOR 'ai-trends'\n";
if (Schema::hasTable('redirects')) {
    $rExists = DB::table('redirects')->where('source_url', '/ai-trends')->orWhere('source_url', 'ai-trends')->exists();
    if (!$rExists) {
        DB::table('redirects')->insert([
            'source_url' => '/ai-trends',
            'target_url' => '/blog/category/tech-trends',
            'status_code' => 301,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        echo "Added 301 Redirect for /ai-trends -> /blog/category/tech-trends in DB!\n";
    } else {
        echo "Redirect for /ai-trends already exists in DB.\n";
    }
} else {
    echo "No redirects table found in DB.\n";
}

echo "\n3. VERIFYING CATEGORY SERVICES FOR software-development:\n";
$cat = \App\Models\ServiceCategory::where('slug', 'software-development')->first();
if ($cat) {
    $services = $cat->services()->where('is_active', true)->get();
    echo "Category: {$cat->name} | Services Count: " . count($services) . "\n";
    foreach ($services as $s) {
        echo "  - Service: {$s->name} ({$s->slug})\n";
    }
}
