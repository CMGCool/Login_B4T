<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;

class DashboardStatsController extends Controller
{
    public function superAdminStats()
    {
        $totalAdmin = User::where('role', 'admin')->count();
        $totalUser  = User::where('role', 'user')->count();

        return response()->json([
            'total_admin' => $totalAdmin,
            'total_user'  => $totalUser,
        ]);
    }
}
