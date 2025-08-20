<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\UserRepository;
use Illuminate\Support\Facades\Auth;


class UserService
{
    public function __construct(private UserRepository $users) {}

    public function register(array $validated): User
    {
        $user = $this->users->create($validated);



        Auth::login($user);

        return $user;
    }
}
