<?php

namespace App\Services\Identity;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class VerificationImageService
{

    public function upload(UploadedFile $face, UploadedFile $doc): array
    {
        $facePath = $face->store('identity/face', 'public');
        $docPath  = $doc->store('identity/document', 'public');

        $base = rtrim(config('app.url'), '/');

        return [
            'face_image_url'     => $base.'/storage/'.$facePath,
            'document_image_url' => $base.'/storage/'.$docPath,
        ];
    }
}
