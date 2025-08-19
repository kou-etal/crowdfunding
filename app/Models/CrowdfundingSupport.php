<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CrowdfundingSupport extends Model
{
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

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function project()
    {
        return $this->belongsTo(CrowdfundingProject::class, 'project_id');
    }
}
