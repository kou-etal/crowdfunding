<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('crowdfunding_projects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            $table->string('title');
            $table->text('description');

            //ここを decimal(12,2) に変更（USD/小数2桁）
            $table->decimal('goal_amount', 12, 2)->unsigned();

            $table->dateTime('deadline');
            $table->string('image_path')->nullable();
            $table->text('rejected_reason')->nullable();


            $table->boolean('is_submitted')->default(false);
            $table->boolean('is_approved')->default(false);
            $table->boolean('is_rejected')->default(false);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crowdfunding_projects');
    }
};

