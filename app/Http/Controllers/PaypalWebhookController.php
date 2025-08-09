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
     * PayPal Webhook エンドポイント
     * - CHECKOUT.ORDER.APPROVED: サーバ側で /capture を実行
     * - PAYMENT.CAPTURE.COMPLETED: DBに支援を保存
     */
    public function handleWebhook(Request $request)
    {
        $event = $request->all();
        Log::info('PayPal Webhook Received', $event);

        $type = $event['event_type'] ?? null;

        // 1) 注文が承認されたらサーバ側で即キャプチャ
        if ($type === 'CHECKOUT.ORDER.APPROVED') {
            $orderId = $event['resource']['id'] ?? null;
            Log::info('ORDER.APPROVED received', ['order_id' => $orderId]);

            if ($orderId) {
                try {
                    $this->captureOrder($orderId); // 成功すると後で CAPTURE のWebhookが飛んでくる
                    Log::info('PayPal capture triggered', ['order_id' => $orderId]);
                } catch (\Throwable $e) {
                    Log::error('PayPal capture failed', [
                        'order_id' => $orderId,
                        'error'    => $e->getMessage(),
                    ]);
                }
            } else {
                Log::warning('ORDER.APPROVED without resource.id');
            }
            return response()->json(['status' => 'ok']);
        }

        // 2) キャプチャ完了の通知で保存（payload 形A/形B 両対応）
        if ($type === 'PAYMENT.CAPTURE.COMPLETED') {
            $res = $event['resource'] ?? [];

            // 形A: order全体スタイル（purchase_units 内に captures）
            if (isset($res['purchase_units'][0]['payments']['captures'][0])) {
                $pu       = $res['purchase_units'][0];
                $capture  = $pu['payments']['captures'][0];

                $paymentId = $capture['id'] ?? null;
                $amountVal = $capture['amount']['value'] ?? null;
                $currency  = $capture['amount']['currency_code'] ?? null;
                $customId  = $capture['custom_id'] ?? ($pu['custom_id'] ?? null);

            } else {
                // 形B: capture直オブジェクト
                $paymentId = $res['id'] ?? null;
                $amountVal = $res['amount']['value'] ?? null;
                $currency  = $res['amount']['currency_code'] ?? null;
                $customId  = $res['custom_id'] ?? null;
            }

            [$userId, $projectId] = $this->parseCustomId($customId);
            Log::info('CAPTURE parsed', compact('paymentId','amountVal','currency','customId','userId','projectId'));

            if ($paymentId && $userId && $projectId && $amountVal) {
                CrowdfundingSupport::firstOrCreate(
                    ['payment_id' => $paymentId],
                    [
                        'user_id'      => (int)$userId,
                        'project_id'   => (int)$projectId,
                        'amount'       => (int)$amountVal, // JPYは整数
                        'currency'     => $currency,
                        'supported_at' => Carbon::now(),
                    ]
                );
                Log::info('Saved PayPal support (CAPTURE)', ['payment_id' => $paymentId]);
            } else {
                Log::warning('CAPTURE missing fields', compact('paymentId','amountVal','currency','customId','userId','projectId'));
            }

            return response()->json(['status' => 'ok']);
        }

        // 互換: 旧 REST の SALE イベントに来た場合（任意）
        if ($type === 'PAYMENT.SALE.COMPLETED') {
            $resource  = $event['resource'] ?? [];
            $paymentId = $resource['parent_payment'] ?? null;
            $amountVal = $resource['amount']['total'] ?? null;
            $currency  = $resource['amount']['currency'] ?? null;
            [$userId, $projectId] = $this->parseCustomId($resource['custom'] ?? null);

            if ($paymentId && $userId && $projectId && $amountVal) {
                CrowdfundingSupport::firstOrCreate(
                    ['payment_id' => $paymentId],
                    [
                        'user_id'      => (int)$userId,
                        'project_id'   => (int)$projectId,
                        'amount'       => (int)$amountVal,
                        'currency'     => $currency,
                        'supported_at' => Carbon::now(),
                    ]
                );
                Log::info('Saved PayPal support (SALE)', ['payment_id' => $paymentId]);
            } else {
                Log::warning('SALE missing fields', compact('paymentId','amountVal','currency','userId','projectId'));
            }

            return response()->json(['status' => 'ok']);
        }

        // その他は無視
        return response()->json(['status' => 'ignored']);
    }

    /**
     * 承認済みオーダーをキャプチャ
     */
    private function captureOrder(string $orderId): void
    {
        $clientId = config('services.paypal.client_id');
        $secret   = config('services.paypal.secret');
        $base     = $this->paypalBase();

        if (!$clientId || !$secret) {
            Log::error('PayPal creds missing', compact('clientId','secret'));
            abort(500, 'PayPal credentials not set');
        }

        $accessToken = $this->getPaypalAccessToken($clientId, $secret);

        $res = Http::withToken($accessToken)
            ->withHeaders([
                'PayPal-Request-Id' => 'cap_' . $orderId . '_' . uniqid(),
            ])
            ->asJson()
            ->post("{$base}/v2/checkout/orders/{$orderId}/capture", (object)[]);

        Log::info('Capture API response', ['status' => $res->status(), 'body' => $res->body()]);

        if (!$res->successful()) {
            throw new \RuntimeException('Capture API failed: '.$res->status().' '.$res->body());
        }

        // ★ ここで即時保存（Webhookは保険）
        $payload = $res->json();
        try {
            $this->saveSupportFromCaptureResponse($payload);
            Log::info('Saved from capture response');
        } catch (\Throwable $e) {
            Log::error('Save from capture response failed', ['e' => $e->getMessage()]);
        }
    }

    /**
     * アクセストークン取得
     */
    private function getPaypalAccessToken(string $clientId, string $secret): string
    {
        $base = $this->paypalBase();

        $res = Http::withBasicAuth($clientId, $secret)
            ->asForm()
            ->post("{$base}/v1/oauth2/token", [
                'grant_type' => 'client_credentials',
            ]);

        if (!$res->successful()) {
            throw new \RuntimeException('PayPal Access Token Error: '.$res->body());
        }
        return $res->json()['access_token'];
    }

    /**
     * config/services.php の base を使う
     */
    private function paypalBase(): string
    {
        return rtrim(config('services.paypal.base', 'https://api-m.sandbox.paypal.com'), '/');
    }

    /**
     * "userId:projectId" 形式の custom_id を分解
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
     * capture API のレスポンスから保存
     */
    private function saveSupportFromCaptureResponse(array $payload): void
    {
        // デフォルト初期化
        $paymentId = $amountVal = $currency = $customId = null;

        // 形A: purchase_units 内
        if (isset($payload['purchase_units'][0]['payments']['captures'][0])) {
            $pu      = $payload['purchase_units'][0];
            $capture = $pu['payments']['captures'][0];
            $paymentId = $capture['id'] ?? null;
            $amountVal = $capture['amount']['value'] ?? null;
            $currency  = $capture['amount']['currency_code'] ?? null;
            $customId  = $capture['custom_id'] ?? ($pu['custom_id'] ?? null);

        // 形B: capture直オブジェクト
        } elseif (isset($payload['id'], $payload['amount'])) {
            $paymentId = $payload['id'];
            $amountVal = $payload['amount']['value'] ?? null;
            $currency  = $payload['amount']['currency_code'] ?? null;
            $customId  = $payload['custom_id'] ?? null;
        }

        [$userId, $projectId] = $this->parseCustomId($customId);

        if ($paymentId && $userId && $projectId && $amountVal) {
            CrowdfundingSupport::firstOrCreate(
                ['payment_id' => $paymentId],
                [
                    'user_id'      => (int)$userId,
                    'project_id'   => (int)$projectId,
                    'amount'       => (int)$amountVal, // JPYは整数
                    'currency'     => $currency,
                    'supported_at' => Carbon::now(),
                ]
            );
        } else {
            throw new \RuntimeException('Missing fields on capture response');
        }
    }
}

