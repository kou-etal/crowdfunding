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
public function createSession(Request $request)
{
    $request->validate([
        'project_id' => 'required|exists:crowdfunding_projects,id',
        'amount' => 'required|integer|min:100',
    ]);

    $user = $request->user();
    $project = CrowdfundingProject::findOrFail($request->project_id);

    Stripe::setApiKey(config('services.stripe.secret'));

    $session = Session::create([
        'payment_method_types' => ['card'],
        'line_items' => [[
            'price_data' => [
                'currency' => 'jpy',
                'unit_amount' => $request->amount,
                'product_data' => [
                    'name' => $project->title,
                ],
            ],
            'quantity' => 1,
        ]],
        'mode' => 'payment',
        'success_url' => env('FRONTEND_URL'). '/success?session_id={CHECKOUT_SESSION_ID}',
        'cancel_url' => config('app.url') . '/cancel',
        'metadata' => [
            'user_id' => $user->id,
            'project_id' => $project->id,
        ],
    ]);

    return response()->json(['url' => $session->url]);
}
}