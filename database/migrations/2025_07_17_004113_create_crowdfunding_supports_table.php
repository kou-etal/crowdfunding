<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('crowdfunding_supports', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('project_id')->constrained('crowdfunding_projects')->cascadeOnDelete();

    
            $table->decimal('amount', 12, 2)->unsigned();

            $table->string('currency', 3)->default('USD');

            $table->string('payment_id', 100)->nullable()->unique(); 
            $table->string('provider', 20)->default('paypal');
            $table->string('stripe_session_id')->nullable();

            $table->timestamp('supported_at')->nullable();
            $table->json('raw_payload')->nullable();

            $table->timestamps();

            $table->index('project_id');
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crowdfunding_supports');
    }
};
