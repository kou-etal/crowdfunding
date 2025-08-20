<?php

namespace App\Services\Identity;

use App\Models\IdentityVerification;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Contracts\Auth\Authenticatable;

class IdentitySubmissionService
{
   
    public function submit(Authenticatable $user, array $payload): IdentityVerification
    {
        if ($user->identityVerification) {
            throw new HttpResponseException(
                response()->json(['message' => 'すでに本人確認を提出済みです'], 422)
            );
        }

        return IdentityVerification::create([
            'user_id'               => $user->id,
            'face_image_path'       => $payload['face_image_path'],
            'document_image_path'   => $payload['document_image_path'],
            'honor_statement'       => true,
            'supervisor_name'       => $payload['supervisor_name'],
            'supervisor_email'      => $payload['supervisor_email'],
            'supervisor_affiliation'=> $payload['supervisor_affiliation'],
            'status'                => 'pending',
        ]);
    }
}
