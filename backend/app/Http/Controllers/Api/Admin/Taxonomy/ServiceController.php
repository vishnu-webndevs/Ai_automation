<?php

namespace App\Http\Controllers\Api\Admin\Taxonomy;

use App\Http\Controllers\Controller;
use App\Jobs\GenerateServiceContent;
use App\Models\Service;
use App\Services\AI\AIManager;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class ServiceController extends Controller
{
    protected AIManager $aiManager;

    public function __construct(AIManager $aiManager)
    {
        $this->aiManager = $aiManager;
    }

    public function index(Request $request)
    {
        $query = Service::query()->with(['category', 'categories']);

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
            'category_ids' => 'sometimes|array|min:1',
            'category_ids.*' => 'integer|exists:service_categories,id',
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:services,slug',
            'template_slug' => 'nullable|string|exists:page_templates,slug',
            'short_description' => 'nullable|string',
            'full_description' => 'nullable|string',
            'content_json' => 'nullable|array',
            'icon' => 'nullable|string',
            'is_active' => 'boolean',
            'features' => 'nullable|array',
            'features.*.title' => 'required|string',
            'features.*.description' => 'nullable|string',
            'features.*.icon' => 'nullable|string',
            'features.*.sort_order' => 'integer',
            'auto_generate_content' => 'sometimes|boolean',
            'ai_model' => 'sometimes|in:lorum,openai,gemini',
            'ai_tone' => 'sometimes|string',
            'ai_content_length' => 'sometimes|string',
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        DB::beginTransaction();
        try {
            $service = Service::create($validated);

            $categoryIds = array_values(array_unique(array_map('intval', $validated['category_ids'] ?? [$validated['service_category_id']])));
            if (!in_array((int)$validated['service_category_id'], $categoryIds, true)) {
                $categoryIds[] = (int)$validated['service_category_id'];
            }
            $service->categories()->sync($categoryIds);

            if (!empty($validated['features'])) {
                foreach ($validated['features'] as $featureData) {
                    $service->features()->create($featureData);
                }
            }
            DB::commit();

            $auto = (bool)($validated['auto_generate_content'] ?? false);
            if (
                $auto
                && empty($validated['content_json'])
                && empty($validated['short_description'])
                && empty($validated['full_description'])
            ) {
                GenerateServiceContent::dispatch($service->id, [
                    'model' => $validated['ai_model'] ?? 'lorum',
                    'tone' => $validated['ai_tone'] ?? 'professional',
                    'content_length' => $validated['ai_content_length'] ?? 'long',
                ]);
            }

            return response()->json($service->load(['features', 'category', 'categories']), 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        $service = Service::with(['category', 'categories', 'features'])->findOrFail($id);
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
            'category_ids' => 'sometimes|array|min:1',
            'category_ids.*' => 'integer|exists:service_categories,id',
            'name' => 'sometimes|required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:services,slug,' . $id,
            'template_slug' => 'nullable|string|exists:page_templates,slug',
            'short_description' => 'nullable|string',
            'full_description' => 'nullable|string',
            'content_json' => 'nullable|array',
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
            if (isset($validated['category_ids']) && is_array($validated['category_ids']) && count($validated['category_ids']) > 0) {
                $first = (int)$validated['category_ids'][0];
                if (!isset($validated['service_category_id'])) {
                    $validated['service_category_id'] = $first;
                }
            }

            $service->update($validated);

            if (isset($validated['category_ids'])) {
                $categoryIds = array_values(array_unique(array_map('intval', $validated['category_ids'])));
                $primaryId = (int)($validated['service_category_id'] ?? $service->service_category_id);
                if ($primaryId && !in_array($primaryId, $categoryIds, true)) {
                    $categoryIds[] = $primaryId;
                }
                $service->categories()->sync($categoryIds);
            }

            if (isset($validated['features'])) {
                $service->features()->delete();
                foreach ($validated['features'] as $featureData) {
                    $service->features()->create($featureData);
                }
            }
            DB::commit();
            return response()->json($service->load(['features', 'category', 'categories']));
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

    public function generateContent(Request $request)
    {
        $validated = $request->validate([
            'service_id' => 'required|exists:services,id',
            'model' => 'required|in:lorum,openai,gemini',
            'tone' => 'required|string',
            'content_length' => 'required|string',
            'confirm_overwrite' => 'sometimes|boolean',
            'primary_keyword' => 'sometimes|nullable|string',
            'target_industry' => 'sometimes|nullable|string',
            'automation_type' => 'sometimes|nullable|string',
            'target_problem' => 'sometimes|nullable|string',
            'tool_stack' => 'sometimes|array',
            'tool_stack.*' => 'string',
        ]);

        $service = Service::with(['category', 'features'])->findOrFail((int)$validated['service_id']);
        $hasExisting = !empty($service->content_json) || !empty($service->short_description) || !empty($service->full_description);
        $confirmed = (bool)($validated['confirm_overwrite'] ?? false);

        if ($hasExisting && !$confirmed) {
            return response()->json([
                'message' => 'Overwrite confirmation required',
                'code' => 'CONFIRM_OVERWRITE_REQUIRED',
            ], 409);
        }

        GenerateServiceContent::dispatch($service->id, array_merge($validated, [
            'uniqueness_seed' => $service->slug,
        ]));

        return response()->json(['message' => 'Queued service for generation', 'service_id' => $service->id]);
    }

    public function bulkGenerateContent(Request $request)
    {
        $validated = $request->validate([
            'service_ids' => 'required|array|min:1',
            'service_ids.*' => 'integer|exists:services,id',
            'model' => 'required|in:lorum,openai,gemini',
            'tone' => 'required|string',
            'content_length' => 'required|string',
            'confirm_overwrite' => 'sometimes|boolean',
            'target_industry' => 'sometimes|nullable|string',
            'automation_type' => 'sometimes|nullable|string',
            'target_problem' => 'sometimes|nullable|string',
            'tool_stack' => 'sometimes|array',
            'tool_stack.*' => 'string',
        ]);

        $dispatched = 0;
        foreach ($validated['service_ids'] as $serviceId) {
            $service = Service::find($serviceId);
            if (!$service) continue;

            GenerateServiceContent::dispatch($service->id, array_merge($validated, [
                'service_id' => $service->id,
                'uniqueness_seed' => $service->slug,
            ]));
            $dispatched++;
        }

        Cache::forget('public_services:list');

        return response()->json(['message' => "Queued {$dispatched} services for generation"]);
    }
}
