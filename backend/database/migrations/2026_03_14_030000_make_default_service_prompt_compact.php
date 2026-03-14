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

        $prompt = DB::table('ai_prompts')->where('key', 'service_page')->first();
        if (!$prompt) {
            return;
        }

        $currentVersion = null;
        if (!empty($prompt->current_version_id)) {
            $currentVersion = DB::table('ai_prompt_versions')->where('id', $prompt->current_version_id)->first();
        }
        if (!$currentVersion) {
            return;
        }

        $oldDefaultText = "Generate SEO-optimized, conversion-focused service landing page content for Totan.ai as strict JSON.\n\nContext:\n- service_name: {service_name}\n- target_industry: {industry}\n- automation_type: {automation_type}\n- target_problem: {target_problem}\n- tool_stack: {tool_stack}\n- uniqueness_seed: {uniqueness_seed}\n\nRules:\n- Return ONLY valid JSON (no markdown, no code fences).\n- Use globally understandable English for international B2B audiences.\n- Write original copy. Do not reuse generic marketing sentences.\n- Avoid repetition across sections.\n- Do not include images.\n\nOutput must match the exact JSON schema required by the service generator.";
        $oldHash = sha1(mb_strtolower(trim(preg_replace('/\s+/', ' ', $oldDefaultText))));

        $currentHash = (string)($currentVersion->content_hash ?? '');
        if ($currentHash !== '' && $currentHash !== $oldHash) {
            return;
        }

        $compact = <<<PROMPT
Return ONLY valid JSON (no markdown). Generate original, non-repetitive service landing content for Totan.ai.

Context vars:
service_name={service_name}
industry={industry}
automation_type={automation_type}
target_problem={target_problem}
tool_stack={tool_stack}
service_slug={service_slug}
uniqueness_seed={uniqueness_seed}

Hard rules:
- JSON must match the schema and key names exactly; no extra keys/sections; no duplicate CTAs.
- Global B2B English. No images. No repeated sentences across sections.

Schema (all keys required):
service_name, meta_title(<=60), meta_description(<=160),
hero{headline,subheadline,short_description,trust_text,primary_cta_label,secondary_cta_label},
intro{body(100-150w),key_outcomes[3-6]},
problems[4-6]{title,summary},
solution_bullets[4-6]{title,text},
features[6-8]{title,description,icon},
benefits[6-8]{title,description,metric_range},
use_cases[4-6]{title,industry,summary},
process_steps[5-7]{title,description},
tech_stack[6-12 strings include tool_stack items],
industry_applications[6]{title,body},
comparison{left_label,right_label,rows[5-8]{topic,left,right}},
roi{highlights[3-5]{title,value,note},before_after_rows[2-5]{metric,before,after}},
related_services[4]{title,href(/services/{slug}),summary},
faqs[6-8]{question,short_answer,expanded_answer},
seo_expanders[3]{title,body},
location{enabled(false),headline,body},
seo{title,canonical_url,og_title,og_description},
uniqueness{seed,notes}
PROMPT;

        $variables = [];
        preg_match_all('/\{([a-zA-Z0-9_]+)\}/', $compact, $matches);
        if (!empty($matches[1])) {
            $variables = array_values(array_unique(array_map('strval', $matches[1])));
            sort($variables);
        }

        $hash = sha1(mb_strtolower(trim(preg_replace('/\s+/', ' ', $compact))));
        $nextVersion = ((int)(DB::table('ai_prompt_versions')->where('ai_prompt_id', $prompt->id)->max('version_number') ?? 0)) + 1;
        $now = now();

        $versionId = DB::table('ai_prompt_versions')->insertGetId([
            'ai_prompt_id' => $prompt->id,
            'version_number' => $nextVersion,
            'prompt_text' => $compact,
            'variables_json' => json_encode($variables),
            'content_hash' => $hash,
            'created_by_admin_id' => null,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        DB::table('ai_prompts')->where('id', $prompt->id)->update([
            'current_version_id' => $versionId,
            'variables_json' => json_encode($variables),
            'updated_at' => $now,
        ]);
    }

    public function down(): void
    {
        return;
    }
};

