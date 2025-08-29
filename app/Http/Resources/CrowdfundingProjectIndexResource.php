<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class CrowdfundingProjectIndexResource extends JsonResource
{
    public function toArray($request)
    {
        $project = $this->resource;

        $sum = (string) $project->supports->sum('amount');
        $goal = (string) $project->goal_amount;

        // bcmath
        $progress = bccomp($goal, '0', 2) === 1
            ? (float) bcmul(bcdiv($sum, $goal, 4), '100', 2)
            : 0.0;

        $ownerAvatar = optional($project->user->identityVerification)->face_image_path
            ?? ($project->user?->profile_image);

        return [
            'id'               => $project->id,
            'title'            => $project->title,
            'description'      => $project->description,
            'goal_amount'      => (string) $goal,   // string固定
            'current_amount'   => (string) $sum,    // string固定
            'progress_percent' => $progress,        // float固定
            'ownerAvatarUrl'   => $ownerAvatar,
            'ownerName'        => $project->user?->name,
            'imageUrl'         => $project->image_path,
            'deadline'         => $project->deadline->toDateString(),
        ];
    }
}
