<?php

namespace App\Http\Controllers;

use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Services\UserService;

class RegisterApiController extends Controller
{
    public function register(RegisterRequest $request, UserService $service)
    {
        $user = $service->register($request->validated());

        return response()->json([
            'message' => 'Temporary registration successful. A verification email has been sent.',
            'user'    => new UserResource($user),
        ], 201);
    }
}

