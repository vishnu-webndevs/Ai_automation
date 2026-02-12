<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('redirects', function (Blueprint $table) {
            $table->id();
            $table->string('source_url')->unique();
            $table->string('target_url');
            $table->integer('status_code')->default(301);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('schema_markup', function (Blueprint $table) {
            $table->id();
            $table->foreignId('page_id')->nullable()->constrained('pages')->onDelete('cascade');
            $table->string('type');
            $table->json('schema_json');
            $table->timestamps();
        });

        Schema::create('sitemap_cache', function (Blueprint $table) {
            $table->id();
            $table->string('url')->unique();
            $table->timestamp('last_modified')->nullable();
            $table->string('change_freq')->default('weekly');
            $table->float('priority')->default(0.5);
            $table->string('type');
            $table->timestamps();
        });

        Schema::create('robots_config', function (Blueprint $table) {
            $table->id();
            $table->string('user_agent')->default('*');
            $table->text('allow_paths')->nullable();
            $table->text('disallow_paths')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('robots_config');
        Schema::dropIfExists('sitemap_cache');
        Schema::dropIfExists('schema_markup');
        Schema::dropIfExists('redirects');
    }
};
