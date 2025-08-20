<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\UserRepository;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthService
{
    public function __construct(private UserRepository $users) {}

    public function attemptLogin(string $email, string $password): ?User
    {
        $user = $this->users->findByEmail($email);
        if (!$user || !Hash::check($password, $user->password)) {
            return null;
        }
        Auth::login($user);
        return $user;
    }

    public function logout(): void
    {
        Auth::logout();
        // セッション系
        if (request()->hasSession()) {
            request()->session()->invalidate();
            request()->session()->regenerateToken();
        }
    }
}
