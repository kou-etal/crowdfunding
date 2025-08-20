<?php
//breeze使わない場合のcontroller
namespace App\Http\Controllers;

use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\UserResource;
use App\Services\AuthService;
use Illuminate\Http\Request;

class AuthApiController extends Controller
{
    public function login(LoginRequest $request, AuthService $auth)
    {
        $user = $auth->attemptLogin($request->validated()['email'], $request->validated()['password']);
        if (!$user) {
            return response()->json(['message' => 'ユーザーネームまたはパスワードが間違っています'], 401);
        }
        
        return response()->json([
            'message' => 'ログイン成功',
            'user'    => new UserResource($user),
        ]);
    }

    public function me(Request $request)
    {
        return new UserResource($request->user());
    }

    public function logout(AuthService $auth)
    {
        $auth->logout();
        return response()->json(['message' => 'ログアウト成功']);
    }
}
