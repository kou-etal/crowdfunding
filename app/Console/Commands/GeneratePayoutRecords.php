<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\CrowdfundingProject;
use App\Models\PayoutRecord;
use Carbon\Carbon;

class GeneratePayoutRecords extends Command
{
    protected $signature = 'payout:generate';
    protected $description = 'Generate payout records for completed or expired projects';

    public function handle()
    {
        $now = Carbon::now();

        $alreadyPaidProjectIds = PayoutRecord::pluck('project_id')->toArray();

        $projects = CrowdfundingProject::with(['user', 'supports'])
            ->whereNotIn('id', $alreadyPaidProjectIds)
            ->where(function ($query) use ($now) {
                $query->where('deadline', '<', $now)
                      ->orWhereHas('supports', function ($q) {
                          $q->select('project_id')
                            ->groupBy('project_id')
                            ->havingRaw('SUM(amount) >= crowdfunding_projects.goal_amount');
                      });
            })
            ->get();

        foreach ($projects as $project) {
            $total = $project->supports->sum('amount');
            if ($total === 0) continue;

            PayoutRecord::create([
                'project_id'       => $project->id,
                'user_id'          => $project->user->id,
                'user_full_name'   => $project->user->name, // or full_name
                'user_email'       => $project->user->email,
                'total_amount'     => $total,
                'platform_fee'     => $total * 0.2,
                'payout_ready_at'  => now(),
                'is_paid'          => false,
            ]);
        }

        $this->info('Payout records generated successfully.');
    }
}
