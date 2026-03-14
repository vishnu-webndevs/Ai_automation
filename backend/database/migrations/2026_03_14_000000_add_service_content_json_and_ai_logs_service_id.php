<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('services', function (Blueprint $table) {
            if (!Schema::hasColumn('services', 'content_json')) {
                $table->json('content_json')->nullable()->after('full_description');
            }
        });

        Schema::table('ai_generation_logs', function (Blueprint $table) {
            if (!Schema::hasColumn('ai_generation_logs', 'service_id')) {
                $table->foreignId('service_id')->nullable()->after('page_id')->constrained('services')->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('ai_generation_logs', function (Blueprint $table) {
            if (Schema::hasColumn('ai_generation_logs', 'service_id')) {
                $table->dropConstrainedForeignId('service_id');
            }
        });

        Schema::table('services', function (Blueprint $table) {
            if (Schema::hasColumn('services', 'content_json')) {
                $table->dropColumn('content_json');
            }
        });
    }
};

