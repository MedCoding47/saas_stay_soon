<?php
use App\Http\Controllers\AdminController;
use App\Http\Controllers\PetController;
use App\Http\Controllers\AdoptFormController;

// Admin Login
Route::post('/admin/login', [AdminController::class, 'login']);

// Admin Routes (Protected by Sanctum Middleware)
Route::middleware('auth:sanctum')->group(function () {
    // Pets
    Route::get('/pets', [PetController::class, 'index']);
    Route::post('/pets', [PetController::class, 'store']);
    Route::get('/pets/{id}', [PetController::class, 'show']);
    Route::put('/pets/{id}', [PetController::class, 'update']);
    Route::delete('/pets/{id}', [PetController::class, 'destroy']);

    // Adopt Forms
    Route::apiResource('adopt-forms', AdoptFormController::class);
    Route::get('/adopt-forms', [AdoptFormController::class, 'index']);
    Route::post('/adopt-forms', [AdoptFormController::class, 'store']);
    Route::get('/adopt-forms/{id}', [AdoptFormController::class, 'show']);
    Route::put('/adopt-forms/{id}', [AdoptFormController::class, 'update']);
    Route::delete('/adopt-forms/{id}', [AdoptFormController::class, 'destroy']);
});


Route::options('/{any}', function () {
    return response()->json();
})->where('any', '.*');

Route::get('/pets', [PetController::class, 'index']);



use App\Http\Controllers\AuthController;

Route::prefix('client')->group(function () {
    Route::post('/register', [AuthController::class, 'clientRegister']);
    Route::post('/login', [AuthController::class, 'clientLogin']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('/logout', [AuthController::class, 'logout']);
});



use App\Http\Controllers\UserController;
Route::middleware('auth:sanctum')->group(function () {
    // Route pour le profil de l'utilisateur connecté
    Route::get('/profile', [UserController::class, 'profile']);
    
    // Routes pour les utilisateurs
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::post('/users', [UserController::class, 'store']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);
});


use App\Http\Controllers\AdminAdoptionController;

Route::middleware('auth:sanctum')->prefix('admin')->group(function () {
    Route::get('/adoptions', [AdminAdoptionController::class, 'index']);
    Route::patch('/adoptions/{id}/status', [AdminAdoptionController::class, 'updateStatus']);
});


use Illuminate\Http\Request;

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user(); // ✅ CORRECT : via injection
});

use App\Http\Controllers\ClientAdoptionController;

Route::middleware('auth:sanctum')->get('/client/adoptions', [ClientAdoptionController::class, 'index']);

use App\Http\Controllers\NotificationController;

// Add these routes to your existing api.php
Route::middleware('auth:sanctum')->group(function () {
    // Notifications routes
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    
    // Client adoption routes
    Route::get('/client/adoptions', [ClientAdoptionController::class, 'index']);
});