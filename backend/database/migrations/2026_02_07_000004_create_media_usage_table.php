<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('media_usage', function (Blueprint $table) {
            $table->id();
            $table->foreignId('media_id')->constrained('media_assets')->onDelete('cascade');
            $table->string('usable_type');
            $table->unsignedBigInteger('usable_id');
            $table->string('field')->nullable();
            $table->timestamps();

            $table->index(['usable_type', 'usable_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('media_usage');
    }
};

