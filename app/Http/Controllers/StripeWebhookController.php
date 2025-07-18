<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use Stripe\Webhook;
use Stripe\Exception\SignatureVerificationException;
use App\Models\CrowdfundingSupport;

class StripeWebhookController extends Controller
{
    public function handleWebhook(Request $request)
    {
        $payload   = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $secret    = env('STRIPE_WEBHOOK_SECRET');

        try {
            $event = Webhook::constructEvent($payload, $sigHeader, $secret);
        } catch (SignatureVerificationException $e) {
            Log::warning('Stripe signature check failed', ['msg' => $e->getMessage()]);
            return response('signature error', 400);
        }

        if ($event->type === 'checkout.session.completed') {
            $session = $event->data->object;

            $userId     = $session->metadata->user_id      ?? null;
            $projectId  = $session->metadata->project_id   ?? null;
            $amount     = $session->amount_total           ?? null;

            if ($userId && $projectId && $amount) {
                CrowdfundingSupport::firstOrCreate(
                    ['stripe_session_id' => $session->id],
                    [
                        'user_id'          => $userId,
                        'project_id'       => $projectId,
                        'amount'           => $amount,
                        'supported_at'     => Carbon::createFromTimestamp($session->created),
                    ]
                );
            }
        }

        return response('ok', 200);
    }
}

