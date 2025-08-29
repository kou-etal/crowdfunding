<?php

namespace Tests\Unit;

use App\Models\CrowdfundingProject;
use App\Services\Crowdfunding\SupportService;
use App\Services\Payments\PaypalClient;
use Illuminate\Http\Exceptions\HttpResponseException;
use Mockery;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class SupportServiceUnitTest extends TestCase
{
    protected function makeServiceWithRemaining(float $remaining): SupportService
    {
        // PaypalClient は今回使わないのでモック
        $paypal = $this->createMock(PaypalClient::class);

        
        /** @var SupportService $svc */
        $svc = Mockery::mock(SupportService::class, [$paypal])->makePartial();
        $svc->shouldReceive('remainingForProject')->andReturn($remaining);

        return $svc;
    }

    protected function dummyProject(int $id = 1): CrowdfundingProject
    {
        $p = new CrowdfundingProject();
        $p->id = $id;
        $p->goal_amount = '100.00';
        $p->title = 'Dummy';
        return $p;
    }

    #[Test]
    public function 残額内なら例外なく通過する(): void
    {
        $svc = $this->makeServiceWithRemaining(50.00);
        $project = $this->dummyProject();

        $svc->assertCanContribute($project, 20.00);
        $this->assertTrue(true);
    }

    #[Test]
    public function 残額超過は422を返す(): void
    {
        $svc = $this->makeServiceWithRemaining(10.00);
        $project = $this->dummyProject();

        try {
            $svc->assertCanContribute($project, 20.00);
            $this->fail('HttpResponseException が投げられるはず');
        } catch (HttpResponseException $e) {
            $this->assertSame(422, $e->getResponse()->getStatusCode());
        }
    }

    #[Test]
    public function 目標到達後は409を返す(): void
    {
        $svc = $this->makeServiceWithRemaining(0.00);
        $project = $this->dummyProject();

        try {
            $svc->assertCanContribute($project, 1.00);
            $this->fail('HttpResponseException が投げられるはず');
        } catch (HttpResponseException $e) {
            $this->assertSame(409, $e->getResponse()->getStatusCode());
        }
    }
}
