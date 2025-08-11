<?php
namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\IdentityVerification;

class IdentityVerificationAdminController extends Controller
{
   
public function index()
{
    $verifications = IdentityVerification::with('user')
        ->orderBy('created_at', 'desc')
        ->get()
        ->map(function ($v) {
            $v->face_image_url = $v->face_image_path ?? null;
            $v->document_image_url = $v->document_image_path ?? null;
            return $v;
        });

    return response()->json($verifications);
}


    public function approve($id)
{
    $verification = IdentityVerification::with('user')->findOrFail($id);

    if ($verification->status === 'approved') {
        return response()->json(['message' => 'Already approved.'], 400);
    }

    $verification->status = 'approved';
    $verification->save();

    $verification->user->update(['is_verified' => true]);

    return response()->json(['message' => 'Verification approved.']);
}


  
    public function reject(Request $request, $id)
    {
        $request->validate([
            'admin_note' => 'nullable|string|max:1000',
        ]);

        $verification = IdentityVerification::findOrFail($id);

        if ($verification->status === 'rejected') {
            return response()->json(['message' => 'Already rejected.'], 400);
        }

        $verification->status = 'rejected';
        $verification->admin_note = $request->input('admin_note');
        $verification->save();

        return response()->json(['message' => 'Verification rejected.']);
    }
}
