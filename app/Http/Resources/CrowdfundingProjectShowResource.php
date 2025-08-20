<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class CrowdfundingProjectShowResource extends JsonResource
{
    public function toArray($request)
    {
        $project = $this->resource;

        $identity = $project->user->identityVerification;
        $sum = $project->supports->sum('amount');

        return [
            'id' => $project->id,
            'title' => $project->title,
            'description' => $project->description,
            'goal_amount' => $project->goal_amount,
            'current_amount' => $sum,
            'progress_percent' => min(100, round($sum / $project->goal_amount * 100)),
            'user' => [
                'name' => $project->user->name,
                'full_name' => $project->user->full_name,
                'email' => $project->user->email,
                'bio' => $project->user->bio,
                'degree' => $project->user->degree,
                'expertise' => $project->user->expertise,
                'university' => $project->user->university,
                'institute' => $project->user->institute,
                'profile_image' => optional($identity)->face_image_path ?? $project->user->profile_image,
            ],
            'supervisor_name' => optional($identity)->supervisor_name,
            'supervisor_email' => optional($identity)->supervisor_email,
            'supervisor_affiliation' => optional($identity)->supervisor_affiliation,
            'supports' => $project->supports->map(function ($support) {
                return [
                    'amount' => $support->amount,
                    'user' => $support->user,
                    'supported_at' => $support->created_at->toDateTimeString(),
                ];
            }),
            'deadline' => $project->deadline->toDateString(),
            'created_at' => $project->created_at->toDateTimeString(),
        ];
    }
}
