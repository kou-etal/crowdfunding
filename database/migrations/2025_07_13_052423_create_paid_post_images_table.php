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
      Schema::create('paid_post_images', function (Blueprint $table) {
    $table->id();
    $table->foreignId('paid_post_id')->constrained()->onDelete('cascade');
    $table->string('path'); // 画像パス（S3やstorage/app/...）
    $table->timestamps();
});

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('paid_post_images');
    }
};
