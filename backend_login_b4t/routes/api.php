<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SuperAdminController;
use App\Http\Controllers\Api\UserManagementController;
use App\Http\Controllers\Api\GoogleAuthController;
use App\Http\Controllers\Api\DashboardStatsController;
use App\Http\Controllers\Api\LayananController;
use App\Http\Controllers\Api\TargetsController;
use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\LogController;
use App\Http\Controllers\Api\ForgotPasswordController;
use App\Http\Controllers\BniTestController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
| Semua route di file ini otomatis punya prefix /api
| Contoh: /api/login, /api/logout, dst.
|--------------------------------------------------------------------------
*/


Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');
Route::post('/auth/sso-finalize', [AuthController::class, 'ssoFinalize']);

// Forgot Password Routes
Route::post('/forgot-password/send-otp', [ForgotPasswordController::class, 'sendOtp']);
Route::post('/forgot-password/verify-otp', [ForgotPasswordController::class, 'verifyOtp']);
Route::post('/forgot-password/reset-password', [ForgotPasswordController::class, 'resetPassword']);

// Logout route
Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);

// Get current user profile (untuk semua role)
Route::middleware('auth:sanctum')->get('/me', [UserManagementController::class, 'getMe']);

//Endpoint untuk super admin melihat semua user dan admin
Route::middleware(['auth:sanctum', 'role:super_admin'])->group(function () {
    Route::get('/super-admin/users', [UserManagementController::class, 'allUsers']);
    //endpoint untuk super admin membuat admin
    Route::post('/super-admin/create-admin', [SuperAdminController::class, 'createAdmin']);
    //endpoint untuk super admin membuat user
    Route::post('/super-admin/create-user', [UserManagementController::class, 'createUser']);
});

//Endpoint untuk admin melihat user saja
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::get('/admin/users', [UserManagementController::class, 'usersOnly']);
    //endpoint untuk admin membuat user
    Route::post('/admin/create-user', [UserManagementController::class, 'createUser']);
});

// Endpoint untuk user melihat welcome page
Route::middleware(['auth:sanctum', 'role:user'])->group(function () {
    Route::get('/user/welcome', [UserManagementController::class, 'welcome']);
});

// Endpoint untuk admin dan super admin menyetujui user
Route::middleware(['auth:sanctum', 'role:admin,super_admin'])
    ->post('/approve-user/{id}', [UserManagementController::class, 'approveUser']);

// Endpoint untuk admin dan super admin mengupdate user
Route::middleware(['auth:sanctum', 'role:admin,super_admin'])
    ->put('/users/{id}', [UserManagementController::class, 'updateUser']);

// Endpoint untuk admin dan super admin menghapus user
Route::middleware(['auth:sanctum', 'role:admin,super_admin'])
    ->delete('/users/{id}', [UserManagementController::class, 'deleteUser']);

// Google SSO Routes
Route::get('/auth/google/redirect', [GoogleAuthController::class, 'redirect']);
Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback']);

// Endpoint untuk super admin melihat statistik dashboard
Route::middleware(['auth:sanctum', 'role:super_admin'])
    ->get('/super-admin/dashboard-stats', [DashboardStatsController::class, 'superAdminStats']);

// Endpoint untuk admin melihat statistik dashboard
Route::middleware(['auth:sanctum', 'role:admin'])
    ->get('/admin/dashboard-stats', [DashboardStatsController::class, 'adminStats']);

// Endpoint untuk CRUD Layanan (hanya admin dan super_admin)
Route::middleware(['auth:sanctum', 'role:admin,super_admin'])->group(function () {
    Route::apiResource('layanan', LayananController::class);
});

// Endpoint untuk dashboard layanan (hanya admin dan super_admin)
Route::middleware(['auth:sanctum', 'role:admin,super_admin'])->group(function () {
    Route::get('/dashboard-layanan/usage', [App\Http\Controllers\Api\DashboardLayananController::class, 'layananUsage']);
    Route::get('/dashboard-layanan/biaya-per-minggu', [App\Http\Controllers\Api\DashboardLayananController::class, 'biayaPerMinggu']);
});

// Endpoint untuk CRUD target (hanya admin dan super_admin)
Route::middleware(['auth:sanctum', 'role:admin,super_admin'])->group(function () {
    Route::apiResource('target', TargetsController::class);
});

// Endpoint untuk Analytics/Chart (admin dan super_admin)
Route::middleware(['auth:sanctum', 'role:admin,super_admin'])->group(function () {
    Route::get('/analytics/chart-biaya-vs-target', [AnalyticsController::class, 'chartBiayaVsTarget']);
});

// Endpoint untuk Logs (hanya super_admin)
Route::middleware(['auth:sanctum', 'role:super_admin'])->group(function () {
    Route::get('/logs', [LogController::class, 'index']);
    Route::get('/logs/{id}', [LogController::class, 'show']);
    Route::delete('/logs/cleanup', [LogController::class, 'cleanup']);
});

// Endpoint untuk testing BNI eCollection (sementara hanya super_admin)
Route::middleware(['auth:sanctum', 'role:super_admin'])->group(function () {
    Route::post('/bni/create', [BniTestController::class, 'create']);
    Route::post('/bni/inquiry', [BniTestController::class, 'inquiry']);
    Route::post('/bni/update-billing', [BniTestController::class, 'update']);
});
