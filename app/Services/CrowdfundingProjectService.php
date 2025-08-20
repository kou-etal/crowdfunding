<?php

namespace App\Services;

use App\Models\CrowdfundingProject;
use App\Repositories\CrowdfundingProjectRepository;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class CrowdfundingProjectService
{
    public function __construct(
        private CrowdfundingProjectRepository $projects
    ) {}

   
    public function storeProject(Authenticatable $user, array $validated): array
    {
        $project = $this->projects->create([
            'user_id'      => $user->id,
            'title'        => $validated['title'],
            'description'  => $validated['description'],
            'goal_amount'  => $validated['goal_amount'],
            'deadline'     => $validated['deadline'],
            'image_path'   => $validated['image_path'] ?? null,
            'is_submitted' => true,
            'is_approved'  => false,
        ]);

        return ['提出が完了しました。運営の承認をお待ちください。', $project];
    }

   
    public function uploadProjectImage(UploadedFile $image): string
    {
        $path = $image->store('projects', 'public');
        return config('app.url') . '/storage/' . $path;
    }

   
    public function rejectProject(int|string $id, array $validated): array
    {
        $project = $this->projects->findOrFail($id);

        if (!$project->is_submitted) {
            return ['status' => 'error', 'message' => 'まだ提出されていません'];
        }

        if ($project->is_approved) {
            return ['status' => 'error', 'message' => 'すでに承認されています'];
        }

        $project->update([
            'is_rejected'     => true,
            'rejected_reason' => $validated['rejected_reason'] ?? null,
        ]);

        return ['status' => 'ok', 'message' => 'プロジェクトを却下しました'];
    }

    
    public function approveProject(int|string $id): array
    {
        $project = $this->projects->findOrFail($id);

        if (!$project->is_submitted) {
            return ['status' => 'error', 'message' => '提出されていません'];
        }

        $project->update(['is_approved' => true]);

        return ['status' => 'ok', 'message' => 'プロジェクトが承認されました'];
    }

    public function getPendingProjects()
    {
        return $this->projects->getPending();
    }

    public function getMyProjects(int|string $userId)
    {
        return $this->projects->getByUserId($userId);
    }

    public function getApprovedListForIndex()
    {
        return $this->projects->getApprovedWithRelationsForIndex();
    }

    
    public function getProjectDetail(int|string $id): CrowdfundingProject
    {
        return $this->projects->getDetailWithRelationsById($id);
    }
}
