<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SuperAdminController;
use App\Http\Controllers\Api\UserManagementController;
use App\Http\Controllers\Api\GoogleAuthController;
use App\Http\Controllers\Api\DashboardStatsController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
| Semua route di file ini otomatis punya prefix /api
| Contoh: /api/login, /api/logout, dst.
|--------------------------------------------------------------------------
*/


Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Logout route
Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);

//Endpoint untuk super admin melihat semua user dan admin
Route::middleware(['auth:sanctum', 'role:super_admin'])->group(function () {
    Route::get('/super-admin/users', [UserManagementController::class, 'allUsers']);
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

// Google SSO Routes
Route::get('/auth/google/redirect', [GoogleAuthController::class, 'redirect']);
Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback']);

// Endpoint untuk super admin melihat statistik dashboard
Route::middleware(['auth:sanctum', 'role:super_admin'])
    ->get('/super-admin/dashboard-stats', [DashboardStatsController::class, 'superAdminStats']);

// Endpoint untuk admin melihat statistik dashboard
Route::middleware(['auth:sanctum', 'role:admin'])
    ->get('/admin/dashboard-stats', [DashboardStatsController::class, 'adminStats']);