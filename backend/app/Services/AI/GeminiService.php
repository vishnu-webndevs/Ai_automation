<?php

namespace App\Services\AI;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiService implements AIServiceInterface
{
    protected $apiKey;
    protected $model = 'gemini-1.5-flash';

    public function __construct()
    {
        $this->apiKey = config('services.gemini.key') ?? env('GEMINI_API_KEY');
    }

    public function generatePageContent(array $context): array
    {
        $prompt = $this->buildPrompt($context);
        $url = "https://generativelanguage.googleapis.com/v1beta/models/{$this->model}:generateContent?key={$this->apiKey}";

        try {
            /** @var \Illuminate\Http\Client\Response $response */
            $response = Http::withHeaders([
                'Content-Type' => 'application/json'
            ])->timeout(60)->post($url, [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt]
                        ]
                    ]
                ],
                'generationConfig' => [
                    'responseMimeType' => 'application/json'
                ]
            ]);

            if ($response->failed()) {
                Log::error('Gemini API Error', ['body' => $response->body()]);
                throw new \Exception('Gemini API request failed: ' . $response->status());
            }

            $data = $response->json();
            $text = $data['candidates'][0]['content']['parts'][0]['text'] ?? '{}';

            $text = preg_replace('/^```json\s*|\s*```$/', '', $text);
            
            return json_decode($text, true);

        } catch (\Exception $e) {
            Log::error('Gemini Service Exception', ['message' => $e->getMessage()]);
            throw $e;
        }
    }

    protected function buildPrompt(array $context): string
    {
        $structure = $context['page_structure'] ?? null;
        $structureText = $structure ? "\n\nPage Structure:\n{$structure}\n\nFollow this structure when deciding section_key values and overall flow." : "\n\nIf no specific structure is provided, use a standard SaaS landing page flow (hero, features, benefits, social proof, FAQ, call-to-action).";

        return "You are an SEO expert. Generate a website page for the following context:
        Primary Keyword: {$context['primary_keyword']}
        Target Industry: {$context['target_industry']}
        Tone: {$context['tone']}
        Content Length: {$context['content_length']}
        {$structureText}

        Return strict JSON matching this schema:
        {
          \"title\": \"string\",
          \"meta_title\": \"string\",
          \"meta_description\": \"string\",
          \"sections\": [
            {
              \"section_key\": \"string\",
              \"content_blocks\": [
                { \"type\": \"string\", \"content\": \"string\" }
              ]
            }
          ],
          \"faqs\": [
            { \"question\": \"string\", \"answer\": \"string\" }
          ],
          \"internal_links\": [
            { \"text\": \"string\", \"url\": \"string\" }
          ]
        }";
    }
}
