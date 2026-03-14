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
        $prompt = isset($context['prompt_override']) && is_string($context['prompt_override']) && trim($context['prompt_override']) !== ''
            ? $context['prompt_override']
            : $this->buildPrompt($context);

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

            return "Generate SEO-optimized, conversion-focused service landing page content for Totan.ai as strict JSON.

Context:
- service_name: {$serviceName}
- target_industry: {$industry}
- automation_type: {$automationType}
- target_problem: {$targetProblem}
- tool_stack: {$toolStackText}
- tone: {$tone}
- content_length: {$contentLength}
- uniqueness_seed: {$seed}

Output rules:
- Return ONLY valid JSON (no markdown, no code fences).
- Use globally understandable English (international B2B).
- Avoid plagiarism: do NOT reuse common templates verbatim; write fresh phrasing with unique sentence structures.
- Do not repeat the same sentence across different sections.
- Prefer specifics and clear outcomes; avoid vague claims.
- Use placeholders exactly like {service_name}, {industry}, {country}, {city}, {business_type}, {automation_type}, {tool_stack}, {target_problem} inside text where applicable.
- Do NOT include images or image references.

The output must be a valid JSON object with this exact structure (all keys must exist):
{
  \"service_name\": \"{service_name}\",
  \"meta_title\": \"string (<= 60 chars, include {service_name} + {industry})\",
  \"meta_description\": \"string (<= 160 chars, include {service_name} + outcome)\",
  \"hero\": {
    \"headline\": \"{service_name} for {industry}\",
    \"subheadline\": \"string\",
    \"short_description\": \"string\",
    \"trust_text\": \"string\",
    \"primary_cta_label\": \"string\",
    \"secondary_cta_label\": \"string\"
  },
  \"intro\": {
    \"body\": \"100-150 words\",
    \"key_outcomes\": [\"string\", \"string\", \"string\"]
  },
  \"problems\": [
    { \"title\": \"string\", \"summary\": \"string\" }
  ],
  \"solution_bullets\": [
    { \"title\": \"string\", \"text\": \"string\" }
  ],
  \"features\": [
    { \"title\": \"string\", \"description\": \"string\", \"icon\": \"string\" }
  ],
  \"benefits\": [
    { \"title\": \"string\", \"description\": \"string\", \"metric_range\": \"string\" }
  ],
  \"use_cases\": [
    { \"title\": \"string\", \"industry\": \"{industry}\", \"summary\": \"string\" }
  ],
  \"process_steps\": [
    { \"title\": \"string\", \"description\": \"string\" }
  ],
  \"tech_stack\": [\"string\"],
  \"industry_applications\": [
    { \"title\": \"string\", \"body\": \"string\" }
  ],
  \"comparison\": {
    \"left_label\": \"Manual Processes\",
    \"right_label\": \"{service_name}\",
    \"rows\": [
      { \"topic\": \"string\", \"left\": \"string\", \"right\": \"string\" }
    ]
  },
  \"roi\": {
    \"highlights\": [
      { \"title\": \"string\", \"value\": \"string\", \"note\": \"string\" }
    ],
    \"before_after_rows\": [
      { \"metric\": \"string\", \"before\": \"string\", \"after\": \"string\" }
    ]
  },
  \"related_services\": [
    { \"title\": \"string\", \"href\": \"string\", \"summary\": \"string\" }
  ],
  \"faqs\": [
    { \"question\": \"string\", \"short_answer\": \"string\", \"expanded_answer\": \"string\" }
  ],
  \"seo_expanders\": [
    { \"title\": \"string\", \"body\": \"string\" }
  ],
  \"location\": {
    \"enabled\": false,
    \"headline\": \"{service_name} in {country}\",
    \"body\": \"string\"
  },
  \"seo\": {
    \"title\": \"string\",
    \"canonical_url\": \"string\",
    \"og_title\": \"string\",
    \"og_description\": \"string\"
  },
  \"uniqueness\": {
    \"seed\": \"string\",
    \"notes\": \"string\"
  }
}

Content constraints:
- problems: 4-6 items
- solution_bullets: 4-6 items
- features: 6-8 items
- benefits: 6-8 items
- use_cases: 4-6 items
- process_steps: 5-7 items
- tech_stack: 6-12 items, include {tool_stack} items
- industry_applications: 6 items
- comparison.rows: 5-8 items
- roi.highlights: 3-5 items
- related_services: 4 items (use /services/{slug} style)
- faqs: 6-8 items, SEO-friendly long-tail
- seo_expanders: 3 items, long-tail headings";
        }

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
