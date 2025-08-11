<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Models\IdentityVerification;

class IdentityVerificationApiController extends Controller
{
public function store(Request $request)
{
 

  
$request->validate([
    'face_image_path' => 'required|string|max:1000',
    'document_image_path' => 'required|string|max:1000',
    'honor_statement' => 'accepted',
    'supervisor_name' => 'required|string|max:255',
    'supervisor_email' => 'required|email',
    'supervisor_affiliation' => 'required|string|max:255',
]);


    $user = $request->user();

    if ($user->identityVerification) {
        return response()->json(['message' => 'すでに本人確認を提出済みです'], 422);
    }

    $verification = IdentityVerification::create([
        'user_id' => $user->id,
        'face_image_path' => $request->input('face_image_path'),
        'document_image_path' => $request->input('document_image_path'),
        'honor_statement' => true,
        'supervisor_name' => $request->input('supervisor_name'),
        'supervisor_email' => $request->input('supervisor_email'),
        'supervisor_affiliation' => $request->input('supervisor_affiliation'),
        'status' => 'pending',
    ]);

    return response()->json([
        'message' => '本人確認を提出しました',
        'verification' => $verification,
    ], 201);
}


public function uploadVerificationImages(Request $request)
{
    $request->validate([
        'face_image' => 'required|image|max:5000',
        'document_image' => 'required|image|max:5000',
    ]);

    $facePath = $request->file('face_image')->store('identity/face', 'public');
    $docPath = $request->file('document_image')->store('identity/document', 'public');

    $faceImageUrl = config('app.url') . '/storage/' . $facePath;
    $documentImageUrl = config('app.url') . '/storage/' . $docPath;

    return response()->json([
        'face_image_url' => $faceImageUrl,
        'document_image_url' => $documentImageUrl,
    ]);
}


}
