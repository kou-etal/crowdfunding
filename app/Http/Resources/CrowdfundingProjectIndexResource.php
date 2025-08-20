<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class CrowdfundingProjectIndexResource extends JsonResource
{
    public function toArray($request)
    {
        $project = $this->resource;

        $sum = $project->supports->sum('amount');
        $progress = $project->goal_amount > 0 ? ($sum / $project->goal_amount * 100) : 0;

        $ownerAvatar = optional($project->user->identityVerification)->face_image_path
            ?? ($project->user?->profile_image);

        $base = $project->toArray();

        return array_merge($base, [
            'currentAmount'    => $sum,                           
            'progress_percent' => $progress,                     
            'ownerAvatarUrl'   => $ownerAvatar,                   
            'ownerName'        => $project->user?->name,         
            'imageUrl'         => $project->image_path,          
        ]);
    }
}
