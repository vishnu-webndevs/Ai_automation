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
        Schema::create('internal_links', function (Blueprint $table) {
            $table->id();
            $table->foreignId('source_page_id')->constrained('pages')->onDelete('cascade');
            $table->foreignId('target_page_id')->constrained('pages')->onDelete('cascade');
            $table->string('anchor_text');
            $table->boolean('auto_generated')->default(false);
            $table->timestamps();
            $table->unique(['source_page_id', 'target_page_id', 'anchor_text']);
        });

        Schema::create('keyword_map', function (Blueprint $table) {
            $table->id();
            $table->foreignId('page_id')->constrained('pages')->onDelete('cascade');
            $table->string('keyword');
            $table->boolean('is_primary')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('keyword_map');
        Schema::dropIfExists('internal_links');
    }
};
