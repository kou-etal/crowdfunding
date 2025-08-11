<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Exceptions\HttpResponseException;
use App\Models\CrowdfundingProject;
use App\Models\CrowdfundingSupport;

class CrowdfundingSupportApiController extends Controller
{
    /**
     * 支援セッション作成（PayPal）
     * 返り値: { url } 承認URL
     * - USD 小数（2桁）対応
     * - 残額超過/達成済みのサーバ側バリデーション
     */
    public function createPaypalSession(Request $request)
    {
        $request->validate([
            'project_id' => 'required|exists:crowdfunding_projects,id',
            // 1.00 以上、最大2桁小数
            'amount'     => ['required','numeric','min:1','regex:/^\d+(\.\d{1,2})?$/'],
        ]);

        $user     = $request->user();
        $project  = CrowdfundingProject::findOrFail($request->project_id);

        // 現在の調達額 (USD) を合計
        $raised    = (float) CrowdfundingSupport::where('project_id', $project->id)->sum('amount');
        $goal      = (float) $project->goal_amount;
        $remaining = max(0.0, round($goal - $raised, 2));
        $reqAmount = round((float) $request->amount, 2);

        // 達成済み
        if ($remaining <= 0.0) {
            throw new HttpResponseException(
                response()->json(['message' => 'This project already reached its goal.'], 409)
            );
        }

        // 超過支援は弾く
        if ($reqAmount > $remaining) {
            throw new HttpResponseException(
                response()->json([
                    'message'   => 'Amount exceeds remaining goal.',
                    'remaining' => $remaining,
                ], 422)
            );
        }

        $clientId = config('services.paypal.client_id');
        $secret   = config('services.paypal.secret');

        if (!$clientId || !$secret) {
            Log::error('PayPal credentials missing');
            abort(500, 'PayPal credentials not set.');
        }

        $accessToken = $this->getPaypalAccessToken($clientId, $secret);

        $order = $this->createPaypalOrder($accessToken, [
            'amount'     => $reqAmount, // USD 小数
            'user_id'    => (int) $user->id,
            'project_id' => (int) $project->id,
            'title'      => $project->title,
        ]);

        $approvalUrl = collect($order['links'] ?? [])->firstWhere('rel', 'approve')['href'] ?? null;

        if (!$approvalUrl) {
            Log::error('PayPal approval URL not found', ['order' => $order]);
            abort(500, 'Failed to create PayPal order.');
        }

        return response()->json(['url' => $approvalUrl]);
    }

    /**
     * PayPal アクセストークン取得
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
            Log::error('PayPal Access Token Error', ['status' => $res->status(), 'body' => $res->body()]);
            abort(500, 'Failed to authenticate with PayPal.');
        }

        return $res->json('access_token');
    }

    /**
     * PayPal 注文作成（USD 小数）
     */
    private function createPaypalOrder(string $accessToken, array $data): array
    {
        $base = $this->paypalBase();

        $payload = [
            'intent' => 'CAPTURE',
            'purchase_units' => [[
                'amount' => [
                    'currency_code' => 'USD',
                    // 文字列で2桁固定
                    'value' => number_format((float)$data['amount'], 2, '.', ''),
                ],
                // Webhook で突き止めるために custom_id を埋める
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

    /**
     * サンドボックス/本番のベースURL
     */
    private function paypalBase(): string
    {
        return rtrim(config('services.paypal.base', 'https://api-m.sandbox.paypal.com'), '/');
    }
}
