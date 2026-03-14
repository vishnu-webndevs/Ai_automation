<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('ai_prompts') || !Schema::hasTable('ai_prompt_versions')) {
            return;
        }

        $now = now();
        $key = 'service_page';

        $exists = DB::table('ai_prompts')->where('key', $key)->exists();
        if ($exists) {
            return;
        }

        $promptText = <<<PROMPT
Generate SEO-optimized, conversion-focused service landing page content for Totan.ai as strict JSON.

Context:
- service_name: {service_name}
- target_industry: {industry}
- automation_type: {automation_type}
- target_problem: {target_problem}
- tool_stack: {tool_stack}
- uniqueness_seed: {uniqueness_seed}

Rules:
- Return ONLY valid JSON (no markdown, no code fences).
- Use globally understandable English for international B2B audiences.
- Write original copy. Do not reuse generic marketing sentences.
- Avoid repetition across sections.
- Do not include images.

Output must match this exact JSON schema (all keys must exist):
{
  "service_name": "{service_name}",
  "meta_title": "string (<= 60 chars, include service_name + industry)",
  "meta_description": "string (<= 160 chars, include service_name + outcome)",
  "hero": {
    "headline": "{service_name} for {industry}",
    "subheadline": "string",
    "short_description": "string",
    "trust_text": "string",
    "primary_cta_label": "string",
    "secondary_cta_label": "string"
  },
  "intro": {
    "body": "100-150 words",
    "key_outcomes": ["string", "string", "string"]
  },
  "problems": [{ "title": "string", "summary": "string" }],
  "solution_bullets": [{ "title": "string", "text": "string" }],
  "features": [{ "title": "string", "description": "string", "icon": "string" }],
  "benefits": [{ "title": "string", "description": "string", "metric_range": "string" }],
  "use_cases": [{ "title": "string", "industry": "{industry}", "summary": "string" }],
  "process_steps": [{ "title": "string", "description": "string" }],
  "tech_stack": ["string"],
  "industry_applications": [{ "title": "string", "body": "string" }],
  "comparison": {
    "left_label": "Manual Processes",
    "right_label": "{service_name}",
    "rows": [{ "topic": "string", "left": "string", "right": "string" }]
  },
  "roi": {
    "highlights": [{ "title": "string", "value": "string", "note": "string" }],
    "before_after_rows": [{ "metric": "string", "before": "string", "after": "string" }]
  },
  "related_services": [{ "title": "string", "href": "/services/{service_slug}", "summary": "string" }],
  "faqs": [{ "question": "string", "short_answer": "string", "expanded_answer": "string" }],
  "seo_expanders": [{ "title": "string", "body": "string" }],
  "location": { "enabled": false, "headline": "{service_name} in {country}", "body": "string" },
  "seo": { "title": "string", "canonical_url": "string", "og_title": "string", "og_description": "string" },
  "uniqueness": { "seed": "{uniqueness_seed}", "notes": "string" }
}

Counts:
- problems: 4-6
- solution_bullets: 4-6
- features: 6-8
- benefits: 6-8
- use_cases: 4-6
- process_steps: 5-7
- tech_stack: 6-12 and include tool_stack items
- industry_applications: 6
- comparison.rows: 5-8
- roi.highlights: 3-5
- related_services: 4
- faqs: 6-8
- seo_expanders: 3
PROMPT;

        $variables = [];
        preg_match_all('/\{([a-zA-Z0-9_]+)\}/', $promptText, $matches);
        if (!empty($matches[1])) {
            $variables = array_values(array_unique(array_map('strval', $matches[1])));
            sort($variables);
        }

        $promptId = DB::table('ai_prompts')->insertGetId([
            'key' => $key,
            'name' => 'Service Page Prompt',
            'description' => 'Default prompt for generating service page content_json.',
            'is_active' => true,
            'variables_json' => json_encode($variables),
            'current_version_id' => null,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        $hash = sha1(mb_strtolower(trim(preg_replace('/\s+/', ' ', $promptText))));
        $versionId = DB::table('ai_prompt_versions')->insertGetId([
            'ai_prompt_id' => $promptId,
            'version_number' => 1,
            'prompt_text' => $promptText,
            'variables_json' => json_encode($variables),
            'content_hash' => $hash,
            'created_by_admin_id' => null,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        DB::table('ai_prompts')->where('id', $promptId)->update([
            'current_version_id' => $versionId,
            'updated_at' => $now,
        ]);
    }

    public function down(): void
    {
        if (!Schema::hasTable('ai_prompts')) {
            return;
        }

        $prompt = DB::table('ai_prompts')->where('key', 'service_page')->first();
        if (!$prompt) {
            return;
        }

        if (Schema::hasTable('ai_prompt_versions')) {
            DB::table('ai_prompt_versions')->where('ai_prompt_id', $prompt->id)->delete();
        }

        DB::table('ai_prompts')->where('id', $prompt->id)->delete();
    }
};

