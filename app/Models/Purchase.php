<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Purchase extends Model
{
    protected $table = 'purchase';
    protected $primaryKey = 'id';
    public $timestamps = false;

    protected $fillable = ['user_id', 'created_at', 'total'];

  
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

   
    public function purchaseDetails()
    {
        return $this->hasMany(PurchaseDetail::class, 'purchase_id');
    }
}

