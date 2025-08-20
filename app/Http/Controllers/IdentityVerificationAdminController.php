<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\RejectIdentityVerificationRequest;
use App\Services\Identity\IdentityVerificationService;

class IdentityVerificationAdminController extends Controller
{
    public function __construct(private readonly IdentityVerificationService $service) {}

    public function index()
    {
        $verifications = $this->service->listForAdmin();
        return response()->json($verifications);
    }

    public function approve($id)
    {
        $this->service->approve((int) $id);
        return response()->json(['message' => 'Verification approved.']);
    }

    public function reject(RejectIdentityVerificationRequest $request, $id)
    {
        $this->service->reject((int) $id, $request->input('admin_note'));
        return response()->json(['message' => 'Verification rejected.']);
    }
}
