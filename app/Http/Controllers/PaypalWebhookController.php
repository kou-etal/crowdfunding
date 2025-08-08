<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\CrowdfundingSupport;
use Carbon\Carbon;

class PayPalWebhookController extends Controller
{
    public function handleWebhook(Request $request)
    {
        $event = $request->all(); // PayPalは署名検証しない（手動なら）

        // ログ出力
        Log::info('PayPal Webhook Received', $event);

        if ($event['event_type'] === 'PAYMENT.SALE.COMPLETED') {
            $resource = $event['resource'];

            $paymentId = $resource['parent_payment'] ?? null;
            $amount    = $resource['amount']['total'] ?? null;
            $currency  = $resource['amount']['currency'] ?? null;

            // Stripeのように metadata から user_id, project_id を取りたい場合
            $customId = $resource['custom'] ?? null;

            // ここでcustomIdを「userId:projectId」のようにしておくと分解できる
            $userId = null;
            $projectId = null;
            if ($customId && strpos($customId, ':') !== false) {
                [$userId, $projectId] = explode(':', $customId);
            }

            if ($userId && $projectId && $amount) {
                CrowdfundingSupport::firstOrCreate(
                    ['payment_id' => $paymentId],
                    [
                        'user_id'        => $userId,
                        'project_id'     => $projectId,
                        'amount'         => $amount,
                        'currency'       => $currency,
                        'supported_at'   => Carbon::now(),
                    ]
                );

                Log::info("Saved PayPal support: $paymentId");
            } else {
                Log::warning("Missing required fields", compact('userId', 'projectId', 'amount'));
            }
        }

        return response()->json(['status' => 'ok']);
    }
}
