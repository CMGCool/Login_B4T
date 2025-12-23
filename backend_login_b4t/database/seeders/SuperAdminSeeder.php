<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class SuperAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        User::create([
            'name' => 'Super Admin',
            'username' => 'superadmin',
            'password' => Hash::make('password123'),
            'role' => 'super_admin',
            'is_approved' => true,
        ]);
    }
}
