<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCrowdfundingProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // 認可は元コード同等（変更なし）
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:60',
            'description' => 'required|string|max:5000',
            'goal_amount' => 'required|integer|min:10|max:1000000',
            'deadline' => 'required|date|after:today',
            'image_path' => 'nullable|string|max:1000',
        ];
    }
}
