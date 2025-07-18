<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaidPostImage extends Model
{
    protected $fillable = ['paid_post_id', 'path'];

    public function paidPost()
    {
        return $this->belongsTo(PaidPost::class);
    }
}
