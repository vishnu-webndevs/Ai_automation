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
        Schema::create('ctas', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('content')->nullable();
            $table->string('button_text')->nullable();
            $table->string('link')->nullable();
            $table->boolean('active_status')->default(true);
            $table->timestamps();
        });

        Schema::create('cta_page_map', function (Blueprint $table) {
            $table->id();
            $table->foreignId('page_id')->constrained('pages')->onDelete('cascade');
            $table->foreignId('cta_id')->constrained('ctas')->onDelete('cascade');
            $table->string('placement')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cta_page_map');
        Schema::dropIfExists('ctas');
    }
};
