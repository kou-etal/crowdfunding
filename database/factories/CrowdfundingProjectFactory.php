<?php
namespace Database\Factories;

use App\Models\CrowdfundingProject;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class CrowdfundingProjectFactory extends Factory
{
    protected $model = CrowdfundingProject::class;

    public function definition(): array
    {
        return [
            'user_id'      => User::factory(),
            'title'        => $this->faker->sentence(4),
            'description'  => $this->faker->paragraph(),
            'goal_amount'  => '1000.00',               
            'deadline'     => now()->addDays(14),
            'image_path'   => null,
            'rejected_reason' => null,
            'is_submitted' => true,
            'is_approved'  => true,                    
            'is_rejected'  => false,
        ];
    }

  
    public function goal(float|int $amount): self
    {
        return $this->state(fn () => [
            'goal_amount' => number_format((float)$amount, 2, '.', ''),
        ]);
    }

    public function approved(bool $on = true): self
    {
        return $this->state(fn () => ['is_approved' => $on]);
    }

    public function rejected(bool $on = true): self
    {
        return $this->state(fn () => ['is_rejected' => $on]);
    }
}
