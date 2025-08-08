<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Stripe\Stripe;
use Stripe\Checkout\Session;
use Illuminate\Support\Facades\Log;
use App\Models\CrowdfundingSupport;
use App\Models\CrowdfundingProject;



class CrowdfundingSupportApiController extends Controller
{

public function createPaypalSession(Request $request)
{
    $request->validate([
        'project_id' => 'required|exists:crowdfunding_projects,id',
        'amount'     => 'required|integer|min:100',
    ]);

    $user = $request->user();
    $project = CrowdfundingProject::findOrFail($request->project_id);

    // PayPal API キーを設定（configに書いてもOK）
    $clientId = env('PAYPAL_CLIENT_ID');
    $secret   = env('PAYPAL_SECRET');

    $accessToken = $this->getPaypalAccessToken($clientId, $secret);

    $order = $this->createPaypalOrder($accessToken, [
        'amount'     => $request->amount,
        'user_id'    => $user->id,
        'project_id' => $project->id,
        'title'      => $project->title,
    ]);

    $approvalUrl = collect($order['links'])->firstWhere('rel', 'approve')['href'];

    return response()->json(['url' => $approvalUrl]);
}
private function getPaypalAccessToken($clientId, $secret)
{
    $response = \Http::withBasicAuth($clientId, $secret)
        ->asForm()
        ->post('https://api-m.sandbox.paypal.com/v1/oauth2/token', [
            'grant_type' => 'client_credentials',
        ]);

    if (!$response->successful()) {
        Log::error('PayPal Access Token Error', ['response' => $response->body()]);
        abort(500, 'PayPal認証に失敗しました');
    }

    return $response->json()['access_token'];
}

private function createPaypalOrder($accessToken, array $data)
{
    $response = \Http::withToken($accessToken)
        ->post('https://api-m.sandbox.paypal.com/v2/checkout/orders', [
            'intent' => 'CAPTURE',
            'purchase_units' => [[
                'amount' => [
                    'currency_code' => 'JPY',
                    'value' => number_format($data['amount'] / 100, 2, '.', ''), // PayPalは小数表記
                ],
                'custom_id' => "{$data['user_id']}:{$data['project_id']}",
            ]],
            'application_context' => [
                'return_url' => env('FRONTEND_URL') . '/success',
                'cancel_url' => env('FRONTEND_URL') . '/cancel',
            ],
        ]);

    if (!$response->successful()) {
        Log::error('PayPal Order Create Error', ['response' => $response->body()]);
        abort(500, 'PayPal注文の作成に失敗しました');
    }

    return $response->json();
}

}