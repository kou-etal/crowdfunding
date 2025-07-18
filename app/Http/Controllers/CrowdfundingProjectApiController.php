<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\CrowdfundingProject;
use App\Models\CrowdfundingSupport;
use Illuminate\Support\Facades\Auth;

class CrowdfundingProjectApiController extends Controller
{
    // 投稿（プロジェクト作成）
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string|max:5000',
            'goal_amount' => 'required|integer|min:1000',
            'deadline' => 'required|date|after:today',
        ]);

        $project = CrowdfundingProject::create([
            'user_id' => $request->user()->id,
            'title' => $validated['title'],
            'description' => $validated['description'],
            'goal_amount' => $validated['goal_amount'],
            'deadline' => $validated['deadline'],
        ]);

        return response()->json([
            'message' => 'プロジェクトが作成されました',
            'project' => $project,
        ], 201);
    }

    // 一覧取得
    public function index()
{
    $userId = Auth::id();

    $projects = CrowdfundingProject::with(['user:id,name,profile_image', 'supports'])
        ->latest()
        ->get()
        ->map(function ($project) use ($userId) {
            $totalSupport = $project->supports->sum('amount');
            $mySupport = $project->supports->where('user_id', $userId)->sum('amount');

            return [
                'id' => $project->id,
                'title' => $project->title,
                'description' => $project->description,
                'goal_amount' => $project->goal_amount,
                'current_amount' => $totalSupport,
                'progress_percent' => min(100, round(($totalSupport / $project->goal_amount) * 100)),
                'user' => $project->user,
                'my_support_amount' => $mySupport,
                'deadline' => $project->deadline->toDateString(),
                'created_at' => $project->created_at->toDateTimeString(),
            ];
        });

    return response()->json($projects);
}
public function show($id)
{
    $project = CrowdfundingProject::with('user:id,name,profile_image')
        ->with(['supports.user:id,name'])
        ->findOrFail($id);

    return response()->json([
        'id' => $project->id,
        'title' => $project->title,
        'description' => $project->description,
        'goal_amount' => $project->goal_amount,
        'current_amount' => $project->supports->sum('amount'),
        'progress_percent' => min(100, round($project->supports->sum('amount') / $project->goal_amount * 100)),
        'user' => $project->user,
        'supports' => $project->supports->map(function ($support) {
            return [
                'amount' => $support->amount,
                'user' => $support->user,
                'supported_at' => $support->created_at->toDateTimeString(),
            ];
        }),
        'deadline' => $project->deadline->toDateString(),
        'created_at' => $project->created_at->toDateTimeString(),
    ]);
}


}
