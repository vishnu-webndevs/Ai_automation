<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Page;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\Industry;
use App\Models\UseCase;
use App\Models\Solution;
use App\Models\Integration;
use App\Models\BlogCategory;
use App\Models\BlogTag;
use App\Models\Menu;
use App\Models\Redirect;
use Illuminate\Support\Facades\Schema;

$baseUrl = 'https://totan.ai';
$allUrls = [];
$menuUrls = [];

// Helper to normalized path
function normalizePath($url) {
    if (empty($url)) return '/';
    $parsed = parse_url($url);
    $path = $parsed['path'] ?? '/';
    return rtrim($path, '/') ?: '/';
}

// 1. Gather all menu links
if (Schema::hasTable('menus')) {
    $menus = Menu::with('items.children')->get();
    foreach ($menus as $menu) {
        if (!$menu->items) continue;
        foreach ($menu->items as $item) {
            $menuUrls[normalizePath($item->url)] = [
                'label' => $item->label,
                'menu' => $menu->location
            ];
            if ($item->children) {
                foreach ($item->children as $child) {
                    $menuUrls[normalizePath($child->url)] = [
                        'label' => $child->label,
                        'menu' => $menu->location . ' > ' . $item->label
                    ];
                }
            }
        }
    }
}

// Helper to add URL to report list
$addUrl = function($path, $source, $active = true, $status = 'published') use (&$allUrls) {
    $normalized = normalizePath($path);
    $allUrls[$normalized][] = [
        'source' => $source,
        'active' => $active,
        'status' => $status
    ];
};

// 2. Fetch pages
if (Schema::hasTable('pages')) {
    Page::all()->each(function($p) use ($addUrl) {
        $prefix = $p->type === 'blog' ? '/blog/' : '/';
        $addUrl($prefix . $p->slug, 'Page (' . $p->type . ')', true, $p->status);
    });
}

// 3. Fetch services
if (Schema::hasTable('services')) {
    Service::all()->each(function($s) use ($addUrl) {
        $addUrl('/services/' . $s->slug, 'Service', $s->is_active);
    });
}

// 4. Fetch service categories
if (Schema::hasTable('service_categories')) {
    ServiceCategory::all()->each(function($c) use ($addUrl) {
        $addUrl('/services/category/' . $c->slug, 'Service Category', $c->is_active);
    });
}

// 5. Fetch industries
if (Schema::hasTable('industries')) {
    Industry::all()->each(function($i) use ($addUrl) {
        $addUrl('/industries/' . $i->slug, 'Industry', $i->is_active);
    });
}

// 6. Fetch use cases
if (Schema::hasTable('use_cases')) {
    UseCase::all()->each(function($u) use ($addUrl) {
        $addUrl('/use-cases/' . $u->slug, 'Use Case', $u->is_active ?? true);
    });
}

// 7. Fetch solutions
if (Schema::hasTable('solutions')) {
    Solution::all()->each(function($s) use ($addUrl) {
        $addUrl('/solutions/' . $s->slug, 'Solution', $s->is_active);
        // Solution also maps as Tool
        $addUrl('/tools/' . $s->slug, 'Tool (Solution)', $s->is_active);
    });
}

// 8. Fetch integrations
if (Schema::hasTable('integrations')) {
    Integration::all()->each(function($i) use ($addUrl) {
        $addUrl('/integrations/' . $i->slug, 'Integration', $i->is_active);
    });
}

// 9. Fetch blog categories
if (Schema::hasTable('blog_categories')) {
    BlogCategory::all()->each(function($c) use ($addUrl) {
        $addUrl('/blog/category/' . $c->slug, 'Blog Category', $c->is_active ?? true);
    });
}

// 10. Fetch blog tags
if (Schema::hasTable('blog_tags')) {
    BlogTag::all()->each(function($t) use ($addUrl) {
        $addUrl('/blog/tag/' . $t->slug, 'Blog Tag', $t->is_active ?? true);
    });
}

// Static fallback / fixed routes in frontend
$fixedPaths = [
    '/', '/services', '/industries', '/use-cases', '/solutions', '/integrations', 
    '/tools', '/platform', '/blog', '/contact-us', '/login', '/signin', '/signup', 
    '/style-guide', '/changelog', '/customers', '/pricing'
];
foreach ($fixedPaths as $fp) {
    $addUrl($fp, 'Fixed Frontend Route', true, 'published');
}

// 11. Fetch redirects
$redirectsList = [];
if (Schema::hasTable('redirects')) {
    $redirectsList = Redirect::all()->toArray();
}

// Start report output
echo "=========================================\n";
echo "         TOTAN.AI CRAWL AUDIT REPORT     \n";
echo "=========================================\n\n";

echo "Total Crawlable Paths Found: " . count($allUrls) . "\n\n";

$orphans = [];
$duplicates = [];
$nonPublic = [];
$parameterUrls = [];

foreach ($allUrls as $path => $occurrences) {
    // Check parameters
    if (strpos($path, '?') !== false) {
        $parameterUrls[] = $path;
    }
    
    // Check duplicates
    if (count($occurrences) > 1) {
        // filter unique source names
        $sources = array_map(function($o) { return $o['source']; }, $occurrences);
        $uniqueSources = array_unique($sources);
        if (count($uniqueSources) > 1) {
            $duplicates[$path] = $occurrences;
        }
    }

    $isPublic = false;
    foreach ($occurrences as $occ) {
        if ($occ['active'] && $occ['status'] === 'published') {
            $isPublic = true;
        } else {
            $nonPublic[$path][] = $occ;
        }
    }

    if ($isPublic) {
        // Check if path is in menu
        $inMenu = false;
        foreach ($menuUrls as $menuPath => $info) {
            if ($menuPath === $path || ($path === '/' && $menuPath === '/home') || ($path === '/home' && $menuPath === '/')) {
                $inMenu = true;
                break;
            }
        }
        
        // Exclude root and static pages that are naturally linked or auth routes
        $excludeOrphanCheck = ['/', '/login', '/signin', '/signup', '/style-guide', '/changelog', '/customers', '/pricing', '/contact-us'];
        if (!$inMenu && !in_array($path, $excludeOrphanCheck)) {
            // Also exclude paths that are children paths if they are in lists, but list them as orphans if they have no parent links.
            // Since we want to make sure they receive links, let's keep them in orphans.
            $orphans[] = $path;
        }
    }
}

echo "--- DUPLICATE ROUTE CONFLICTS ---\n";
if (empty($duplicates)) {
    echo "No duplicate routes found.\n";
} else {
    foreach ($duplicates as $path => $occs) {
        echo "Path: {$path}\n";
        foreach ($occs as $occ) {
            echo "  - Source: {$occ['source']} (Active: " . ($occ['active']?'Yes':'No') . ", Status: {$occ['status']})\n";
        }
    }
}
echo "\n";

echo "--- PARAMETER/QUERY URLS ---\n";
if (empty($parameterUrls)) {
    echo "No parameter URLs in dynamic routes.\n";
} else {
    foreach ($parameterUrls as $p) {
        echo "  - {$p}\n";
    }
}
echo "\n";

echo "--- DRAFTS / NON-ACTIVE PAGES (Noindex Candidate) ---\n";
if (empty($nonPublic)) {
    echo "No inactive/draft pages.\n";
} else {
    foreach ($nonPublic as $path => $occs) {
        echo "Path: {$path}\n";
        foreach ($occs as $occ) {
            echo "  - Source: {$occ['source']} (Active: " . ($occ['active']?'Yes':'No') . ", Status: {$occ['status']})\n";
        }
    }
}
echo "\n";

echo "--- REDIRECTS ---\n";
if (empty($redirectsList)) {
    echo "No active database redirects found.\n";
} else {
    foreach ($redirectsList as $r) {
        echo "  - Source: {$r['source_url']} -> Target: {$r['target_url']} (Status: {$r['status_code']}, Active: " . ($r['is_active']?'Yes':'No') . ")\n";
    }
}
echo "\n";

echo "--- ORPHAN / UNLINKED PUBLIC PAGES ---\n";
if (empty($orphans)) {
    echo "No orphan pages found (all pages linked in menu/site structure).\n";
} else {
    echo "Count: " . count($orphans) . "\n";
    foreach (array_slice($orphans, 0, 30) as $o) {
        echo "  - {$o}\n";
    }
    if (count($orphans) > 30) {
        echo "  ... and " . (count($orphans) - 30) . " more.\n";
    }
}
echo "\n";
