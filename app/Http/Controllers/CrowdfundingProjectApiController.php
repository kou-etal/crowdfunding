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
        'is_submitted' => true,    // ← 提出済みにして保存
        'is_approved' => false,    // ← まだ未承認
    ]);

    return response()->json([
        'message' => '提出が完了しました。運営の承認をお待ちください。',
        'project' => $project,
    ], 201);
}

public function reject(Request $request, $id)
{
    $project = CrowdfundingProject::findOrFail($id);

    // 未提出のものは却下できない
    if (!$project->is_submitted) {
        return response()->json(['message' => 'まだ提出されていません'], 400);
    }

    // すでに承認済みなら却下できない
    if ($project->is_approved) {
        return response()->json(['message' => 'すでに承認されています'], 400);
    }

    // バリデーション（任意理由付き）
    $validated = $request->validate([
        'rejected_reason' => 'nullable|string|max:1000',
    ]);

    // 却下フラグと理由を更新
    $project->update([
        'is_rejected' => true,
        'rejected_reason' => $validated['rejected_reason'] ?? null,
    ]);

    return response()->json(['message' => 'プロジェクトを却下しました']);
}

 public function pending()
    {
        $projects = CrowdfundingProject::where('is_submitted', true)
            ->where('is_approved', false)
            ->where('is_rejected', false)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($projects);
    }

public function myProjects(Request $request)
{
    $projects = CrowdfundingProject::where('user_id', $request->user()->id)
        ->orderBy('created_at', 'desc')
        ->get();

    return response()->json($projects);
}


public function approve(Request $request, $id)
{
    $project = CrowdfundingProject::findOrFail($id);

    if (!$project->is_submitted) {
        return response()->json(['message' => '提出されていません'], 400);
    }

    $project->update(['is_approved' => true]);

    return response()->json(['message' => 'プロジェクトが承認されました']);
}


    // 一覧取得
public function index()
{
    $projects = CrowdfundingProject::where('is_approved', true)
        ->where('is_rejected', false)
        ->with('user') // ← ユーザー情報をEager Load
        ->orderBy('created_at', 'desc')
        ->get()
        ->map(function ($project) {
            $project->progress_percent = $project->supports->sum('amount') / $project->goal_amount * 100;

            // ユーザー情報を追加（null安全に）
            $project->ownerAvatarUrl = $project->user?->profile_image;
            $project->ownerName = $project->user?->name;

            // プロジェクト画像（あれば）
            $project->imageUrl = $project->image_path;

            return $project;
        });

    return response()->json($projects);
}


public function show($id)
{$project = CrowdfundingProject::with([
    'user:id,name,profile_image',
    'user.identityVerification:id,user_id,supervisor_name,supervisor_email,supervisor_affiliation', // ← 追加
    'supports.user:id,name'
])->findOrFail($id);


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

    // ← ここに追加
    'supervisor_name' => optional($project->user->identityVerification)->supervisor_name,
    'supervisor_email' => optional($project->user->identityVerification)->supervisor_email,
    'supervisor_affiliation' => optional($project->user->identityVerification)->supervisor_affiliation,
]);

}


}
