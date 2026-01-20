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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            
            // Transaction identifiers
            $table->string('trx_id')->unique()->comment('Transaction ID from BNI');
            $table->string('virtual_account')->unique()->comment('Virtual Account Number');
            
            // User info
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('customer_name')->nullable();
            $table->string('customer_email')->nullable();
            $table->string('customer_phone')->nullable();
            
            // Payment details
            $table->decimal('amount', 15, 2)->comment('Original transaction amount');
            $table->decimal('payment_amount', 15, 2)->nullable()->comment('Actual payment amount from BNI');
            $table->string('payment_ntb')->nullable()->comment('Payment Number from BNI');
            $table->text('description')->nullable();
            $table->string('billing_type')->nullable()->comment('Billing type (c, b, etc)');
            
            // Status tracking
            $table->enum('status', ['pending', 'paid', 'expired', 'cancelled'])->default('pending');
            $table->timestamp('paid_at')->nullable()->comment('When payment was completed');
            $table->timestamp('expired_at')->nullable()->comment('When VA expires');
            
            // BNI API responses
            $table->json('bni_response')->nullable()->comment('Response from createBilling/inquiryBilling');
            $table->json('bni_callback')->nullable()->comment('Callback data from BNI');
            
            // Timestamps
            $table->timestamps();
            
            // Indexes
            $table->index('trx_id');
            $table->index('user_id');
            $table->index('status');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
