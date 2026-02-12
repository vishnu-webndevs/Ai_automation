<?php

namespace App\Http\Controllers\Api\Admin\Blog;

use App\Http\Controllers\Controller;
use App\Models\BlogTag;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BlogTagController extends Controller
{
    public function index()
    {
        return response()->json(BlogTag::withCount('pages')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:blog_tags,slug',
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $tag = BlogTag::create($validated);

        return response()->json($tag, 201);
    }

    public function show($id)
    {
        $tag = BlogTag::findOrFail($id);
        return response()->json($tag);
    }

    public function update(Request $request, $id)
    {
        $tag = BlogTag::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:blog_tags,slug,' . $id,
        ]);

        if (isset($validated['name']) && !isset($request->slug) && $tag->name !== $validated['name']) {
             $validated['slug'] = Str::slug($validated['name']);
        }

        $tag->update($validated);

        return response()->json($tag);
    }

    public function destroy($id)
    {
        $tag = BlogTag::findOrFail($id);
        $tag->delete();

        return response()->json(null, 204);
    }
}
