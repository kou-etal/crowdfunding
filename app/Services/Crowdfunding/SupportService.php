<?php

namespace App\Services\Crowdfunding;

use App\Models\CrowdfundingProject;
use App\Models\CrowdfundingSupport;
use App\Services\Payments\PaypalClient;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class SupportService
{
    public function __construct(private readonly PaypalClient $paypal) {}

    
    public function remainingForProject(int $projectId): string
    {
        $project = CrowdfundingProject::findOrFail($projectId);

       
        $raised = (string) CrowdfundingSupport::where('project_id', $project->id)
            ->select(DB::raw('COALESCE(SUM(amount), 0) as total'))
            ->value('total');

        $goal = (string) $project->goal_amount;

        $remaining = bcsub($goal, $raised, 2);
        return bccomp($remaining, '0.00', 2) < 0 ? '0.00' : $remaining;
    }

    /**
     * 支援可能かチェック
     *
     * @throws HttpResponseException
     */
    public function assertCanContribute(CrowdfundingProject $project, float $reqAmount): void
    {
       
        $reqAmountStr = number_format($reqAmount, 2, '.', '');

        $remaining = $this->remainingForProject($project->id);

       
        if (bccomp($remaining, '0.00', 2) <= 0) {
            throw new HttpResponseException(
                response()->json(['message' => 'This project already reached its goal.'], 409)
            );
        }

       
        if (bccomp($reqAmountStr, $remaining, 2) === 1) {
            throw new HttpResponseException(
                response()->json([
                    'message'   => 'Amount exceeds remaining goal.',
                    
                    'remaining' => (float) $remaining,
                ], 422)
            );
        }
    }

   
    public function createPaypalApprovalUrl(
        string $clientId,
        string $secret,
        int $userId,
        CrowdfundingProject $project,
        float $amount
    ): string {
        if (!$clientId || !$secret) {
            Log::error('PayPal credentials missing');
            abort(500, 'PayPal credentials not set.');
        }

        $accessToken = $this->paypal->getAccessToken($clientId, $secret);

       
        $amountStr = number_format($amount, 2, '.', '');

        $order = $this->paypal->createOrder($accessToken, [
            'amount'     => $amountStr,
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

