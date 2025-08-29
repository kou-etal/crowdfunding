<?php

namespace Tests\Feature;

use App\Models\CrowdfundingProject;
use App\Models\CrowdfundingSupport;
use App\Services\Crowdfunding\SupportService;
use App\Services\Payments\PaypalClient;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Exceptions\HttpResponseException;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class CrowdfundingSupportTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        $mock = $this->createMock(PaypalClient::class);
        $this->app->instance(PaypalClient::class, $mock);
    }

    #[Test]
    public function 支援額を合計して残額を正しく計算できる(): void
    {
        $project = CrowdfundingProject::factory()->goal(100)->create();

        CrowdfundingSupport::factory()->forProject($project)->amount('25.50')->create();
        CrowdfundingSupport::factory()->forProject($project)->amount('10.00')->create();

        /** @var SupportService $svc */
        $svc = app(SupportService::class);

        $remaining = $svc->remainingForProject($project->id); 
        $this->assertSame('64.50', number_format($remaining, 2, '.', ''));
    }

    #[Test]
    public function 残額を超える支援は422を返す(): void
    {
        $project = CrowdfundingProject::factory()->goal(50)->create();
        CrowdfundingSupport::factory()->forProject($project)->amount('40.00')->create();

        /** @var SupportService $svc */
        $svc = app(SupportService::class);

        try {
            $svc->assertCanContribute($project, 20.00);
            $this->fail('HttpResponseException が投げられるはず');
        } catch (HttpResponseException $e) {
            $this->assertSame(422, $e->getResponse()->getStatusCode());
            $this->assertStringContainsString('Amount exceeds remaining goal.', $e->getResponse()->getContent());
        }
    }

    #[Test]
    public function 目標到達後は支援できない(): void
    {
        $project = CrowdfundingProject::factory()->goal(30)->create();
        CrowdfundingSupport::factory()->forProject($project)->amount('30.00')->create();

        /** @var SupportService $svc */
        $svc = app(SupportService::class);

        try {
            $svc->assertCanContribute($project, 5.00);
            $this->fail('HttpResponseException が投げられるはず');
        } catch (HttpResponseException $e) {
            $this->assertSame(409, $e->getResponse()->getStatusCode());
            $this->assertStringContainsString('already reached its goal', $e->getResponse()->getContent());
        }
    }
}
