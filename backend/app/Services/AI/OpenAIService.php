<?php

namespace App\Services\AI;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class OpenAIService implements AIServiceInterface
{
    protected $apiKey;
    protected $model = 'gpt-4o';

    public function __construct()
    {
        $this->apiKey = config('services.openai.key') ?? env('OPENAI_API_KEY');
    }

    public function generatePageContent(array $context): array
    {
        $prompt = $this->buildPrompt($context);

        try {
            /** @var \Illuminate\Http\Client\Response $response */
            $response = Http::withToken($this->apiKey)
                ->timeout(60)
                ->post('https://api.openai.com/v1/chat/completions', [
                    'model' => $this->model,
                    'messages' => [
                        ['role' => 'system', 'content' => 'You are an expert SEO content generator and web architect. You MUST return strictly valid JSON content based on the requested schema. No markdown formatting, no code blocks, just raw JSON.'],
                        ['role' => 'user', 'content' => $prompt],
                    ],
                    'temperature' => 0.7,
                    'response_format' => ['type' => 'json_object']
                ]);

            if ($response->failed()) {
                Log::error('OpenAI API Error', ['body' => $response->body()]);
                throw new \Exception('OpenAI API request failed: ' . $response->status());
            }

            $content = $response->json('choices.0.message.content');
            return json_decode($content, true);

        } catch (\Exception $e) {
            Log::error('OpenAI Service Exception', ['message' => $e->getMessage()]);
            throw $e;
        }
    }

    protected function buildPrompt(array $context): string
    {
        $structure = $context['page_structure'] ?? null;
        $structureText = $structure ? "\n\nPage Structure:\n{$structure}\n\nFollow this structure when deciding section_key values and overall flow." : "\n\nIf no specific structure is provided, use a standard SaaS landing page flow (hero, features, benefits, social proof, FAQ, call-to-action).";

        return "Generate a full SEO-optimized landing page for the following context:
        Primary Keyword: {$context['primary_keyword']}
        Target Industry: {$context['target_industry']}
        Tone: {$context['tone']}
        Content Length: {$context['content_length']}
        {$structureText}

        The output must be a valid JSON object with this exact structure (all keys must exist):
        {
          \"title\": \"Page Title\",
          \"meta_title\": \"SEO Meta Title (max 60 chars)\",
          \"meta_description\": \"SEO Meta Description (max 160 chars)\",
          \"sections\": [
            {
              \"section_key\": \"hero | features | benefits | cta | about\",
              \"content_blocks\": [
                { \"type\": \"heading | paragraph | list | button\", \"content\": \"Text content\" }
              ]
            }
          ],
          \"faqs\": [
            { \"question\": \"...\", \"answer\": \"...\" }
          ],
          \"internal_links\": [
            { \"text\": \"Link Anchor\", \"url\": \"/path\" }
          ]
        }
        
        Ensure the content is high quality, relevant, and optimized for the keyword.";
    }
}
