<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Page;
use Illuminate\Http\Request;

class BlogController extends Controller
{
    public function index()
    {
        return Page::where('type', 'blog')
            ->where('status', 'published')
            ->with(['blogCategories', 'blogTags', 'seo'])
            ->orderBy('created_at', 'desc')
            ->paginate(12);
    }
    
    // Show is handled by PageController, but we can add it here if needed for specific logic.
}
