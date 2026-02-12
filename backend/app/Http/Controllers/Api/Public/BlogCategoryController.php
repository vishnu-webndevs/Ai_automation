<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\BlogCategory;
use Illuminate\Http\Request;

class BlogCategoryController extends Controller
{
    public function index()
    {
        return BlogCategory::withCount('pages')->get();
    }

    public function show($slug)
    {
        return BlogCategory::with(['pages' => function ($query) {
            $query->where('status', 'published')
                  ->with('seo')
                  ->orderBy('created_at', 'desc');
        }])
        ->where('slug', $slug)
        ->firstOrFail();
    }
}
