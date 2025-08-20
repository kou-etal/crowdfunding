<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\Identity\StoreIdentityVerificationRequest;
use App\Http\Requests\Identity\UploadVerificationImagesRequest;
use App\Services\Identity\IdentitySubmissionService;
use App\Services\Identity\VerificationImageService;

class IdentityVerificationApiController extends Controller
{
    public function __construct(
        private readonly IdentitySubmissionService $submission,
        private readonly VerificationImageService $uploader
    ) {}

    public function store(StoreIdentityVerificationRequest $request)
    {
        $user = $request->user();

        $verification = $this->submission->submit($user, $request->only([
            'face_image_path',
            'document_image_path',
            'supervisor_name',
            'supervisor_email',
            'supervisor_affiliation',
        ]));

        return response()->json([
            'message'      => '本人確認を提出しました',
            'verification' => $verification,
        ], 201);
    }

    public function uploadVerificationImages(UploadVerificationImagesRequest $request)
    {
        $urls = $this->uploader->upload(
            $request->file('face_image'),
            $request->file('document_image'),
        );

        return response()->json($urls);
    }
}
