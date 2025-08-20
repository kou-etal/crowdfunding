<?php

namespace App\Services\Identity;

use App\Models\IdentityVerification;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Collection;

class IdentityVerificationService
{
   
    public function listForAdmin(): Collection
    {
        return IdentityVerification::with('user')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($v) {
                $v->face_image_url     = $v->face_image_path ?? null;
                $v->document_image_url = $v->document_image_path ?? null;
                return $v;
            });
    }

   
    public function approve(int $id): void
    {
        $verification = IdentityVerification::with('user')->findOrFail($id);

        if ($verification->status === 'approved') {
            throw new HttpResponseException(
                response()->json(['message' => 'Already approved.'], 400)
            );
        }

        $verification->status = 'approved';
        $verification->save();

       
        $verification->user->update(['is_verified' => true]);
    }

   
    public function reject(int $id, ?string $adminNote): void
    {
        $verification = IdentityVerification::findOrFail($id);

        if ($verification->status === 'rejected') {
            throw new HttpResponseException(
                response()->json(['message' => 'Already rejected.'], 400)
            );
        }

        $verification->status     = 'rejected';
        $verification->admin_note = $adminNote;
        $verification->save();
    }
}
