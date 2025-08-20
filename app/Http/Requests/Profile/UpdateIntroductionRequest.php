<?php

namespace App\Http\Requests\Profile;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateIntroductionRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name'       => ['sometimes','string','max:255'],
            'full_name'  => ['nullable','string','max:255'],
            'bio'        => ['nullable','string','max:2000'],
            'role'       => ['required', Rule::in(['researcher','supporter'])],
            'degree'     => ['nullable','string', Rule::in(['修士','博士','その他'])],
            'expertise'  => ['nullable','string','max:255'],
            'university' => ['nullable','string','max:255'],
            'institute'  => ['nullable','string','max:255'],
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function($v){
            if ($this->input('role') === 'researcher') {
                foreach (['degree','expertise','university','institute'] as $f) {
                    if (empty($this->input($f))) {
                        $v->errors()->add($f, "研究者として登録するには「{$f}」の入力が必要です。");
                    }
                }
            }
        });
    }
}
