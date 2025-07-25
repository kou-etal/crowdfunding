<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Notifications\CustomVerifyEmail;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
    'name',
    'full_name',
    'email',
    'password',
    'profile_image',
    'bio',
    'degree',
    'expertise',
    'university',
    'institute',
    'is_verified',
    'role', // ✅ 追加
];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function followings()
{
    return $this->belongsToMany(User::class, 'follows', 'follower_id', 'followed_id');
}

public function followers()
{
    return $this->belongsToMany(User::class, 'follows', 'followed_id', 'follower_id');
}

public function user()
{
    return $this->belongsTo(User::class, 'user_id', 'id');
}

public function sendEmailVerificationNotification()
{
    $this->notify(new CustomVerifyEmail());
}

public function groups()
{
    return $this->belongsToMany(Group::class);
}

public function ownedGroups()
{
    return $this->hasMany(Group::class, 'created_by');
}
public function identityVerification()
{
    return $this->hasOne(IdentityVerification::class);
}
public function payoutRecords()
{
    return $this->hasMany(PayoutRecord::class);
}
}

