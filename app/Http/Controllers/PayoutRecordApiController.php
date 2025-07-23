<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PayoutRecord;

class PayoutRecordApiController extends Controller
{
    public function index()
    {
        $records = PayoutRecord::with(['user', 'project'])
            ->orderBy('payout_ready_at', 'desc')
            ->get();

        return response()->json($records);
    }
     public function markAsPaid($id)
    {
        $record = PayoutRecord::findOrFail($id);
        $record->is_paid = true;
        $record->save();

        return response()->json(['message' => '支払い済みに更新されました']);
    }
}
