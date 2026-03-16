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
        $this->model = config('services.gemini.model') ?? env('GEMINI_MODEL', $this->model);
    }

    public function generatePageContent(array $context): array
    {
        $prompt = isset($context['prompt_override']) && is_string($context['prompt_override']) && trim($context['prompt_override']) !== ''
            ? $context['prompt_override']
            : $this->buildPrompt($context);
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
        $schema = (string)($context['output_schema'] ?? 'page');

        if ($schema === 'service') {
            $serviceName = (string)($context['service_name'] ?? ($context['primary_keyword'] ?? 'Service'));
            $industry = (string)($context['target_industry'] ?? 'General');
            $tone = (string)($context['tone'] ?? 'professional');
            $contentLength = (string)($context['content_length'] ?? 'long');
            $automationType = (string)($context['automation_type'] ?? 'automation');
            $targetProblem = (string)($context['target_problem'] ?? 'manual workflows and operational bottlenecks');
            $toolStack = $context['tool_stack'] ?? [];
            $toolStackText = is_array($toolStack) ? implode(', ', array_map('strval', $toolStack)) : (string)$toolStack;
            $seed = (string)($context['uniqueness_seed'] ?? '');

            return "You are an expert SEO strategist and SaaS landing page copywriter. Return ONLY strict JSON (no markdown).

Context:
- service_name: {$serviceName}
- target_industry: {$industry}
- automation_type: {$automationType}
- target_problem: {$targetProblem}
- tool_stack: {$toolStackText}
- tone: {$tone}
- content_length: {$contentLength}
- uniqueness_seed: {$seed}

Rules:
- Global English, international B2B.
- No images.
- Avoid plagiarism: write fresh phrasing, no templated repeated sentences.
- Do not repeat the same sentence across sections.
- Use placeholders exactly like {service_name}, {industry}, {country}, {city}, {business_type}, {automation_type}, {tool_stack}, {target_problem} inside text where applicable.

Return strict JSON with this exact structure (all keys must exist):
{
  \"service_name\": \"{service_name}\",
  \"meta_title\": \"string (<= 60 chars)\",
  \"meta_description\": \"string (<= 160 chars)\",
  \"hero\": {
    \"headline\": \"{service_name} for {industry}\",
    \"subheadline\": \"string\",
    \"short_description\": \"string\",
    \"trust_text\": \"string\",
    \"primary_cta_label\": \"string\",
    \"secondary_cta_label\": \"string\"
  },
  \"intro\": { \"body\": \"100-150 words\", \"key_outcomes\": [\"string\", \"string\", \"string\"] },
  \"problems\": [{ \"title\": \"string\", \"summary\": \"string\" }],
  \"solution_bullets\": [{ \"title\": \"string\", \"text\": \"string\" }],
  \"features\": [{ \"title\": \"string\", \"description\": \"string\", \"icon\": \"string\" }],
  \"benefits\": [{ \"title\": \"string\", \"description\": \"string\", \"metric_range\": \"string\" }],
  \"use_cases\": [{ \"title\": \"string\", \"industry\": \"{industry}\", \"summary\": \"string\" }],
  \"process_steps\": [{ \"title\": \"string\", \"description\": \"string\" }],
  \"tech_stack\": [\"string\"],
  \"industry_applications\": [{ \"title\": \"string\", \"body\": \"string\" }],
  \"comparison\": {
    \"left_label\": \"Manual Processes\",
    \"right_label\": \"{service_name}\",
    \"rows\": [{ \"topic\": \"string\", \"left\": \"string\", \"right\": \"string\" }]
  },
  \"roi\": {
    \"highlights\": [{ \"title\": \"string\", \"value\": \"string\", \"note\": \"string\" }],
    \"before_after_rows\": [{ \"metric\": \"string\", \"before\": \"string\", \"after\": \"string\" }]
  },
  \"related_services\": [{ \"title\": \"string\", \"href\": \"string\", \"summary\": \"string\" }],
  \"faqs\": [{ \"question\": \"string\", \"short_answer\": \"string\", \"expanded_answer\": \"string\" }],
  \"seo_expanders\": [{ \"title\": \"string\", \"body\": \"string\" }],
  \"location\": { \"enabled\": false, \"headline\": \"{service_name} in {country}\", \"body\": \"string\" },
  \"seo\": { \"title\": \"string\", \"canonical_url\": \"string\", \"og_title\": \"string\", \"og_description\": \"string\" },
  \"uniqueness\": { \"seed\": \"string\", \"notes\": \"string\" }
}

Counts:
- problems: 4-6
- solution_bullets: 4-6
- features: 6-8
- benefits: 6-8
- use_cases: 4-6
- process_steps: 5-7
- tech_stack: 6-12 include tool_stack
- industry_applications: 6
- comparison.rows: 5-8
- roi.highlights: 3-5
- related_services: 4
- faqs: 6-8
- seo_expanders: 3";
        }

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
