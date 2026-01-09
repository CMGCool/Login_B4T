<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use App\Services\RecaptchaService;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'username' => 'required|string|unique:users',
            'email' => 'nullable|email|unique:users',
            'password' => 'required|min:6',
        ]);

        User::create([
            'name' => $request->name,
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'user',
            'is_approved' => false,
        ]);

        return response()->json([
            'message' => 'Register berhasil, menunggu approval admin'
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required',
            'password' => 'required',
            'recaptchaToken' => 'sometimes|string',
        ]);

        // Verifikasi hanya jika token ada
        if ($request->has('recaptchaToken') && $request->recaptchaToken) {
            if (!RecaptchaService::verify($request->recaptchaToken)) {
                return response()->json([
                    'message' => 'reCAPTCHA verification failed'
                ], 422);
            }
        }

        $user = User::where('username', $request->username)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Username atau password salah'
            ], 401);
        }

        if (!$user->is_approved) {
            return response()->json([
                'message' => 'Akun belum di-approve'
            ], 403);
        }

        if ($user->provider === 'google') {
            return response()->json([
                'message' => 'Akun ini menggunakan login Google'
            ], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'role' => $user->role,
            'user' => $user
        ]);

        // PROD VERSION (uncomment saat deploy):
        // ])->cookie(
        //     'token',
        //     $token,
        //     60 * 24,
        //     '/',
        //     '.yourdomain.com', // shared subdomain
        //     true, // secure: HTTPS only
        //     true, // httpOnly: tidak bisa diakses JS (XSS protection)
        //     false,
        //     'lax'
        // );

    }

    public function logout(Request $request)
    {
        // Hapus token yang sedang digunakan
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout berhasil'
        ]);

        // PROD VERSION (uncomment saat deploy):
        // ])->cookie(
        //     'token',
        //     '',
        //     -1,
        //     '/',
        //     '.yourdomain.com',
        //     true,
        //     true,
        //     false,
        //     'lax'
        // );
    }
}
