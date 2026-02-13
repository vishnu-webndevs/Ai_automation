<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Create page_templates table
        Schema::create('page_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('preview_image')->nullable();
            $table->json('config_json')->nullable(); // Stores section structure
            $table->timestamps();
        });

        // 2. Add template_slug to pages table
        Schema::table('pages', function (Blueprint $table) {
            $table->string('template_slug')->nullable()->after('slug');
            // We use a loose reference (string slug) instead of a foreign key ID 
            // to allow templates to be defined in code/frontend without strict DB dependency if needed,
            // but here we are backing it with a DB table.
            // Index for faster lookups
            $table->index('template_slug');
        });
    }

    public function down(): void
    {
        Schema::table('pages', function (Blueprint $table) {
            $table->dropIndex(['template_slug']);
            $table->dropColumn('template_slug');
        });

        Schema::dropIfExists('page_templates');
    }
};
