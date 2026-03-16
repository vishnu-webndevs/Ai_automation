<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use Illuminate\Http\Request;

class AiSettingsController extends Controller
{
    public function show()
    {
        $openAiModel = AppSetting::getValue('openai_model') ?? config('services.openai.model') ?? 'gpt-4o';
        $hasOpenAiKey = (bool)(AppSetting::getValue('openai_api_key') ?? config('services.openai.key'));

        return response()->json([
            'openai' => [
                'has_key' => $hasOpenAiKey,
                'model' => $openAiModel,
            ],
        ]);
    }

    public function updateOpenAi(Request $request)
    {
        $validated = $request->validate([
            'api_key' => 'sometimes|nullable|string|min:10|max:300',
            'model' => 'sometimes|nullable|string|max:100',
            'clear_key' => 'sometimes|boolean',
        ]);

        $userId = $request->user()?->id;

        if (($validated['clear_key'] ?? false) === true) {
            AppSetting::setValue('openai_api_key', null, true, $userId);
        } elseif (array_key_exists('api_key', $validated)) {
            $value = $validated['api_key'];
            AppSetting::setValue('openai_api_key', $value ?: null, true, $userId);
        }

        if (array_key_exists('model', $validated)) {
            $model = $validated['model'];
            AppSetting::setValue('openai_model', $model ?: null, false, $userId);
        }

        return $this->show();
    }
}

