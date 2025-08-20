<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Broadcast;
use App\Http\Controllers\RegisterApiController;
use App\Http\Controllers\AuthApiController;
use App\Http\Controllers\ProfileApiController;
use App\Http\Middleware\AdminMiddleware;
use App\Http\Controllers\VerifyEmailController;
use App\Http\Controllers\StripeWebhookController;
use App\Http\Controllers\CrowdfundingProjectApiController;
use App\Http\Controllers\CrowdfundingSupportApiController;
use App\Http\Controllers\IdentityVerificationApiController;
use App\Http\Controllers\IdentityVerificationAdminController;
use App\Http\Controllers\PayoutRecordApiController;
use App\Http\Controllers\PayPalWebhookController;


Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware(['auth:sanctum']);

Route::post('/register',[RegisterApiController::class, 'register']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/profile', [ProfileApiController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileApiController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileApiController::class, 'destroy'])->name('profile.destroy');
});



Route::middleware('auth:sanctum')->group(function () {
    Route::get('/profile', [ProfileApiController::class, 'show']);
    Route::post('/profile', [ProfileApiController::class, 'updateIntroduction']);
    Route::post('/profile-image', [ProfileApiController::class, 'uploadImage']);
});


Route::post('/paypal/webhook', [PayPalWebhookController::class, 'handleWebhook']);


Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/identity-verifications', [IdentityVerificationAdminController::class, 'index']);
    Route::post('/identity-verifications/{id}/reject', [IdentityVerificationAdminController::class, 'reject']);
});


Route::middleware('auth:sanctum')->group(function () {
    Route::post('/identity-verification/upload-images', [IdentityVerificationApiController::class, 'uploadVerificationImages']);
    Route::post('/identity-verification', [IdentityVerificationApiController::class, 'store']);
});


Route::middleware('auth:sanctum')->group(function () {
    Route::post('/crowdfunding-supports/session', [CrowdfundingSupportApiController::class, 'createPaypalSession']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/crowdfunding-projects', [CrowdfundingProjectApiController::class, 'store']);
});

Route::get('/crowdfunding-projects', [CrowdfundingProjectApiController::class, 'index']);

Route::get('/crowdfunding-projects/{id}', [CrowdfundingProjectApiController::class, 'show']);















Route::middleware(['auth:sanctum',AdminMiddleware::class])->group(function () {
    Route::get('/admin/users', [ProfileApiController::class, 'index']);
    Route::get('/identity-verifications', [IdentityVerificationAdminController::class, 'index']);
    Route::post('/crowdfunding-projects/{id}/approve', [CrowdfundingProjectApiController::class, 'approve']);
    Route::post('/crowdfunding-projects/{id}/reject', [CrowdfundingProjectApiController::class, 'reject']);
    Route::post('/identity-verifications/{id}/reject', [IdentityVerificationAdminController::class, 'reject']);
    Route::post('/identity-verifications/{id}/approve', [IdentityVerificationAdminController::class, 'approve']);
    Route::get('/admin/pending-projects', [CrowdfundingProjectApiController::class, 'pending']);
    Route::get('/admin/payout-records', [PayoutRecordApiController::class, 'index']);
    Route::post('/admin/payout-records/{id}/mark-paid', [PayoutRecordApiController::class, 'markAsPaid']);
    
});


Route::middleware('auth:sanctum')->group(function () {
    Route::get('/my-projects', [CrowdfundingProjectApiController::class, 'myProjects']);
});









Route::get('/email/verify/{id}/{hash}',VerifyEmailController::class)
    ->middleware(['throttle:6,1'])
    ->name('verification.verify');





Route::post('/crowdfunding-projects/image', [CrowdfundingProjectApiController::class, 'uploadProjectImage']);