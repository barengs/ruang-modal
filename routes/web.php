<?php

use Illuminate\Support\Facades\Route;

// Hybrid Monolith: serve React SPA via Blade + Vite for all non-API routes
Route::view('/{any?}', 'app')->where('any', '^(?!api|up).*$');
