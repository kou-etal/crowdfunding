<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\CrowdfundingProject;
use App\Models\CrowdfundingSupport;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CrowdfundingSupportTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @test
     */
    public function 支援額を合計して残額を正しく計算できる()
    {
        $user = User::factory()->create();
        $project = CrowdfundingProject::factory()->create([
            'goal_amount' => '100.00'
        ]);

        // 既存支援を2つ作る
        CrowdfundingSupport::factory()->create([
            'user_id'    => $user->id,
            'project_id' => $project->id,
            'amount'     => '25.50',
        ]);
        CrowdfundingSupport::factory()->create([
            'user_id'    => $user->id,
            'project_id' => $project->id,
            'amount'     => '10.00',
        ]);

        // APIで残額を取得
        $response = $this->actingAs($user)->getJson("/api/projects/{$project->id}/remaining");

        $response->assertOk();
        $this->assertEquals("64.50", $response->json('remaining'));  // ← 100 - 25.5 - 10 = 64.5
    }

    /**
     * @test
     */
    public function 残額を超える支援は422を返す()
    {
        $user = User::factory()->create();
        $project = CrowdfundingProject::factory()->create([
            'goal_amount' => '50.00'
        ]);

        // すでに40ドル支援されている状態
        CrowdfundingSupport::factory()->create([
            'user_id'    => $user->id,
            'project_id' => $project->id,
            'amount'     => '40.00',
        ]);

        $response = $this->actingAs($user)->postJson('/api/supports', [
            'project_id' => $project->id,
            'amount' => '20.00',
        ]);

        $response->assertStatus(422);
        $this->assertEquals(
            'Amount exceeds remaining goal.',
            $response->json('message')
        );
    }

    /**
     * @test
     */
    public function 目標到達後は支援できない()
    {
        $user = User::factory()->create();
        $project = CrowdfundingProject::factory()->create([
            'goal_amount' => '30.00'
        ]);

        CrowdfundingSupport::factory()->create([
            'user_id'    => $user->id,
            'project_id' => $project->id,
            'amount'     => '30.00',
        ]);

        $response = $this->actingAs($user)->postJson('/api/supports', [
            'project_id' => $project->id,
            'amount' => '5.00',
        ]);

        $response->assertStatus(409);
        $this->assertEquals(
            'This project already reached its goal.',
            $response->json('message')
        );
    }
}
