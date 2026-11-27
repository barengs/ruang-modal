<?php

use Illuminate\Support\Facades\Route;

// Serve uploaded files securely with fallback from public/uploads or storage/app/public/uploads
Route::get('/uploads/{path}', function ($path) {
    $cleanPath = ltrim(str_replace(['../', '..\\'], '', $path), '/');

    // 1. Cek di public_path('uploads/...')
    $publicFile = public_path('uploads/'.$cleanPath);
    if (file_exists($publicFile) && is_file($publicFile)) {
        return response()->file($publicFile);
    }

    // 2. Cek di storage_path('app/public/uploads/...')
    $storageUploads = storage_path('app/public/uploads/'.$cleanPath);
    if (file_exists($storageUploads) && is_file($storageUploads)) {
        return response()->file($storageUploads);
    }

    // 3. Cek di storage_path('app/public/...')
    $storageRoot = storage_path('app/public/'.$cleanPath);
    if (file_exists($storageRoot) && is_file($storageRoot)) {
        return response()->file($storageRoot);
    }

    abort(404, 'Berkas lampiran tidak ditemukan.');
})->where('path', '.*');

// Hybrid Monolith: serve React SPA via Blade + Vite for all non-API routes
Route::view('/{any?}', 'app')->where('any', '^(?!api|up|uploads|storage).*$');

