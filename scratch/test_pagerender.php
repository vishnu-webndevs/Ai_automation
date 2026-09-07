<?php
require __DIR__ . '/../backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Page;
use App\Models\Service;

echo "=== CHECKING PAGE MODEL VS SERVICE MODEL FOR SLUGS ===\n";

$slug = 'services/wordpress-development-services';
$cleanSlug = 'wordpress-development-services';

$pageMatch = Page::where('slug', $slug)->orWhere('slug', $cleanSlug)->first();
echo "Page match for '{$slug}': " . ($pageMatch ? "YES (ID={$pageMatch->id}, Title={$pageMatch->title})" : "NO") . "\n";

$serviceMatch = Service::where('slug', $cleanSlug)->first();
echo "Service match for '{$cleanSlug}': " . ($serviceMatch ? "YES (ID={$serviceMatch->id}, Name={$serviceMatch->name})" : "NO") . "\n";
