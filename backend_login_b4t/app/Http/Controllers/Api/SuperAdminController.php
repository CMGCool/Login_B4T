<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use App\Http\Controllers\Controller;

class SuperAdminController extends Controller
{
    public function createAdmin(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'username' => 'required|string|unique:users,username',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|min:6',
        ]);

        $admin = User::create([
            'name'        => $request->name,
            'username'    => $request->username,
            'email'       => $request->email,
            'password'    => Hash::make($request->password),
            'role'        => 'admin',
            'is_approved' => 1, // admin langsung aktif
        ]);

        return response()->json([
            'message' => 'Admin berhasil dibuat',
            'data'    => $admin
        ], 201);
    }

    
}
