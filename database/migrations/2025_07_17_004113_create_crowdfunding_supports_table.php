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
            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();

            // プロジェクト
            $table->foreignId('project_id')
                ->constrained('crowdfunding_projects')
                ->cascadeOnDelete();

            // 金額（USD前提の小数）: 例) 999,999,999,999.99 まで
            $table->decimal('amount', 12, 2);

            // 通貨: USD 固定（PayPalからも USD を受ける想定）
            $table->string('currency', 3)->default('USD');

            // 決済識別子
            $table->string('payment_id', 100)->nullable()->unique(); // PayPal capture ID 等
            $table->string('provider', 20)->default('paypal');       // 将来 Stripe 等にも拡張可
            $table->string('stripe_session_id')->nullable();         // 予備

            // 完了日時
            $table->timestamp('supported_at')->nullable();

            // Webhook レスポンス等の生JSON（監査/解析用）
            $table->json('raw_payload')->nullable();

            $table->timestamps();

            // よく使う検索のためのインデックス
            $table->index('project_id');
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crowdfunding_supports');
    }
};

