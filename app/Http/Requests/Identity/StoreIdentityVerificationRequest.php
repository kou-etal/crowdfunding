<?php

namespace App\Http\Requests\Identity;

use Illuminate\Foundation\Http\FormRequest;

class StoreIdentityVerificationRequest extends FormRequest
{
    public function authorize(): bool { return true; } 

    public function rules(): array
    {
        return [
            'face_image_path'        => ['required','string','max:1000'],
            'document_image_path'    => ['required','string','max:1000'],
            'honor_statement'        => ['accepted'],
            'supervisor_name'        => ['required','string','max:255'],
            'supervisor_email'       => ['required','email'],
            'supervisor_affiliation' => ['required','string','max:255'],
        ];
    }
}
