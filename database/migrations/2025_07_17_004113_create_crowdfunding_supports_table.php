<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('crowdfunding_supports', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // 支援者
            $table->foreignId('project_id')->constrained('crowdfunding_projects')->onDelete('cascade'); // プロジェクト
            $table->integer('amount'); // 支援金額

            $table->string('stripe_session_id')->unique(); // Stripe セッションID（重複防止）
            $table->timestamp('supported_at'); // 支援完了日時

            $table->timestamps(); // created_at, updated_at
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crowdfunding_supports');
    }
};
