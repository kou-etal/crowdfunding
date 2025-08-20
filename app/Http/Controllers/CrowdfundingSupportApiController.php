<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\Payments\CreatePaypalSessionRequest;
use App\Models\CrowdfundingProject;
use App\Services\Crowdfunding\SupportService;

class CrowdfundingSupportApiController extends Controller
{
    public function __construct(private readonly SupportService $service) {}

    public function createPaypalSession(CreatePaypalSessionRequest $request)
    {
        $user     = $request->user();
        $project  = CrowdfundingProject::findOrFail($request->input('project_id'));
        $amount   = (float) $request->input('amount');

      
        $this->service->assertCanContribute($project, $amount);

      
        $url = $this->service->createPaypalApprovalUrl(
            (string) config('services.paypal.client_id'),
            (string) config('services.paypal.secret'),
            (int) $user->id,
            $project,
            $amount
        );

        return response()->json(['url' => $url]);
    }
}
