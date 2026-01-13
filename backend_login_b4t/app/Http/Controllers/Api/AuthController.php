<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Log;
use Illuminate\Http\Request;
use App\Models\User;
use App\Services\LogService;
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
        LogService::logLogin($user);

        return response()->json([
            'token' => $token,
            'role' => $user->role,
            'user' => $user
        ])->cookie(
            'token',
            $token,
            60 * 24,
            '/',
            null,       // FIX: domain null for localhost
            false,      // FIX: secure false for http
            true,
            false,
            'Lax'
        );
    }

    public function logout(Request $request)
    {
        if ($request->user()) {
            $request->user()->currentAccessToken()?->delete();
        }

        return response()->json([
            'message' => 'Logout berhasil'
        ])->cookie(
            'token',
            '',
            -1,
            '/',
            null,
            false,
            true,
            false,
            'Lax'
        );
    }
    public function ssoFinalize(Request $request)
    {
        $token = $request->input('token');
        
        if (!$token) {
            return response()->json(['message' => 'Token required'], 400);
        }

        // Find the token in the database
        $accessToken = \Laravel\Sanctum\PersonalAccessToken::findToken($token);

        if (!$accessToken || !$accessToken->tokenable) {
            return response()->json(['message' => 'Invalid or expired SSO token'], 401);
        }

        $user = $accessToken->tokenable;

        return response()->json([
            'message' => 'SSO Finalized',
            'role' => $user->role,
            'user' => $user
        ])->cookie(
            'token',
            $token,
            60 * 24,
            '/',
            null,       // domain null for localhost
            false,      // secure false for http
            true,
            false,
            'Lax'
        );
    }
}
