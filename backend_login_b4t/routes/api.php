<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SuperAdminController;
use App\Http\Controllers\Api\UserManagementController;
use App\Http\Controllers\Api\DashboardStatsController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
| Semua route di file ini otomatis punya prefix /api
| Contoh: /api/login, /api/logout, dst.
|--------------------------------------------------------------------------
*/

/**
 * Public routes (tanpa login)
 */
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'app' => config('app.name'),
        'time' => now()->toDateTimeString(),
    ]);
});

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

/**
 * Protected routes (butuh auth sanctum)
 */
Route::middleware('auth:sanctum')->group(function () {

    /**
     * Endpoint untuk cek user yang sedang login (dibutuhkan frontend)
     * GET /api/me
     */
    Route::get('/me', function (Request $request) {
        return response()->json($request->user());
    });

    // Logout
    Route::post('/logout', [AuthController::class, 'logout']);

    /**
     * Super Admin routes
     */
    Route::middleware('role:super_admin')->prefix('super-admin')->group(function () {
        Route::post('/create-admin', [SuperAdminController::class, 'createAdmin']);
        Route::post('/create-user', [UserManagementController::class, 'createUser']);
        Route::get('/users', [UserManagementController::class, 'allUsers']);

        // ✅ Dashboard stats untuk super admin
        // GET /api/super-admin/dashboard/stats
        Route::get('/dashboard/stats', [DashboardStatsController::class, 'superAdminStats']);

        // (opsional) approve user juga bisa dibuat versi super-admin:
        // Route::post('/approve-user/{id}', [UserManagementController::class, 'approveUser']);
    });

    /**
     * Admin routes (khusus admin)
     */
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('/users', [UserManagementController::class, 'usersOnly']);
        Route::post('/create-user', [UserManagementController::class, 'createUser']);

        // (opsional) approve user versi admin:
        // Route::post('/approve-user/{id}', [UserManagementController::class, 'approveUser']);
    });

    /**
     * Admin + Super Admin routes (shared)
     * Dipakai kalau endpoint-nya sama untuk admin & super_admin.
     */
    Route::middleware('role:admin,super_admin')->group(function () {
        // Approve user (admin dan super admin bisa)
        Route::post('/approve-user/{id}', [UserManagementController::class, 'approveUser']);
    });

    /**
     * User routes
     */
    Route::middleware('role:user')->prefix('user')->group(function () {
        Route::get('/welcome', [UserManagementController::class, 'welcome']);
    });
});
