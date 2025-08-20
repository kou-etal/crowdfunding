<?php

namespace App\Http\Requests\Profile;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * supporter のときは研究者向けフィールドを null に正規化
     */
    protected function prepareForValidation(): void
    {
        $role = $this->input('role');

        if ($role !== 'researcher') {
            $this->merge([
                'degree'     => null,
                'expertise'  => null,
                'university' => null,
                'institute'  => null,
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'name'        => ['required','string','max:255'],
            'full_name'   => ['required','string','max:255'],
            'bio'         => ['required','string','max:2000'],
            'role'        => ['required', Rule::in(['researcher','supporter'])],

           
            'degree'      => ['nullable','string', Rule::in(['修士','博士','その他']), 'required_if:role,researcher'],
            'expertise'   => ['nullable','string','max:255', 'required_if:role,researcher'],
            'university'  => ['nullable','string','max:255', 'required_if:role,researcher'],
            'institute'   => ['nullable','string','max:255', 'required_if:role,researcher'],

       
            // 'profile_image' => ['nullable','url'],
        ];
    }

    public function attributes(): array
    {
        return [
            'name'        => 'ユーザー名',
            'full_name'   => '氏名',
            'bio'         => '自己紹介',
            'role'        => 'ロール',
            'degree'      => '学位',
            'expertise'   => '専門分野',
            'university'  => '大学',
            'institute'   => '所属',
        ];
    }

    public function messages(): array
    {
        return [
            'role.in'                 => 'ロールは researcher か supporter を指定してください。',
            'degree.required_if'      => '研究者として登録するには「学位」の入力が必要です。',
            'expertise.required_if'   => '研究者として登録するには「専門分野」の入力が必要です。',
            'university.required_if'  => '研究者として登録するには「大学」の入力が必要です。',
            'institute.required_if'   => '研究者として登録するには「所属」の入力が必要です。',
        ];
    }
}
