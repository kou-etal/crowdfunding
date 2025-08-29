<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory; 

class CrowdfundingSupport extends Model
{
    use HasFactory; 
    protected $fillable = [
        'user_id',
        'project_id',
        'amount',
        'currency',
        'payment_id',
        'provider',
        'stripe_session_id',
        'supported_at',
        'raw_payload',
    ];

    protected $casts = [
        'amount'       => 'decimal:2', 
        'supported_at' => 'datetime',
        'raw_payload'  => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function project()
    {
        return $this->belongsTo(CrowdfundingProject::class, 'project_id');
    }
}

