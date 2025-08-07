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
        'title' => 'required|string|max:60',
        'description' => 'required|string|max:5000',
        'goal_amount' => 'required|integer|min:10|max:1000000',
        'deadline' => 'required|date|after:today',
        'image_path' => 'nullable|string|max:1000', // ← URLとして受け取る
    ]);

    $project = CrowdfundingProject::create([
        'user_id' => $request->user()->id,
        'title' => $validated['title'],
        'description' => $validated['description'],
        'goal_amount' => $validated['goal_amount'],
        'deadline' => $validated['deadline'],
        'image_path' => $validated['image_path'] ?? null,
        'is_submitted' => true,
        'is_approved' => false,
    ]);

    return response()->json([
        'message' => '提出が完了しました。運営の承認をお待ちください。',
        'project' => $project,
    ], 201);
}

public function uploadProjectImage(Request $request)
{
    $request->validate([
        'image' => 'required|image|max:5000',
    ]);

    $path = $request->file('image')->store('projects', 'public');

    $imageUrl = config('app.url') . '/storage/' . $path;

    return response()->json([
        'image_url' => $imageUrl,
    ]);
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
    ->with(['user.identityVerification', 'supports.user']) // supports 必須
    ->orderBy('created_at', 'desc')
    ->get()
    ->map(function ($project) {
        $sum = $project->supports->sum('amount');
        $project->currentAmount = $sum;
        $project->progress_percent = $project->goal_amount > 0 ? ($sum / $project->goal_amount * 100) : 0;
        $project->ownerAvatarUrl = optional($project->user->identityVerification)->face_image_path
            ?? $project->user?->profile_image;
        $project->ownerName = $project->user?->name;
        $project->imageUrl = $project->image_path;

        return $project;
   
    });

        

    return response()->json($projects);
}


public function show($id)
{
    $project = CrowdfundingProject::with([
        'user:id,name,full_name,email,profile_image,bio,degree,expertise,university,institute',
        'user.identityVerification:id,user_id,supervisor_name,supervisor_email,supervisor_affiliation,face_image_path',
        'supports.user:id,name'
    ])->findOrFail($id);

    $identity = $project->user->identityVerification;

    return response()->json([
        'id' => $project->id,
        'title' => $project->title,
        'description' => $project->description,
        'goal_amount' => $project->goal_amount,
        'current_amount' => $project->supports->sum('amount'),
        'progress_percent' => min(100, round($project->supports->sum('amount') / $project->goal_amount * 100)),
        'user' => [
            'name' => $project->user->name,
            'full_name' => $project->user->full_name,
            'email' => $project->user->email, // ← ✅ 追加
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
    ]);
}


}



