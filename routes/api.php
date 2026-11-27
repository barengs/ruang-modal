<?php

use App\Http\Controllers\Api\Admin\ChatController;
use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Controllers\Api\Admin\MasterOptionController;
use App\Http\Controllers\Api\Admin\ModalController;
use App\Http\Controllers\Api\Admin\MonitoringController;
use App\Http\Controllers\Api\Admin\PasarController;
use App\Http\Controllers\Api\Admin\RoleUserController;
use App\Http\Controllers\Api\Admin\TumbuhController;
use App\Http\Controllers\Api\AlumniController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PublicChatController;
use App\Http\Controllers\Api\PublicController;
use Illuminate\Support\Facades\Route;

// Public endpoints (no authentication required for alumni submissions & showcase)
Route::prefix('public')->group(function () {
    Route::get('/stats', [PublicController::class, 'stats']);
    Route::get('/master-options', [PublicController::class, 'masterOptions']);
    Route::get('/testimonials', [PublicController::class, 'testimonials']);
    Route::get('/pasar', [PublicController::class, 'pasar']);
    Route::get('/pasar-submissions', [PublicController::class, 'pasarList']);
    Route::get('/modal', [PublicController::class, 'modalList']);
    Route::get('/tumbuh', [PublicController::class, 'tumbuhList']);
    Route::post('/modal', [PublicController::class, 'submitModal']);
    Route::post('/modal/{modal}/lampiran', [PublicController::class, 'updateModalLampiran']);
    Route::post('/tumbuh', [PublicController::class, 'submitTumbuh']);
    Route::post('/pasar', [PublicController::class, 'submitPasar']);

    // Public Live Chat endpoints
    Route::post('/chat/start', [PublicChatController::class, 'start']);
    Route::get('/chat/{token}', [PublicChatController::class, 'show']);
    Route::post('/chat/{token}/messages', [PublicChatController::class, 'sendMessage']);
});

// JWT Authentication endpoints
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/social', [AuthController::class, 'socialLogin']);
    Route::post('/check-email', [AuthController::class, 'checkEmail']);

    Route::middleware('auth:api')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/refresh', [AuthController::class, 'refresh']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});

// Protected Alumni Portal endpoints (JWT Auth)
Route::prefix('alumni')->middleware('auth:api')->group(function () {
    Route::get('/dashboard', [AlumniController::class, 'dashboard']);
    Route::post('/modal/{modal}/lampiran', [PublicController::class, 'updateModalLampiran']);
    Route::post('/monitoring', [AlumniController::class, 'storeMonitoring']);
    Route::post('/testimonials', [AlumniController::class, 'storeTestimonial']);
    Route::patch('/profile', [AlumniController::class, 'updateProfile']);
});

// Protected Admin endpoints (JWT + Spatie Permission RBAC)
Route::prefix('admin')->middleware('auth:api')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])
        ->middleware('permission:dashboard.view');

    // Ruang Modal
    Route::get('/modal', [ModalController::class, 'index'])
        ->middleware('permission:modal.view');
    Route::get('/modal/{modal}', [ModalController::class, 'show'])
        ->middleware('permission:modal.view');
    Route::patch('/modal/{modal}', [ModalController::class, 'update'])
        ->middleware('permission:modal.update');
    Route::post('/modal/{modal}/lampiran', [PublicController::class, 'updateModalLampiran'])
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

    // Live Chat Admin
    Route::get('/chats', [ChatController::class, 'index'])
        ->middleware('permission:chat.manage');
    Route::get('/chats/{chatSession}', [ChatController::class, 'show'])
        ->middleware('permission:chat.manage');
    Route::post('/chats/{chatSession}/messages', [ChatController::class, 'reply'])
        ->middleware('permission:chat.manage');
    Route::patch('/chats/{chatSession}/status', [ChatController::class, 'updateStatus'])
        ->middleware('permission:chat.manage');
    Route::delete('/chats/{chatSession}', [ChatController::class, 'destroy'])
        ->middleware('permission:chat.manage');

    // Master Data Options
    Route::get('/master-options', [MasterOptionController::class, 'index'])
        ->middleware('permission:master.manage');
    Route::post('/master-options', [MasterOptionController::class, 'store'])
        ->middleware('permission:master.manage');
    Route::patch('/master-options/{masterOption}', [MasterOptionController::class, 'update'])
        ->middleware('permission:master.manage');
    Route::delete('/master-options/{masterOption}', [MasterOptionController::class, 'destroy'])
        ->middleware('permission:master.manage');

    // Data Akun Alumni Management
    Route::get('/alumni', [RoleUserController::class, 'alumniList'])
        ->middleware('permission:alumni.view|users.manage');
    Route::post('/alumni', [RoleUserController::class, 'storeAlumni'])
        ->middleware('permission:alumni.create|users.manage');
    Route::patch('/alumni/{user}', [RoleUserController::class, 'updateAlumni'])
        ->middleware('permission:alumni.update|users.manage');
    Route::delete('/alumni/{user}', [RoleUserController::class, 'deleteUser'])
        ->middleware('permission:alumni.delete|users.manage');

    // User Pengelola & Role Management (Spatie Permission)
    Route::get('/users', [RoleUserController::class, 'users'])
        ->middleware('permission:users.view|users.manage');
    Route::post('/users', [RoleUserController::class, 'storeUser'])
        ->middleware('permission:users.create|users.manage');
    Route::patch('/users/{user}/role', [RoleUserController::class, 'updateUserRole'])
        ->middleware('permission:users.update|users.manage');
    Route::delete('/users/{user}', [RoleUserController::class, 'deleteUser'])
        ->middleware('permission:users.delete|users.manage');

    Route::get('/roles', [RoleUserController::class, 'roles'])
        ->middleware('permission:roles.manage');
    Route::post('/roles', [RoleUserController::class, 'storeRole'])
        ->middleware('permission:roles.manage');
    Route::patch('/roles/{role}/permissions', [RoleUserController::class, 'updateRolePermissions'])
        ->middleware('permission:roles.manage');
    Route::delete('/roles/{role}', [RoleUserController::class, 'deleteRole'])
        ->middleware('permission:roles.manage');
});
