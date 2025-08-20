<?php

namespace App\Services\Crowdfunding;

use App\Models\CrowdfundingProject;
use App\Models\CrowdfundingSupport;
use App\Services\Payments\PaypalClient;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\Log;

class SupportService
{
    public function __construct(private readonly PaypalClient $paypal) {}

    
    public function remainingForProject(int $projectId): float
    {
        $project = CrowdfundingProject::findOrFail($projectId);

        $raised = (float) CrowdfundingSupport::where('project_id', $project->id)->sum('amount');
        $goal   = (float) $project->goal_amount;

        return max(0.0, round($goal - $raised, 2));
    }

   
    public function assertCanContribute(CrowdfundingProject $project, float $reqAmount): void
    {
        $remaining = $this->remainingForProject($project->id);

        if ($remaining <= 0.0) {
            throw new HttpResponseException(
                response()->json(['message' => 'This project already reached its goal.'], 409)
            );
        }

        if (round($reqAmount, 2) > $remaining) {
            throw new HttpResponseException(
                response()->json([
                    'message'   => 'Amount exceeds remaining goal.',
                    'remaining' => $remaining,
                ], 422)
            );
        }
    }

    
    public function createPaypalApprovalUrl(string $clientId, string $secret, int $userId, CrowdfundingProject $project, float $amount): string
    {
        if (!$clientId || !$secret) {
            Log::error('PayPal credentials missing');
            abort(500, 'PayPal credentials not set.');
        }

        $accessToken = $this->paypal->getAccessToken($clientId, $secret);

        $order = $this->paypal->createOrder($accessToken, [
            'amount'     => round($amount, 2),
            'user_id'    => $userId,
            'project_id' => (int) $project->id,
            'title'      => $project->title,
        ]);

        $approvalUrl = collect($order['links'] ?? [])->firstWhere('rel', 'approve')['href'] ?? null;

        if (!$approvalUrl) {
            Log::error('PayPal approval URL not found', ['order' => $order]);
            abort(500, 'Failed to create PayPal order.');
        }

        return $approvalUrl;
    }
}
