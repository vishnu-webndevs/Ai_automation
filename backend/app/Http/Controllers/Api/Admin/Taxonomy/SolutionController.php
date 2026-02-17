<?php

namespace App\Http\Controllers\Api\Admin\Taxonomy;

use App\Http\Controllers\Controller;
use App\Models\Solution;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SolutionController extends Controller
{
    public function index(Request $request)
    {
        $query = Solution::query();

        if ($request->has('q')) {
            $q = $request->q;
            $query->where('name', 'like', "%{$q}%")
                  ->orWhere('slug', 'like', "%{$q}%");
        }

        if ($request->has('is_active')) {
             $query->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN));
        }

        $sort = $request->get('sort', 'updated_at');
        $dir = $request->get('dir', 'desc');
        $perPage = $request->get('per_page', 20);

        if ($request->has('all')) {
            return response()->json($query->orderBy($sort, $dir)->get());
        }

        return response()->json(
            $query->orderBy($sort, $dir)->paginate($perPage)
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:solutions,slug',
            'template_slug' => 'nullable|string|exists:page_templates,slug',
            'description' => 'nullable|string',
            'icon' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $solution = Solution::create($validated);

        return response()->json($solution, 201);
    }

    public function show($id)
    {
        $solution = Solution::findOrFail($id);
        return response()->json($solution);
    }

    public function update(Request $request, $id)
    {
        $solution = Solution::findOrFail($id);

        if ($solution->locked_at) {
            return response()->json(['error' => 'Resource is locked. Please unlock it first.'], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:solutions,slug,' . $id,
            'template_slug' => 'nullable|string|exists:page_templates,slug',
            'description' => 'nullable|string',
            'icon' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        if (isset($validated['name']) && !isset($request->slug) && $solution->name !== $validated['name']) {
             $validated['slug'] = Str::slug($validated['name']);
        }

        $solution->update($validated);

        return response()->json($solution);
    }

    public function destroy($id)
    {
        $solution = Solution::findOrFail($id);

        if ($solution->locked_at) {
            return response()->json(['error' => 'Resource is locked. Please unlock it first.'], 403);
        }

        $solution->delete();

        return response()->json(null, 204);
    }

    public function toggleActive($id)
    {
        $solution = Solution::findOrFail($id);
        
        if ($solution->locked_at) {
            return response()->json(['error' => 'Resource is locked. Please unlock it first.'], 403);
        }

        $solution->is_active = !$solution->is_active;
        $solution->save();

        return response()->json($solution);
    }
}

