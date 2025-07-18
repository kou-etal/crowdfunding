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
   Schema::create('paid_post_purchases', function (Blueprint $table) {
    $table->id();

    $table->foreignId('user_id')->constrained()->onDelete('cascade'); // 購入者
    $table->foreignId('paid_post_id')->constrained()->onDelete('cascade'); // 投稿
    $table->string('stripe_session_id')->unique(); // CheckoutセッションID
    $table->timestamp('purchased_at'); // Stripeで購入完了した日時

    $table->timestamps(); // created_at / updated_at（念のため残してOK）
});


    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('paid_post_purchases');
    }
};
