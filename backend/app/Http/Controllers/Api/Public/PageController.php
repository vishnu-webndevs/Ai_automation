<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Page;
use Illuminate\Support\Facades\Cache;

class PageController extends Controller
{
    public function show(string $slug)
    {
        $cacheKey = "public_page:{$slug}";

        $page = Cache::remember($cacheKey, 600, function () use ($slug) {
            return Page::with([
                'sections.blocks', 
                'seo',
                'services',
                'industries',
                'useCases',
                'solutions',
                'integrations',
                'blogCategories',
                'blogTags'
            ])
                ->where('slug', $slug)
                ->where('status', 'published')
                ->firstOrFail();
        });

        return response()->json($page);
    }
}
