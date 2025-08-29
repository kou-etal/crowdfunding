<?php


namespace Database\Factories;

use App\Models\CrowdfundingSupport;
use App\Models\CrowdfundingProject;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class CrowdfundingSupportFactory extends Factory
{
    protected $model = CrowdfundingSupport::class;

    public function definition(): array
    {
        return [
            'user_id'       => User::factory(),
            'project_id'    => CrowdfundingProject::factory(),
            'amount'        => '10.00',
            'currency'      => 'USD',
            'payment_id'    => null,
            'provider'      => 'paypal',
            'stripe_session_id' => null,
            'supported_at'  => now(),
            'raw_payload'   => null,
        ];
    }

    public function amount(string $amount): self
    {
        return $this->state(fn () => ['amount' => $amount]);
    }

    public function forProject(CrowdfundingProject $p): self
    {
        return $this->state(fn () => ['project_id' => $p->id]);
    }

    public function forUser(User $u): self
    {
        return $this->state(fn () => ['user_id' => $u->id]);
    }
}

