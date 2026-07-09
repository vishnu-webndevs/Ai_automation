<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\BlogTag;
use Illuminate\Http\Request;

class BlogTagController extends Controller
{
    public function index()
    {
        return BlogTag::withCount('pages')->get();
    }

    public function show($slug)
    {
        return BlogTag::with(['pages' => function ($query) {
            $query->where('status', 'published')
                  ->with('seo')
                  ->orderBy('created_at', 'desc');
        }])
        ->where('slug', $slug)
        ->firstOrFail();
    }
}
