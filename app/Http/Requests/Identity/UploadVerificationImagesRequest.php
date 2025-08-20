<?php

namespace App\Http\Requests\Identity;

use Illuminate\Foundation\Http\FormRequest;

class UploadVerificationImagesRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'face_image'     => ['required','image','max:5000'],
            'document_image' => ['required','image','max:5000'],
        ];
    }
}
