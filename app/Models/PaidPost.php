<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaidPost extends Model
{
    protected $fillable = ['user_id', 'title', 'body', 'price'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function images()
    {
        return $this->hasMany(PaidPostImage::class);
    }

    public function likes()
    {
        return $this->hasMany(PaidPostLike::class);
    }

    public function isLikedBy($userId)
    {
        return $this->likes->contains('user_id', $userId);
    }

    public function comments()
    {
        return $this->hasMany(PaidPostComment::class);
    }

    public function purchases()
    {
        return $this->hasMany(PaidPostPurchase::class);
    }

    public function isPurchasedBy($userId)
    {
        return $this->purchases->contains('user_id', $userId);
    }
}
