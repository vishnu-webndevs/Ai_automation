<?php

namespace App\Services\AI;

use App\Models\AiPrompt;
use Illuminate\Support\Facades\Cache;

class AiPromptService
{
    public function getActivePromptText(string $key): ?string
    {
        $cacheKey = "ai_prompt:{$key}";

        return Cache::remember($cacheKey, now()->addMinutes(10), function () use ($key) {
            $prompt = AiPrompt::query()
                ->where('key', $key)
                ->where('is_active', true)
                ->with('currentVersion')
                ->first();

            if (!$prompt || !$prompt->currentVersion) {
                return null;
            }

            return (string)$prompt->currentVersion->prompt_text;
        });
    }

    public function invalidate(string $key): void
    {
        Cache::forget("ai_prompt:{$key}");
    }

    public function extractVariables(string $promptText): array
    {
        preg_match_all('/\{([a-zA-Z0-9_]+)\}/', $promptText, $matches);
        $vars = $matches[1] ?? [];
        $vars = array_values(array_unique(array_map('strval', $vars)));
        sort($vars);
        return $vars;
    }

    public function render(string $promptText, array $vars): string
    {
        return preg_replace_callback('/\{([a-zA-Z0-9_]+)\}/', function ($m) use ($vars) {
            $key = $m[1] ?? '';
            if ($key === '' || !array_key_exists($key, $vars)) {
                return $m[0];
            }
            return (string)$vars[$key];
        }, $promptText);
    }
}

