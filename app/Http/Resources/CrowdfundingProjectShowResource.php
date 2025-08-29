<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class CrowdfundingProjectShowResource extends JsonResource
{
    public function toArray($request)
    {
        $project = $this->resource;

        $identity = $project->user->identityVerification;
        $sum = (string) $project->supports->sum('amount');
        $goal = (string) $project->goal_amount;

        $progress = bccomp($goal, '0', 2) === 1
            ? (float) bcmul(bcdiv($sum, $goal, 4), '100', 2)
            : 0.0;

        return [
            'id'               => $project->id,
            'title'            => $project->title,
            'description'      => $project->description,
            'goal_amount'      => (string) $goal,   // string固定
            'current_amount'   => (string) $sum,    // string固定
            'progress_percent' => $progress,        // float固定

            'user' => [
                'name'         => $project->user->name,
                'full_name'    => $project->user->full_name,
                'email'        => $project->user->email,
                'bio'          => $project->user->bio,
                'degree'       => $project->user->degree,
                'expertise'    => $project->user->expertise,
                'university'   => $project->user->university,
                'institute'    => $project->user->institute,
                'profile_image'=> optional($identity)->face_image_path ?? $project->user->profile_image,
            ],

            'supervisor_name'        => optional($identity)->supervisor_name,
            'supervisor_email'       => optional($identity)->supervisor_email,
            'supervisor_affiliation' => optional($identity)->supervisor_affiliation,

            'supports' => $project->supports->map(function ($support) {
                return [
                    'amount'       => (string) $support->amount,
                    'user'         => $support->user,
                    'supported_at' => $support->created_at->toDateTimeString(),
                ];
            }),

            'deadline'   => $project->deadline->toDateString(),
            'created_at' => $project->created_at->toDateTimeString(),
        ];
    }
}
