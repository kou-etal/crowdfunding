<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaidPostPurchase extends Model
{
protected $fillable = [
    'user_id',
    'paid_post_id',
    'stripe_session_id',
    'purchased_at',
];


    public function paidPost()
    {
        return $this->belongsTo(PaidPost::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
