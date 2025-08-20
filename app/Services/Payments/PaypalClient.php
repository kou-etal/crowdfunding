<?php

namespace App\Services\Payments;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PaypalClient
{
    public function getAccessToken(string $clientId, string $secret): string
    {
        $base = $this->base();

        $res = Http::withBasicAuth($clientId, $secret)
            ->asForm()
            ->post("{$base}/v1/oauth2/token", [
                'grant_type' => 'client_credentials',
            ]);

        if (!$res->successful()) {
            Log::error('PayPal Access Token Error', ['status' => $res->status(), 'body' => $res->body()]);
            abort(500, 'Failed to authenticate with PayPal.');
        }

        return (string) $res->json('access_token');
    }

    /**
     * @param array{
     *   amount: float,
     *   user_id: int,
     *   project_id: int,
     *   title?: string
     * } $data
     */
    public function createOrder(string $accessToken, array $data): array
    {
        $base = $this->base();

        $payload = [
            'intent' => 'CAPTURE',
            'purchase_units' => [[
                'amount' => [
                    'currency_code' => 'USD',
                    
                    'value' => number_format((float)$data['amount'], 2, '.', ''),
                ],
                
                'custom_id' => "{$data['user_id']}:{$data['project_id']}",
            ]],
            'application_context' => [
                'return_url' => rtrim(config('app.frontend_url'), '/') . '/success',
                'cancel_url' => rtrim(config('app.frontend_url'), '/') . '/cancel',
                'shipping_preference' => 'NO_SHIPPING',
                'user_action' => 'PAY_NOW',
            ],
        ];

        $res = Http::withToken($accessToken)->post("{$base}/v2/checkout/orders", $payload);

        if (!$res->successful()) {
            Log::error('PayPal Order Create Error', ['status' => $res->status(), 'body' => $res->body()]);
            abort(500, 'Failed to create PayPal order.');
        }

        return $res->json();
    }

    private function base(): string
    {
      
        return rtrim(config('services.paypal.base', 'https://api-m.sandbox.paypal.com'), '/');
    }
}
