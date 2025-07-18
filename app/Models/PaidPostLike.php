<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaidPostLike extends Model
{
    protected $fillable = ['paid_post_id', 'user_id'];

    public function paidPost()
    {
        return $this->belongsTo(PaidPost::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
