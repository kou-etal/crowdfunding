<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('payout_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('crowdfunding_projects')->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('user_full_name');
            $table->string('user_email');
            $table->integer('total_amount'); // 総支援金額
            $table->integer('platform_fee'); // Stripe手数料引いた後、かつ0.8かけた金額
            $table->timestamp('payout_ready_at'); // 保存時刻（達成 or 期限切れ）
            $table->boolean('is_paid')->default(false); // 管理者が支払完了マークをつけたか
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payout_records');
    }
};
