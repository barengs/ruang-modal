<?php

use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Controllers\Api\Admin\ModalController;
use App\Http\Controllers\Api\Admin\MonitoringController;
use App\Http\Controllers\Api\Admin\PasarController;
use App\Http\Controllers\Api\Admin\RoleUserController;
use App\Http\Controllers\Api\Admin\TumbuhController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PublicController;
use Illuminate\Support\Facades\Route;

// Public endpoints (no authentication required for alumni submissions & showcase)
Route::prefix('public')->group(function () {
    Route::get('/stats', [PublicController::class, 'stats']);
    Route::get('/pasar', [PublicController::class, 'pasar']);
    Route::post('/modal', [PublicController::class, 'submitModal']);
    Route::post('/tumbuh', [PublicController::class, 'submitTumbuh']);
    Route::post('/pasar', [PublicController::class, 'submitPasar']);
});

// JWT Authentication endpoints
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:api')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/refresh', [AuthController::class, 'refresh']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});

// Protected Admin endpoints (JWT + Spatie Permission RBAC)
Route::prefix('admin')->middleware('auth:api')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])
        ->middleware('permission:dashboard.view');

    // Ruang Modal
    Route::get('/modal', [ModalController::class, 'index'])
        ->middleware('permission:modal.view');
    Route::patch('/modal/{modal}', [ModalController::class, 'update'])
        ->middleware('permission:modal.update');
    Route::delete('/modal/{modal}', [ModalController::class, 'destroy'])
        ->middleware('permission:modal.delete');

    // Ruang Tumbuh
    Route::get('/tumbuh', [TumbuhController::class, 'index'])
        ->middleware('permission:tumbuh.view');
    Route::patch('/tumbuh/{tumbuh}', [TumbuhController::class, 'update'])
        ->middleware('permission:tumbuh.update');
    Route::delete('/tumbuh/{tumbuh}', [TumbuhController::class, 'destroy'])
        ->middleware('permission:tumbuh.delete');

    // Ruang Pasar
    Route::get('/pasar', [PasarController::class, 'index'])
        ->middleware('permission:pasar.view');
    Route::patch('/pasar/{pasar}', [PasarController::class, 'update'])
        ->middleware('permission:pasar.moderate');
    Route::delete('/pasar/{pasar}', [PasarController::class, 'destroy'])
        ->middleware('permission:pasar.delete');

    // Monitoring
    Route::get('/monitoring', [MonitoringController::class, 'index'])
        ->middleware('permission:monitoring.view');
    Route::post('/monitoring', [MonitoringController::class, 'store'])
        ->middleware('permission:monitoring.create');
    Route::patch('/monitoring/{monitoring}', [MonitoringController::class, 'update'])
        ->middleware('permission:monitoring.create');
    Route::delete('/monitoring/{monitoring}', [MonitoringController::class, 'destroy'])
        ->middleware('permission:monitoring.delete');

    // User & Role Management (Spatie Permission)
    Route::get('/users', [RoleUserController::class, 'users'])
        ->middleware('permission:users.manage');
    Route::post('/users', [RoleUserController::class, 'storeUser'])
        ->middleware('permission:users.manage');
    Route::patch('/users/{user}/role', [RoleUserController::class, 'updateUserRole'])
        ->middleware('permission:users.manage');
    Route::delete('/users/{user}', [RoleUserController::class, 'deleteUser'])
        ->middleware('permission:users.manage');

    Route::get('/roles', [RoleUserController::class, 'roles'])
        ->middleware('permission:roles.manage');
    Route::patch('/roles/{role}/permissions', [RoleUserController::class, 'updateRolePermissions'])
        ->middleware('permission:roles.manage');
});
