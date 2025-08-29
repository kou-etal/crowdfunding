<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\CrowdfundingSupport;

class CrowdfundingProject extends Model
{
    protected $fillable = [
        'user_id',
        'title',
        'description',
        'goal_amount',
        'deadline',
        'image_path',
        'is_submitted',
        'is_approved',
        'is_rejected',
        'rejected_reason',
    ];

    protected $casts = [
        'deadline'     => 'datetime',
        'goal_amount'  => 'decimal:2', 
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function supports()
    {
        return $this->hasMany(CrowdfundingSupport::class, 'project_id');
    }

    public function payoutRecord()
    {
        return $this->hasOne(PayoutRecord::class);
    }
}




