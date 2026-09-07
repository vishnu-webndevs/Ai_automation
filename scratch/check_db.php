<?php
require __DIR__ . '/../backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

echo "=== PIVOT service_category_service ===\n";
if (Schema::hasTable('service_category_service')) {
    $pivots = DB::table('service_category_service')->get();
    echo "Count: " . count($pivots) . "\n";
    foreach ($pivots as $p) {
        echo json_encode($p) . "\n";
    }
} else {
    echo "Table service_category_service DOES NOT EXIST!\n";
}

echo "\n=== TESTING ServiceCategoryController API LOGIC FOR ALL SLUGS ===\n";
$slugs = ['web-designing', 'ai-automations', 'software-development', 'web-development', 'ai-solutions', 'digital-marketing'];
foreach ($slugs as $slug) {
    $cat = \App\Models\ServiceCategory::where('slug', $slug)->first();
    if (!$cat) {
        echo "Slug '{$slug}': NOT FOUND IN DB\n";
    } else {
        $services = $cat->services()->where('is_active', true)->get();
        $primaryServices = $cat->primaryServices()->where('is_active', true)->get();
        echo "Slug '{$slug}': ID={$cat->id}, Name='{$cat->name}', servicesCount=" . count($services) . ", primaryServicesCount=" . count($primaryServices) . "\n";
    }
}
