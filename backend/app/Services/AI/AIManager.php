<?php

namespace App\Services\AI;

use InvalidArgumentException;

class AIManager
{
    public function createService(string $model): AIServiceInterface
    {
        return match ($model) {
            'lorum' => new LorumService(),
            'openai' => new OpenAIService(),
            'gemini' => new GeminiService(),
            default => throw new InvalidArgumentException("Unsupported AI model: {$model}"),
        };
    }
}
