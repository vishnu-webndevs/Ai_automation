<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_category_service', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->constrained('services')->cascadeOnDelete();
            $table->foreignId('service_category_id')->constrained('service_categories')->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['service_id', 'service_category_id']);
        });

        if (Schema::hasTable('services') && Schema::hasColumn('services', 'service_category_id')) {
            $rows = DB::table('services')->select(['id', 'service_category_id'])->get();
            foreach ($rows as $row) {
                if (!$row->service_category_id) continue;
                DB::table('service_category_service')->updateOrInsert(
                    ['service_id' => $row->id, 'service_category_id' => $row->service_category_id],
                    ['created_at' => now(), 'updated_at' => now()]
                );
            }
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('service_category_service');
    }
};

