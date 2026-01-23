<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use App\Http\Controllers\Controller;
use Illuminate\Database\QueryException;

class SuperAdminController extends Controller
{
    public function createAdmin(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'username' => 'required|string|unique:users,username',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|min:8',
        ], [
            'email.email'   => 'Format email tidak valid',
            'password.min'  => 'Password minimal 8 karakter',
        ]);

        // Guard clause untuk duplicate sebelum query insert (lebih jelas untuk client)
        if (User::where('username', $request->username)->exists()) {
            return response()->json([
                'message' => 'Username sudah dipakai',
                'field' => 'username'
            ], 409);
        }

        if (User::where('email', $request->email)->exists()) {
            return response()->json([
                'message' => 'Email sudah dipakai',
                'field' => 'email'
            ], 409);
        }

        try {
            $admin = User::create([
                'name'        => $request->name,
                'username'    => $request->username,
                'email'       => $request->email,
                'password'    => Hash::make($request->password),
                'role'        => 'admin',
                'is_approved' => 1, // admin langsung aktif
            ]);
        } catch (QueryException $e) {
            // Fallback jika race condition duplicate di level DB
            if (isset($e->errorInfo[1]) && $e->errorInfo[1] === 1062) { // duplicate entry
                $duplicateField = 'Username atau email sudah dipakai';

                $message = $e->errorInfo[2] ?? '';
                if (strpos($message, 'users_username_unique') !== false) {
                    $duplicateField = 'Username sudah dipakai';
                } elseif (strpos($message, 'users_email_unique') !== false) {
                    $duplicateField = 'Email sudah dipakai';
                }

                return response()->json([
                    'message' => $duplicateField,
                ], 409);
            }

            throw $e;
        }

        return response()->json([
            'message' => 'Admin berhasil dibuat',
            'data'    => $admin
        ], 201);
    }
}
