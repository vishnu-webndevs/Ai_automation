<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
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

        Schema::table('ai_prompts', function (Blueprint $table) {
            $table->foreign('current_version_id')->references('id')->on('ai_prompt_versions')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('ai_prompts', function (Blueprint $table) {
            $table->dropForeign(['current_version_id']);
        });
        Schema::dropIfExists('ai_prompt_versions');
        Schema::dropIfExists('ai_prompts');
    }
};

