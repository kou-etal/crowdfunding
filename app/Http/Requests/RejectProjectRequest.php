<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RejectProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'rejected_reason' => 'nullable|string|max:1000',
        ];
    }
}
