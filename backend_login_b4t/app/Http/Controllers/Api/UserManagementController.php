<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\LogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

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
            'password' => 'required|min:6',
        ]);

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

        $request->validate([
            'name' => 'sometimes|string',
            'username' => 'sometimes|string|unique:users,username,' . $id,
            'email' => 'sometimes|email|unique:users,email,' . $id,
            'password' => 'sometimes|min:6',
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
        \Illuminate\Support\Facades\Log::info('getMe controller hit. User: ' . ($user ? $user->username : 'NULL'));

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
