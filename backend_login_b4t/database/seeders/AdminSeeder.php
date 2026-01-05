<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        User::create([
            'name' => 'Admin 1',
            'username' => 'admin1',
            'password' => Hash::make('password123'),
            'role' => 'admin',
            'is_approved' => true,
        ]);
    }
}
