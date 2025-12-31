<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddGoogleSsoFieldsToUsersTable extends Migration
{
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {

            // google sso fields
            $table->string('google_id')->nullable()->after('email');
            $table->string('avatar')->nullable()->after('google_id');

            // provider login
            $table->enum('provider', ['local', 'google'])
                ->default('local')
                ->after('avatar');

            // password nullable (SSO)
            $table->string('password')->nullable()->change();

            // email should be unique
            $table->unique('email');
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['email']);
            $table->dropColumn(['google_id', 'avatar', 'provider']);
        });
    }
}
