<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SuperAdminController;
use App\Http\Controllers\Api\UserManagementController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// Endpoint untuk super admin membuat admin baru
Route::middleware(['auth:sanctum', 'role:super_admin'])->group(function () {
    Route::post('/super-admin/create-admin', [SuperAdminController::class, 'createAdmin']);
});

//Endpoint super admin untuk membuat user baru
Route::middleware(['auth:sanctum', 'role:super_admin'])
    ->post('/super-admin/create-user', [UserManagementController::class, 'createUser']);

//Endpoint untuk admin untuk membuat user baru
Route::middleware(['auth:sanctum', 'role:admin,super_admin'])
    ->post('/admin/create-user', [UserManagementController::class, 'createUser']);

// Logout route
Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);

// Register route
Route::post('/register', [AuthController::class, 'register']);

// Login route
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
