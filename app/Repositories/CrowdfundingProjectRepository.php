<?php

namespace App\Repositories;

use App\Models\CrowdfundingProject;

class CrowdfundingProjectRepository
{
    public function create(array $data): CrowdfundingProject
    {
        return CrowdfundingProject::create($data);
    }

    public function findOrFail(int|string $id): CrowdfundingProject
    {
        return CrowdfundingProject::findOrFail($id);
    }

   public function getPending()
{
    return CrowdfundingProject::where('is_submitted', true)
        ->where('is_approved', false)
        ->where('is_rejected', false)
        ->with(['user.identityVerification'])
        ->withSum('supports', 'amount')
        ->orderBy('created_at', 'desc')
        ->get();
}
    public function getByUserId(int|string $userId)
    {
        return CrowdfundingProject::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function getApprovedWithRelationsForIndex()
    {
        return CrowdfundingProject::where('is_approved', true)
            ->where('is_rejected', false)
            ->with(['user.identityVerification', 'supports.user'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function getDetailWithRelationsById(int|string $id): CrowdfundingProject
    {
        return CrowdfundingProject::with([
            'user:id,name,full_name,email,profile_image,bio,degree,expertise,university,institute',
            'user.identityVerification:id,user_id,supervisor_name,supervisor_email,supervisor_affiliation,face_image_path',
            'supports.user:id,name'
        ])->findOrFail($id);
    }
}
