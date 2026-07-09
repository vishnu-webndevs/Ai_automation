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
        if (!Schema::hasColumn('solutions', 'template_slug')) {
            Schema::table('solutions', function (Blueprint $table) {
                $table->string('template_slug')->nullable()->after('slug');
                $table->index('template_slug');
            });
        }

        if (!Schema::hasColumn('integrations', 'template_slug')) {
            Schema::table('integrations', function (Blueprint $table) {
                $table->string('template_slug')->nullable()->after('slug');
                $table->index('template_slug');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('solutions', 'template_slug')) {
            Schema::table('solutions', function (Blueprint $table) {
                $table->dropIndex(['template_slug']);
                $table->dropColumn('template_slug');
            });
        }

        if (Schema::hasColumn('integrations', 'template_slug')) {
            Schema::table('integrations', function (Blueprint $table) {
                $table->dropIndex(['template_slug']);
                $table->dropColumn('template_slug');
            });
        }
    }
};
