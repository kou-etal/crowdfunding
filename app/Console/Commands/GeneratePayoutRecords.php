<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\CrowdfundingProject;
use App\Models\PayoutRecord;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class GeneratePayoutRecords extends Command
{
    protected $signature = 'payout:generate';
    protected $description = 'Generate payout records for completed or goal-reached projects';

    public function handle()
    {
        $now = Carbon::now();

        // 既にPayoutRecordがあるプロジェクトは除外
        $excludedProjectIds = PayoutRecord::pluck('project_id')->all();

        // 期限切れ or 目標到達（EXISTS+HAVINGで判定）
        $projects = CrowdfundingProject::with(['user', 'supports'])
            ->whereNotIn('id', $excludedProjectIds)
            ->where(function ($q) use ($now) {
                $q->where('deadline', '<', $now)
                  ->orWhereRaw("
                    EXISTS (
                      SELECT 1
                      FROM crowdfunding_supports cs
                      WHERE cs.project_id = crowdfunding_projects.id
                      GROUP BY cs.project_id
                      HAVING SUM(cs.amount) >= crowdfunding_projects.goal_amount
                    )
                  ");
            })
            ->get();

        $created = 0;

        DB::transaction(function () use ($projects, &$created) {
            foreach ($projects as $project) {
                // 合計は eager loaded の supports から算出
                $total = (int) $project->supports->sum('amount');
                if ($total <= 0) continue;

                $platformFee = (int) round($total * 0.20); // 20%

                PayoutRecord::create([
                    'project_id'      => $project->id,
                    'project_title'   => $project->title,
                    'user_id'         => $project->user->id,
                    'user_full_name'  => $project->user->name,
                    'user_email'      => $project->user->email,
                    'goal_amount'    => $project->goal_amount,
                    'total_amount'    => $total,
                    'platform_fee'    => $platformFee,
                    'payout_ready_at' => now(),
                    'is_paid'         => false,
                ]);

                $created++;
            }
        });

        $this->info("Payout records generated: {$created}");
    }
}
