<?php

namespace App\Http\Controllers\Api\Admin\Blog;

use App\Http\Controllers\Api\Admin\PageController;
use App\Models\Page;
use Illuminate\Http\Request;

class BlogController extends PageController
{
    /**
     * Display a listing of blog posts.
     */
    public function index(Request $request)
    {
        $validated = $request->validate([
            'status' => 'sometimes|nullable|in:draft,published,archived',
            'q' => 'sometimes|nullable|string',
            'sort' => 'sometimes|nullable|in:title,slug,type,status,updated_at,created_at',
            'dir' => 'sometimes|nullable|in:asc,desc',
            'per_page' => 'sometimes|nullable|integer|min:1|max:100',
        ]);

        $query = Page::query()
            ->where('type', 'blog')
            ->with(['seo', 'blogCategories', 'blogTags']) // Eager load taxonomy
            ->withCount('sections');

        if (!empty($validated['status'])) {
            $query->where('status', $validated['status']);
        }

        if (!empty($validated['q'])) {
            $q = $validated['q'];
            $query->where(function ($sub) use ($q) {
                $sub->where('title', 'like', "%{$q}%")
                    ->orWhere('slug', 'like', "%{$q}%");
            });
        }

        $sort = $validated['sort'] ?? 'updated_at';
        $dir = $validated['dir'] ?? 'desc';
        $perPage = $validated['per_page'] ?? 20;

        return response()->json(
            $query->orderBy($sort, $dir)->paginate($perPage)
        );
    }

    /**
     * Store a newly created blog post.
     */
    public function store(Request $request)
    {
        $request->merge(['type' => 'blog']);
        return parent::store($request);
    }

    /**
     * Update the specified blog post.
     */
    public function update(Request $request, int $id)
    {
        if ($request->has('type')) {
            $request->merge(['type' => 'blog']);
        }
        return parent::update($request, $id);
    }
}
