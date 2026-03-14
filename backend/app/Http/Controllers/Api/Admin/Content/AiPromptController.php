<?php

namespace App\Http\Controllers\Api\Admin\Content;

use App\Http\Controllers\Controller;
use App\Models\AiPrompt;
use App\Models\AiPromptVersion;
use App\Services\AI\AiPromptService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AiPromptController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'q' => 'sometimes|nullable|string',
            'is_active' => 'sometimes|nullable|boolean',
            'per_page' => 'sometimes|nullable|integer|min:1|max:100',
        ]);

        $query = AiPrompt::query()->with('currentVersion');

        if (!empty($validated['q'])) {
            $q = $validated['q'];
            $query->where(function ($sub) use ($q) {
                $sub->where('key', 'like', "%{$q}%")
                    ->orWhere('name', 'like', "%{$q}%");
            });
        }

        if (array_key_exists('is_active', $validated) && $validated['is_active'] !== null) {
            $query->where('is_active', filter_var($validated['is_active'], FILTER_VALIDATE_BOOLEAN));
        }

        $perPage = $validated['per_page'] ?? 20;

        return response()->json($query->orderBy('key')->paginate($perPage));
    }

    public function show(int $id, AiPromptService $promptService)
    {
        $prompt = AiPrompt::with(['currentVersion', 'versions'])->findOrFail($id);

        $currentText = $prompt->currentVersion?->prompt_text ?? '';
        $detected = $currentText !== '' ? $promptService->extractVariables($currentText) : [];

        return response()->json([
            'prompt' => $prompt,
            'detected_variables' => $detected,
        ]);
    }

    public function store(Request $request, AiPromptService $promptService)
    {
        $validated = $request->validate([
            'key' => 'required|string|max:255|unique:ai_prompts,key',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'sometimes|boolean',
            'prompt_text' => 'required|string',
        ]);

        $variables = $promptService->extractVariables($validated['prompt_text']);
        $hash = sha1(mb_strtolower(trim(preg_replace('/\s+/', ' ', $validated['prompt_text']))));

        $created = DB::transaction(function () use ($validated, $variables, $hash) {
            $prompt = AiPrompt::create([
                'key' => $validated['key'],
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'is_active' => $validated['is_active'] ?? true,
                'variables_json' => $variables,
            ]);

            $version = AiPromptVersion::create([
                'ai_prompt_id' => $prompt->id,
                'version_number' => 1,
                'prompt_text' => $validated['prompt_text'],
                'variables_json' => $variables,
                'content_hash' => $hash,
                'created_by_admin_id' => $request->user()?->id,
            ]);

            $prompt->current_version_id = $version->id;
            $prompt->save();

            return $prompt->fresh(['currentVersion', 'versions']);
        });

        $promptService->invalidate($validated['key']);

        return response()->json($created, 201);
    }

    public function update(Request $request, int $id, AiPromptService $promptService)
    {
        $prompt = AiPrompt::with('currentVersion')->findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'sometimes|boolean',
            'prompt_text' => 'sometimes|required|string',
        ]);

        $updated = DB::transaction(function () use ($request, $prompt, $validated, $promptService) {
            if (isset($validated['name'])) {
                $prompt->name = $validated['name'];
            }
            if (array_key_exists('description', $validated)) {
                $prompt->description = $validated['description'];
            }
            if (isset($validated['is_active'])) {
                $prompt->is_active = (bool)$validated['is_active'];
            }

            if (isset($validated['prompt_text'])) {
                $variables = $promptService->extractVariables($validated['prompt_text']);
                $hash = sha1(mb_strtolower(trim(preg_replace('/\s+/', ' ', $validated['prompt_text']))));

                $nextVersion = ((int)($prompt->versions()->max('version_number') ?? 0)) + 1;

                $version = AiPromptVersion::create([
                    'ai_prompt_id' => $prompt->id,
                    'version_number' => $nextVersion,
                    'prompt_text' => $validated['prompt_text'],
                    'variables_json' => $variables,
                    'content_hash' => $hash,
                    'created_by_admin_id' => $request->user()?->id,
                ]);

                $prompt->current_version_id = $version->id;
                $prompt->variables_json = $variables;
            }

            $prompt->save();

            return $prompt->fresh(['currentVersion', 'versions']);
        });

        $promptService->invalidate($prompt->key);

        return response()->json($updated);
    }

    public function destroy(int $id, AiPromptService $promptService)
    {
        $prompt = AiPrompt::findOrFail($id);
        $key = $prompt->key;
        $prompt->delete();
        $promptService->invalidate($key);
        return response()->json(null, 204);
    }

    public function activateVersion(Request $request, int $id, int $versionId, AiPromptService $promptService)
    {
        $prompt = AiPrompt::findOrFail($id);
        $version = AiPromptVersion::where('ai_prompt_id', $prompt->id)->findOrFail($versionId);

        $prompt->current_version_id = $version->id;
        $prompt->variables_json = $version->variables_json;
        $prompt->save();

        $promptService->invalidate($prompt->key);

        return response()->json($prompt->fresh(['currentVersion', 'versions']));
    }
}

