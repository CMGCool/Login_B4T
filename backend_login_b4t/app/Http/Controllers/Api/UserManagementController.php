<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

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
     * Welcome page
     */
    public function welcome(Request $request)
    {
        return response()->json([
            'message' => 'Welcome ' . $request->user()->name,
            'role' => $request->user()->role
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
}
