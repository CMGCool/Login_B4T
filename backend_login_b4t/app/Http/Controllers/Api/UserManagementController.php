<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\LogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class UserManagementController extends Controller
{
    /**
     * SUPER ADMIN
     * Lihat admin + user
     */
    public function allUsers()
    {
        $users = User::whereIn('role', ['admin', 'user'])
            ->select('id', 'name', 'username', 'email', 'role', 'is_approved', 'created_at')
            ->get();

        return response()->json([
            'data' => $users
        ]);
    }

    /**
     * ADMIN
     * Lihat user saja
     */
    public function usersOnly()
    {
        $users = User::where('role', 'user')
            ->select('id', 'name', 'username', 'email', 'is_approved', 'created_at')
            ->get();

        return response()->json([
            'data' => $users
        ]);
    }

    /**
     * USER
     * Lihat welcome page
     */
    public function welcome(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'message' => 'Welcome ' . $user->name,
            'role' => $user->role,
            // ✅ DATA YANG DIPAKAI FRONTEND
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
            ]
        ]);
    }

    public function approveUser($id)
    {
        $user = User::where('role', 'user')->findOrFail($id);

        if ($user->is_approved) {
            return response()->json([
                'message' => 'User already approved'
            ], 400);
        }

        $user->is_approved = true;
        $user->save();

        LogService::create([
            'action' => 'approve',
            'model' => 'User',
            'model_id' => $user->id,
            'description' => "Approved user {$user->username}",
            'new_values' => ['is_approved' => true],
        ]);

        return response()->json([
            'message' => 'User approved successfully',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'is_approved' => $user->is_approved
            ]
        ]);
    }

    /**
     * Admin dan Super Admin 
     * Create user
     */

    public function createUser(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'username' => 'required|string|unique:users',
            'email' => 'nullable|email|unique:users',
            'password' => 'required|min:8',
        ], [
            'email.email'   => 'Format email tidak valid',
            'password.min'  => 'Password minimal 8 karakter',
        ]);

        // Early duplicate check untuk respon 409 yang lebih jelas
        if (User::where('username', $request->username)->exists()) {
            return response()->json([
                'message' => 'Username sudah dipakai',
                'field' => 'username'
            ], 409);
        }

        if ($request->email && User::where('email', $request->email)->exists()) {
            return response()->json([
                'message' => 'Email sudah dipakai',
                'field' => 'email'
            ], 409);
        }

        $newUser = User::create([
            'name' => $request->name,
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'user',
            'is_approved' => true,
        ]);

        LogService::logCrud('create', User::class, $newUser);

        return response()->json([
            'message' => 'User berhasil dibuat'
        ], 201);
    }

    /**
     * Admin dan Super Admin 
     * Update user
     */
    public function updateUser(Request $request, $id)
    {
        $user = User::findOrFail($id);

        // Admin hanya bisa update user, bukan admin atau super admin
        if ($request->user()->role === 'admin' && $user->role !== 'user') {
            return response()->json([
                'message' => 'Admin hanya bisa update user'
            ], 403);
        }

        // Prevent Google SSO users dari edit email dan password
        if ($user->provider === 'google') {
            if ($request->has('email') && $request->email !== $user->email) {
                return response()->json([
                    'message' => 'Email linked ke Google account, tidak bisa diubah'
                ], 403);
            }
            if ($request->has('password')) {
                return response()->json([
                    'message' => 'Password user Google SSO tidak dapat diubah'
                ], 403);
            }
        }

        // Early duplicate check SEBELUM validasi (untuk user lain, exclude diri sendiri)
        $errors = [];

        if ($request->has('username') && User::where('username', $request->username)->where('id', '!=', $id)->exists()) {
            $errors['username'] = 'Username sudah dipakai';
        }

        if ($request->has('email') && User::where('email', $request->email)->where('id', '!=', $id)->exists()) {
            $errors['email'] = 'Email sudah dipakai';
        }

        // Cek format email
        if ($request->has('email') && !filter_var($request->email, FILTER_VALIDATE_EMAIL)) {
            $errors['email'] = 'Format email tidak valid';
        }

        // Cek password minimal 8 karakter
        if ($request->has('password') && strlen($request->password) < 8) {
            $errors['password'] = 'Password minimal 8 karakter';
        }

        // Return semua error sekaligus jika ada
        if (!empty($errors)) {
            return response()->json([
                'message' => 'Data tidak valid',
                'errors' => $errors
            ], 409);
        }

        // Jika semua validation pass, lanjut cek field lain (name, username format)
        $request->validate([
            'name' => 'sometimes|string',
            'username' => 'sometimes|string',
        ]);

        $oldData = $user->toArray();

        if ($request->has('name')) {
            $user->name = $request->name;
        }
        if ($request->has('username')) {
            $user->username = $request->username;
        }
        if ($request->has('email')) {
            $user->email = $request->email;
        }
        if ($request->has('password')) {
            $user->password = Hash::make($request->password);
        }

        $user->save();

        LogService::logCrud('update', User::class, $user, $oldData);

        return response()->json([
            'message' => 'User berhasil diupdate',
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'role' => $user->role,
                'is_approved' => $user->is_approved
            ]
        ]);
    }

    /**
     * Admin dan Super Admin 
     * Delete user
     */
    public function deleteUser(Request $request, $id)
    {
        $user = User::findOrFail($id);

        // Tidak boleh delete admin atau super admin
        if ($request->user()->role === 'admin' && $user->role !== 'user') {
            return response()->json([
                'message' => 'Admin hanya bisa menghapus user'
            ], 403);
        }

        $oldData = $user->toArray();
        LogService::logCrud('delete', User::class, $user, $oldData);
        $user->delete();

        return response()->json([
            'message' => 'User berhasil dihapus'
        ]);
    }

    /**
     * Semua Role (Super Admin, Admin, User)
     * Get current user profile untuk sidebar/profile
     */
    public function getMe(Request $request)
    {
        $user = $request->user();
        Log::info('getMe controller hit. User: ' . ($user ? $user->username : 'NULL'));

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'username' => $user->username,
            'email' => $user->email,
            'role' => $user->role,
            'is_approved' => $user->is_approved,
            'provider' => $user->provider,
            'created_at' => $user->created_at
        ]);
    }
}
