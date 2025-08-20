<?php

namespace App\Http\Requests\Profile;

use Illuminate\Foundation\Http\FormRequest;

class UploadImageRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'image' => ['required','image','mimes:jpg,jpeg,png,webp','max:5120'],
        ];
    }

    public function attributes(): array
    {
        return ['image'=>'画像ファイル'];
    }
}
