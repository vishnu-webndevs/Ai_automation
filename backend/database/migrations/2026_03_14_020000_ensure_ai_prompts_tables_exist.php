<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('ai_prompts')) {
            Schema::create('ai_prompts', function (Blueprint $table) {
                $table->id();
                $table->string('key')->unique();
                $table->string('name');
                $table->text('description')->nullable();
                $table->boolean('is_active')->default(true);
                $table->json('variables_json')->nullable();
                $table->unsignedBigInteger('current_version_id')->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('ai_prompt_versions')) {
            Schema::create('ai_prompt_versions', function (Blueprint $table) {
                $table->id();
                $table->foreignId('ai_prompt_id')->constrained('ai_prompts')->cascadeOnDelete();
                $table->unsignedInteger('version_number')->default(1);
                $table->longText('prompt_text');
                $table->json('variables_json')->nullable();
                $table->string('content_hash')->nullable();
                $table->foreignId('created_by_admin_id')->nullable()->constrained('admins')->nullOnDelete();
                $table->timestamps();
                $table->unique(['ai_prompt_id', 'version_number']);
            });
        }

        if (Schema::hasTable('ai_prompts') && Schema::hasTable('ai_prompt_versions')) {
            $key = 'service_page';
            $exists = DB::table('ai_prompts')->where('key', $key)->exists();

            if (!$exists) {
                $now = now();
                $promptText = "Generate SEO-optimized, conversion-focused service landing page content for Totan.ai as strict JSON.\n\nContext:\n- service_name: {service_name}\n- target_industry: {industry}\n- automation_type: {automation_type}\n- target_problem: {target_problem}\n- tool_stack: {tool_stack}\n- uniqueness_seed: {uniqueness_seed}\n\nRules:\n- Return ONLY valid JSON (no markdown, no code fences).\n- Use globally understandable English for international B2B audiences.\n- Write original copy. Do not reuse generic marketing sentences.\n- Avoid repetition across sections.\n- Do not include images.\n\nOutput must match the exact JSON schema required by the service generator.";

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
        }
    }

    public function down(): void
    {
        return;
    }
};

