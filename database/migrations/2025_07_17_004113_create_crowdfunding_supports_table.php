<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('crowdfunding_supports', function (Blueprint $table) {
            $table->id();

            // 支援者
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            // プロジェクト
            $table->foreignId('project_id')
                  ->constrained('crowdfunding_projects')
                  ->onDelete('cascade');

            // 金額・通貨
            $table->integer('amount');
            $table->string('currency', 3)->default('JPY');

            // 支払い情報
            $table->string('payment_id', 100)->nullable()->unique(); // PayPal取引ID
            $table->string('provider', 20)->default('paypal'); // 'paypal'固定
            $table->string('stripe_session_id')->nullable();   // 将来用

            // 完了日時
            $table->timestamp('supported_at')->nullable();

            // Webhookレスポンス等のJSON
            $table->json('raw_payload')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crowdfunding_supports');
    }
};

