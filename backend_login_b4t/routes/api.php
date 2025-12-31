<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SuperAdminController;
use App\Http\Controllers\Api\UserManagementController;
use App\Http\Controllers\Api\GoogleAuthController;

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

//Endpoint untuk super admin melihat semua user dan admin
Route::middleware(['auth:sanctum', 'role:super_admin'])->group(function () {
    Route::get('/super-admin/users', [UserManagementController::class, 'allUsers']);
});

//Endpoint untuk admin melihat user saja
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::get('/admin/users', [UserManagementController::class, 'usersOnly']);
});

// Endpoint untuk user melihat welcome page
Route::middleware(['auth:sanctum', 'role:user'])->group(function () {
    Route::get('/user/welcome', [UserManagementController::class, 'welcome']);
});

// Endpoint untuk admin dan super admin menyetujui user
Route::middleware(['auth:sanctum', 'role:admin,super_admin'])
    ->post('/approve-user/{id}', [UserManagementController::class, 'approveUser']);

// Google SSO Routes
Route::get('/auth/google/redirect', [GoogleAuthController::class, 'redirect']);
Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback']);
