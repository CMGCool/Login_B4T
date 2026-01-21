<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('payments', function (Blueprint $table) {
            // Tambahkan foreign key constraint ke user_id
            $table->foreign('user_id', 'payments_user_id_foreign')
                ->references('id')->on('users')
                ->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropForeign('payments_user_id_foreign');
        });
    }
};
