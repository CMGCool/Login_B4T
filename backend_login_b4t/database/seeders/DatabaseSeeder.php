<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
{
    User::insert([
        [
            'name' => 'Super Admin',
            'username' => 'superadmin',
            'password' => Hash::make('password123'),
            'role' => 'super_admin',
            'is_approved' => true,
        ],
        [
            'name' => 'Admin 1',
            'username' => 'admin1',
            'password' => Hash::make('password123'),
            'role' => 'admin',
            'is_approved' => true,
        ],
        [
            'name' => 'user',
            'username' => 'user',
            'password' => Hash::make('password123'),
            'role' => 'user',
            'is_approved' => true,
        ],
    ]);
}
}
