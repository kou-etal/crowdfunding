<?php

namespace App\Http\Requests\Payments;

use Illuminate\Foundation\Http\FormRequest;

class CreatePaypalSessionRequest extends FormRequest
{
    public function authorize(): bool
    {
        
        return true;
    }

    public function rules(): array
    {
        return [
            'project_id' => ['required', 'exists:crowdfunding_projects,id'],
            'amount'     => ['required', 'numeric', 'min:1', 'regex:/^\d+(\.\d{1,2})?$/'],
        ];
    }
}
