<?php

namespace App\Http\Controllers\Api\Admin\Taxonomy;

use App\Http\Controllers\Controller;
use App\Models\Industry;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class IndustryController extends Controller
{
    public function index(Request $request)
    {
        $query = Industry::query();

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
            'slug' => 'nullable|string|max:255|unique:industries,slug',
            'description' => 'nullable|string',
            'icon' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $industry = Industry::create($validated);

        return response()->json($industry, 201);
    }

    public function show($id)
    {
        $industry = Industry::findOrFail($id);
        return response()->json($industry);
    }

    public function update(Request $request, $id)
    {
        $industry = Industry::findOrFail($id);

        if ($industry->locked_at) {
            return response()->json(['error' => 'Resource is locked. Please unlock it first.'], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:industries,slug,' . $id,
            'description' => 'nullable|string',
            'icon' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        if (isset($validated['name']) && !isset($request->slug) && $industry->name !== $validated['name']) {
             $validated['slug'] = Str::slug($validated['name']);
        }

        $industry->update($validated);

        return response()->json($industry);
    }

    public function destroy($id)
    {
        $industry = Industry::findOrFail($id);

        if ($industry->locked_at) {
            return response()->json(['error' => 'Resource is locked. Please unlock it first.'], 403);
        }

        $industry->delete();

        return response()->json(null, 204);
    }

    public function toggleActive($id)
    {
        $industry = Industry::findOrFail($id);
        
        if ($industry->locked_at) {
            return response()->json(['error' => 'Resource is locked. Please unlock it first.'], 403);
        }

        $industry->is_active = !$industry->is_active;
        $industry->save();

        return response()->json($industry);
    }
}
