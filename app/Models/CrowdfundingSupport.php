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
        'payment_id',        // PayPal取引ID
        'provider',          // 'paypal' 固定
        'stripe_session_id', // 将来の拡張用（今は使わない）
        'supported_at',
        'raw_payload',       // WebhookやAPIレスポンスのJSON
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
