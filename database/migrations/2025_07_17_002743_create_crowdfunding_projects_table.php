<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
public function up(): void
    {
        Schema::create('crowdfunding_projects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('description');
            $table->integer('goal_amount');
            $table->datetime('deadline');
            $table->string('image_path')->nullable();
            $table->text('rejected_reason')->nullable();

            // ✅ 審査フラグ
            $table->boolean('is_submitted')->default(false); // ユーザーから提出されたか
            $table->boolean('is_approved')->default(false);  // 運営により承認されたか
            $table->boolean('is_rejected')->default(false);  // 運営により却下されたか
           

            $table->timestamps();
        });
}
};
