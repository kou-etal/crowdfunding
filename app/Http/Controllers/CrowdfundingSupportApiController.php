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
     * 返り値: 承認URLにリダイレクトするための { url }
     */
    public function createPaypalSession(Request $request)
    {
        $request->validate([
            'project_id' => 'required|exists:crowdfunding_projects,id',
            'amount'     => 'required|integer|min:1',
        ]);

        $user    = $request->user();
        $project = CrowdfundingProject::findOrFail($request->project_id);

        // --- 追加: 残り到達可能額をサーバ側で厳密チェック ---
        $raised     = (int) CrowdfundingSupport::where('project_id', $project->id)->sum('amount');
        $goal       = (int) $project->goal_amount;
        $remaining  = max(0, $goal - $raised);
        $reqAmount  = (int) $request->amount;

        // すでに達成済み
        if ($remaining <= 0) {
            throw new HttpResponseException(
                response()->json(['message' => 'This project already reached its goal.'], 409)
            );
        }

        // 超過分の指定
        if ($reqAmount > $remaining) {
            throw new HttpResponseException(
                response()->json([
                    'message'   => 'Amount exceeds remaining goal.',
                    'remaining' => $remaining,
                ], 422)
            );
        }
        // --- ここまで ---

        $clientId = config('services.paypal.client_id');
        $secret   = config('services.paypal.secret');

        if (!$clientId || !$secret) {
            Log::error('PayPal credentials missing');
            abort(500, 'PayPal credentials not set.');
        }

        $accessToken = $this->getPaypalAccessToken($clientId, $secret);

        $order = $this->createPaypalOrder($accessToken, [
            'amount'     => $reqAmount,   // JPYは整数
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
            abort(500, 'PayPal認証に失敗しました');
        }

        return $res->json('access_token');
    }

    /**
     * PayPal 注文作成
     */
    private function createPaypalOrder(string $accessToken, array $data): array
    {
        $base = $this->paypalBase();

        // 小数不可。値は文字列で送るのが安全
        $amountValue = (string) $data['amount'];

        $payload = [
            'intent' => 'CAPTURE',
            'purchase_units' => [[
                'amount' => [
                    'currency_code' => 'USD',
                    'value' => $amountValue,
                ],
                // 後でwebhookで誰の/どのプロジェクトか判別
                'custom_id' => "{$data['user_id']}:{$data['project_id']}",
            ]],
            'application_context' => [
                // ここは表示用。成功/キャンセルの処理はサーバのwebhookで行う
                'return_url' => rtrim(config('app.frontend_url'), '/') . '/success',
                'cancel_url' => rtrim(config('app.frontend_url'), '/') . '/cancel',
                // 任意：UIの微調整
                'shipping_preference' => 'NO_SHIPPING',
                'user_action' => 'PAY_NOW',
            ],
        ];

        $res = Http::withToken($accessToken)->post("{$base}/v2/checkout/orders", $payload);

        if (!$res->successful()) {
            Log::error('PayPal Order Create Error', ['status' => $res->status(), 'body' => $res->body()]);
            abort(500, 'PayPal注文の作成に失敗しました');
        }

        return $res->json();
    }

    /**
     * サンドボックス/本番のベースURL
     * .env の PAYPAL_BASE で上書き可（例: https://api-m.paypal.com）
     */
    private function paypalBase(): string
    {
        return rtrim(config('services.paypal.base', 'https://api-m.sandbox.paypal.com'), '/');
    }
}
