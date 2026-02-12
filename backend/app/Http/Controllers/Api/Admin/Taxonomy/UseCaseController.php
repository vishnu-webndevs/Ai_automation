<?php

namespace App\Http\Controllers\Api\Admin\Taxonomy;

use App\Http\Controllers\Controller;
use App\Models\UseCase;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class UseCaseController extends Controller
{
    public function index(Request $request)
    {
        $query = UseCase::query();

        if ($request->has('q')) {
            $q = $request->q;
            $query->where('name', 'like', "%{$q}%")
                  ->orWhere('slug', 'like', "%{$q}%");
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
            'slug' => 'nullable|string|max:255|unique:use_cases,slug',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $useCase = UseCase::create($validated);

        return response()->json($useCase, 201);
    }

    public function show($id)
    {
        $useCase = UseCase::findOrFail($id);
        return response()->json($useCase);
    }

    public function update(Request $request, $id)
    {
        $useCase = UseCase::findOrFail($id);

        if ($useCase->locked_at) {
            return response()->json(['error' => 'Resource is locked. Please unlock it first.'], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:use_cases,slug,' . $id,
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        if (isset($validated['name']) && !isset($request->slug) && $useCase->name !== $validated['name']) {
             $validated['slug'] = Str::slug($validated['name']);
        }

        $useCase->update($validated);

        return response()->json($useCase);
    }

    public function destroy($id)
    {
        $useCase = UseCase::findOrFail($id);

        if ($useCase->locked_at) {
            return response()->json(['error' => 'Resource is locked. Please unlock it first.'], 403);
        }

        $useCase->delete();

        return response()->json(null, 204);
    }

    public function toggleActive($id)
    {
        $useCase = UseCase::findOrFail($id);

        if ($useCase->locked_at) {
            return response()->json(['error' => 'Resource is locked. Please unlock it first.'], 403);
        }

        $useCase->is_active = !$useCase->is_active;
        $useCase->save();

        return response()->json($useCase);
    }
}
