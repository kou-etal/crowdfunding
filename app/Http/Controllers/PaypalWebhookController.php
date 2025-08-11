<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use App\Models\CrowdfundingSupport;
use Carbon\Carbon;

class PayPalWebhookController extends Controller
{
    /**
     * Webhook 入口
     * - 署名検証（本番推奨。local のみスキップ可）
     * - CHECKOUT.ORDER.APPROVED: サーバ側で capture 実行（冪等）
     * - PAYMENT.CAPTURE.COMPLETED: DB に保存（冪等）
     */
    public function handleWebhook(Request $request)
    {
        $raw = $request->getContent();
        $event = json_decode($raw, true) ?? [];
        $type  = $event['event_type'] ?? null;

        if (!$this->verifyWebhookSignature($request, $raw)) {
            Log::warning('PayPal webhook: signature verification failed');
            return response()->json(['status' => 'invalid-signature'], 400);
        }

        Log::info('PayPal Webhook Received', ['type' => $type]);

        // 1) 注文承認 → サーバ側で capture（後続で CAPTURE Webhook が来る）
        if ($type === 'CHECKOUT.ORDER.APPROVED') {
            $orderId = $event['resource']['id'] ?? null;
            if ($orderId) {
                try {
                    $this->captureOrder($orderId);
                    Log::info('Capture triggered', ['order_id' => $orderId]);
                } catch (\Throwable $e) {
                    Log::error('Capture failed', ['order_id' => $orderId, 'error' => $e->getMessage()]);
                }
            }
            return response()->json(['status' => 'ok']);
        }

        // 2) キャプチャ完了 → 保存（冪等）
        if ($type === 'PAYMENT.CAPTURE.COMPLETED') {
            $resource = $event['resource'] ?? [];
            $this->saveFromCaptureResource($resource, $event);
            return response()->json(['status' => 'ok']);
        }

        // 不要イベントは無視
        return response()->json(['status' => 'ignored']);
    }

    /**
     * capture API を叩く（Idempotency: orderId 固定）
     * - レスポンスに capture が含まれていれば即保存（Webhook遅延対策）
     */
    private function captureOrder(string $orderId): void
    {
        $clientId = config('services.paypal.client_id');
        $secret   = config('services.paypal.secret');
        $base     = $this->paypalBase();

        if (!$clientId || !$secret) {
            throw new \RuntimeException('PayPal credentials not set');
        }

        $accessToken = $this->getPaypalAccessToken($clientId, $secret);

        $res = Http::withToken($accessToken)
            ->withHeaders([
                'PayPal-Request-Id' => 'cap_'.$orderId, // 冪等キー
            ])
            ->asJson()
            ->post("{$base}/v2/checkout/orders/{$orderId}/capture", new \stdClass());

        Log::info('Capture API response', ['status' => $res->status()]);

        if (!$res->successful()) {
            throw new \RuntimeException('Capture API failed: '.$res->status().' '.$res->body());
        }

        // 保険保存
        $this->saveFromCaptureResponse($res->json());
    }

    /**
     * Webhook 署名検証
     * - services.paypal.webhook_id を .env に設定
     * - local 環境のみ未設定を許容
     */
    private function verifyWebhookSignature(Request $request, string $rawBody): bool
    {
        $webhookId = config('services.paypal.webhook_id');
        if (!$webhookId) {
            Log::warning('WEBHOOK_ID not set; skipping verification (local only)');
            return app()->environment('local'); // 本番は必ず設定
        }

        $clientId = config('services.paypal.client_id');
        $secret   = config('services.paypal.secret');
        $base     = $this->paypalBase();
        $access   = $this->getPaypalAccessToken($clientId, $secret);

        $payload = [
            'auth_algo'         => $request->header('PayPal-Auth-Algo'),
            'cert_url'          => $request->header('PayPal-Cert-Url'),
            'transmission_id'   => $request->header('PayPal-Transmission-Id'),
            'transmission_sig'  => $request->header('PayPal-Transmission-Sig'),
            'transmission_time' => $request->header('PayPal-Transmission-Time'),
            'webhook_id'        => $webhookId,
            'webhook_event'     => json_decode($rawBody, true),
        ];

        $res = Http::withToken($access)
            ->post("{$base}/v1/notifications/verify-webhook-signature", $payload);

        if (!$res->successful()) {
            Log::warning('verify-webhook-signature failed', ['status' => $res->status(), 'body' => $res->body()]);
            return false;
        }

        return $res->json('verification_status') === 'SUCCESS';
    }

    /**
     * PayPal アクセストークン
     */
    private function getPaypalAccessToken(string $clientId, string $secret): string
    {
        $base = $this->paypalBase();

        $res = Http::withBasicAuth($clientId, $secret)
            ->asForm()
            ->post("{$base}/v1/oauth2/token", ['grant_type' => 'client_credentials']);

        if (!$res->successful()) {
            throw new \RuntimeException('PayPal Access Token Error: '.$res->body());
        }
        return $res->json('access_token');
    }

    /**
     * API ベース URL
     */
    private function paypalBase(): string
    {
        return rtrim(config('services.paypal.base', 'https://api-m.sandbox.paypal.com'), '/');
    }

    /**
     * custom_id "userId:projectId" → [userId, projectId]
     */
    private function parseCustomId(?string $customId): array
    {
        if ($customId && str_contains($customId, ':')) {
            [$u, $p] = explode(':', $customId, 2);
            return [(int) $u, (int) $p];
        }
        return [null, null];
    }

    /**
     * Webhook の resource から保存（冪等）
     * - USD 小数（例 "10.50"）を DECIMAL(12,2) にそのまま保存
     */
    private function saveFromCaptureResource(array $resource, array $fullEvent = []): void
    {
        // 形B: capture 直オブジェクト
        if (isset($resource['id'], $resource['amount'])) {
            $paymentId = $resource['id'];
            $amountVal = $resource['amount']['value'] ?? null;          // e.g. "10.50"
            $currency  = $resource['amount']['currency_code'] ?? 'USD'; // 既定 USD
            $customId  = $resource['custom_id'] ?? null;

            [$userId, $projectId] = $this->parseCustomId($customId);
            $this->saveSupport($paymentId, $userId, $projectId, $amountVal, $currency, $fullEvent);
            return;
        }

        // 形A: order 全体（purchase_units 内に captures）
        if (isset($resource['purchase_units'][0]['payments']['captures'][0])) {
            $pu      = $resource['purchase_units'][0];
            $capture = $pu['payments']['captures'][0];

            $paymentId = $capture['id'] ?? null;
            $amountVal = $capture['amount']['value'] ?? null;
            $currency  = $capture['amount']['currency_code'] ?? 'USD';
            $customId  = $capture['custom_id'] ?? ($pu['custom_id'] ?? null);

            [$userId, $projectId] = $this->parseCustomId($customId);
            $this->saveSupport($paymentId, $userId, $projectId, $amountVal, $currency, $fullEvent);
        }
    }

    /**
     * capture API レスポンスから保存（保険）
     */
    private function saveFromCaptureResponse(array $payload): void
    {
        if (isset($payload['purchase_units'][0]['payments']['captures'][0])) {
            $pu      = $payload['purchase_units'][0];
            $capture = $pu['payments']['captures'][0];

            $paymentId = $capture['id'] ?? null;
            $amountVal = $capture['amount']['value'] ?? null;
            $currency  = $capture['amount']['currency_code'] ?? 'USD';
            $customId  = $capture['custom_id'] ?? ($pu['custom_id'] ?? null);

            [$userId, $projectId] = $this->parseCustomId($customId);
            $this->saveSupport($paymentId, $userId, $projectId, $amountVal, $currency, $payload);
        }
    }

    /**
     * 保存（冪等）
     * - USD 小数をそのまま DECIMAL(12,2) に保存（DB が DECIMAL 型）
     * - currency はデフォルト USD（PayPal 側も USD 設定前提）
     */
    private function saveSupport(
        ?string $paymentId,
        ?int $userId,
        ?int $projectId,
        $amountVal,
        ?string $currency,
        array $rawPayload = []
    ): void {
        if (!$paymentId || !$userId || !$projectId || $amountVal === null) {
            Log::warning('saveSupport: missing fields', compact('paymentId','userId','projectId','amountVal','currency'));
            return;
        }

        // "10.50" → 10.50（小数許容）
        $numeric = is_numeric($amountVal)
            ? (float) $amountVal
            : (float) str_replace(',', '', (string) $amountVal);

        // DECIMAL に入る形へ（丸めは2桁）
        $amountDecimal = number_format($numeric, 2, '.', '');

        CrowdfundingSupport::firstOrCreate(
            ['payment_id' => $paymentId],
            [
                'user_id'      => $userId,
                'project_id'   => $projectId,
                'amount'       => $amountDecimal,
                'currency'     => strtoupper($currency ?? 'USD'),
                'supported_at' => Carbon::now(),
                'raw_payload'  => !empty($rawPayload) ? json_encode($rawPayload) : null,
                'provider'     => 'paypal',
            ]
        );

        Log::info('Support saved', [
            'payment_id' => $paymentId,
            'amount'     => $amountDecimal,
            'currency'   => strtoupper($currency ?? 'USD'),
        ]);
    }
}



