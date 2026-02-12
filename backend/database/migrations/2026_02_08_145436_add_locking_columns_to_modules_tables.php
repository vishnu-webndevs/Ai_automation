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
        $tables = [
            'pages',
            'services',
            'industries',
            'use_cases',
            'solutions',
            'integrations',
            'blog_categories',
            'blog_tags',
            'ctas',
            'redirects',
            'menus',
        ];

        foreach ($tables as $table) {
            if (Schema::hasTable($table)) {
                Schema::table($table, function (Blueprint $table) {
                    $table->timestamp('locked_at')->nullable();
                    $table->foreignId('locked_by')->nullable()->constrained('admins')->nullOnDelete();
                });
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $tables = [
            'pages',
            'services',
            'industries',
            'use_cases',
            'solutions',
            'integrations',
            'blog_categories',
            'blog_tags',
            'ctas',
            'redirects',
            'menus',
        ];

        foreach ($tables as $table) {
            if (Schema::hasTable($table)) {
                Schema::table($table, function (Blueprint $table) {
                    $table->dropForeign(['locked_by']);
                    $table->dropColumn(['locked_at', 'locked_by']);
                });
            }
        }
    }
};
