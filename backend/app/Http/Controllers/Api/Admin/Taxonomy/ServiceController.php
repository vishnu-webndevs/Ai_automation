<?php

namespace App\Http\Controllers\Api\Admin\Taxonomy;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class ServiceController extends Controller
{
    public function index(Request $request)
    {
        $query = Service::query()->with('category');

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
            'service_category_id' => 'required|exists:service_categories,id',
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:services,slug',
            'short_description' => 'nullable|string',
            'full_description' => 'nullable|string',
            'icon' => 'nullable|string',
            'is_active' => 'boolean',
            'features' => 'nullable|array',
            'features.*.title' => 'required|string',
            'features.*.description' => 'nullable|string',
            'features.*.icon' => 'nullable|string',
            'features.*.sort_order' => 'integer',
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        DB::beginTransaction();
        try {
            $service = Service::create($validated);

            if (!empty($validated['features'])) {
                foreach ($validated['features'] as $featureData) {
                    $service->features()->create($featureData);
                }
            }
            DB::commit();
            return response()->json($service->load('features'), 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        $service = Service::with(['category', 'features'])->findOrFail($id);
        return response()->json($service);
    }

    public function update(Request $request, $id)
    {
        $service = Service::findOrFail($id);

        if ($service->locked_at) {
            return response()->json(['error' => 'Resource is locked. Please unlock it first.'], 403);
        }

        $validated = $request->validate([
            'service_category_id' => 'sometimes|required|exists:service_categories,id',
            'name' => 'sometimes|required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:services,slug,' . $id,
            'short_description' => 'nullable|string',
            'full_description' => 'nullable|string',
            'icon' => 'nullable|string',
            'is_active' => 'boolean',
            'features' => 'nullable|array',
            'features.*.title' => 'required|string',
            'features.*.description' => 'nullable|string',
            'features.*.icon' => 'nullable|string',
            'features.*.sort_order' => 'integer',
        ]);

        if (isset($validated['name']) && !isset($request->slug) && $service->name !== $validated['name']) {
             $validated['slug'] = Str::slug($validated['name']);
        }

        DB::beginTransaction();
        try {
            $service->update($validated);

            if (isset($validated['features'])) {
                $service->features()->delete();
                foreach ($validated['features'] as $featureData) {
                    $service->features()->create($featureData);
                }
            }
            DB::commit();
            return response()->json($service->load('features'));
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        $service = Service::findOrFail($id);

        if ($service->locked_at) {
            return response()->json(['error' => 'Resource is locked. Please unlock it first.'], 403);
        }

        $service->delete();

        return response()->json(null, 204);
    }

    public function toggleActive($id)
    {
        $service = Service::findOrFail($id);
        
        if ($service->locked_at) {
            return response()->json(['error' => 'Resource is locked. Please unlock it first.'], 403);
        }

        $service->is_active = !$service->is_active;
        $service->save();

        return response()->json($service);
    }
}
