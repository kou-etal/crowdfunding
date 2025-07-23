<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\CrowdfundingProject;
use App\Models\User;

class PayoutRecord extends Model
{
    protected $fillable = [
        'project_id',
        'user_id',
        'user_full_name',
        'user_email',
        'total_amount',
        'platform_fee',
        'payout_ready_at',
        'is_paid',
    ];

    protected $casts = [
        'payout_ready_at' => 'datetime',
        'is_paid' => 'boolean',
    ];

    public function project()
    {
        return $this->belongsTo(CrowdfundingProject::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
