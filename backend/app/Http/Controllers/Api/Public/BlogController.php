<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Page;
use Illuminate\Http\Request;

class BlogController extends Controller
{
    public function index()
    {
        $paginator = Page::where('type', 'blog')
            ->where('status', 'published')
            ->with(['blogCategories', 'blogTags', 'seo'])
            ->orderBy('created_at', 'desc')
            ->paginate(12);

        $data = $paginator->toArray();

        if (!empty($data['data']) && is_array($data['data'])) {
            foreach ($data['data'] as &$page) {
                if (is_array($page)) {
                    $page['seo_meta'] = $page['seo'] ?? null;
                }
            }
        }

        return response()->json($data);
    }
    
    // Show is handled by PageController, but we can add it here if needed for specific logic.
}
