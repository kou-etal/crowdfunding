<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCrowdfundingProjectRequest;
use App\Http\Requests\UploadProjectImageRequest;
use App\Http\Requests\RejectProjectRequest;
use App\Http\Resources\CrowdfundingProjectIndexResource;
use App\Http\Resources\CrowdfundingProjectShowResource;
use App\Services\CrowdfundingProjectService;
use Illuminate\Http\Request;

class CrowdfundingProjectApiController extends Controller
{
    public function __construct(
        private CrowdfundingProjectService $service
    ) {}

    public function store(StoreCrowdfundingProjectRequest $request)
    {
        [$message, $project] = $this->service->storeProject(
            $request->user(),
            $request->validated()
        );

        return response()->json([
            'message' => $message,
            'project' => $project,
        ], 201);
    }

    public function uploadProjectImage(UploadProjectImageRequest $request)
    {
        $imageUrl = $this->service->uploadProjectImage($request->file('image'));

        return response()->json([
            'image_url' => $imageUrl,
        ]);
    }

    public function reject(RejectProjectRequest $request, $id)
    {
        $result = $this->service->rejectProject($id, $request->validated());
        if ($result['status'] === 'error') {
            return response()->json(['message' => $result['message']], 400);
        }
        return response()->json(['message' => $result['message']]);
    }

    public function pending()
    {
        $projects = $this->service->getPendingProjects();
        
        return response()->json($projects);
    }

    public function myProjects(Request $request)
    {
        $projects = $this->service->getMyProjects($request->user()->id);
        return response()->json($projects);
    }

    public function approve(Request $request, $id)
    {
        $result = $this->service->approveProject($id);
        if ($result['status'] === 'error') {
            return response()->json(['message' => $result['message']], 400);
        }
        return response()->json(['message' => $result['message']]);
    }

    public function index()
    {
        $projects = $this->service->getApprovedListForIndex();

        
        return CrowdfundingProjectIndexResource::collection($projects)->response();
    }

    public function show($id)
    {
        $project = $this->service->getProjectDetail($id);
        return (new CrowdfundingProjectShowResource($project))->response();
    }
}




