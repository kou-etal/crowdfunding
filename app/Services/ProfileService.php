<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\UserRepository;
use Illuminate\Support\Facades\Storage;

class ProfileService
{
    public function __construct(private UserRepository $users) {}

    public function updateBasic(User $user, array $validated): User
    {
       
        if (array_key_exists('email', $validated) && $user->email !== $validated['email']) {
            $validated['email_verified_at'] = null;
        }
        return $this->users->update($user, $validated);
    }

    public function updateIntroduction(User $user, array $validated): User
    {
        return $this->users->update($user, $validated);
    }

    public function uploadImage(User $user, \Illuminate\Http\UploadedFile $file): string
{
    $path = $file->store('profile_images', 'public');
    $url  = url(Storage::url($path));

    $this->users->update($user, ['profile_image' => $url]); 
    return $url;
}

    public function destroy(User $user): void
    {
        $user->delete();
    }
}
