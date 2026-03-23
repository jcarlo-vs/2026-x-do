<?php

use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::get('emails', [UserController::class, 'emails']);
Route::post('send-newsletter', [UserController::class, 'sendNewsletter']);
Route::get('stats', [UserController::class, 'stats']);
Route::get('search', [UserController::class, 'search']);
Route::apiResource('/', UserController::class);
