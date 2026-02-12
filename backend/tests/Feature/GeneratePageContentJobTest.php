<?php

namespace Tests\Feature;

use App\Jobs\GeneratePageContent;
use App\Models\AiGenerationLog;
use App\Models\Page;
use App\Services\AI\AIManager;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GeneratePageContentJobTest extends TestCase
{
    use RefreshDatabase;

    public function test_job_generates_content_and_updates_page()
    {
        $page = Page::create([
            'title' => 'Job Test Page',
            'slug' => 'job-test-page',
            'type' => 'service',
            'status' => 'draft',
        ]);

        $params = [
            'page_id' => $page->id,
            'primary_keyword' => 'AI Job Testing',
            'target_industry' => 'Software',
            'tone' => 'Technical',
            'content_length' => 'Short',
            'model' => 'lorum', // Use LorumService
        ];

        $job = new GeneratePageContent($page->id, $params);
        $aiManager = new AIManager();

        $job->handle($aiManager);

        // Reload page
        $page->refresh();
        $page->load(['sections.blocks', 'seo']);

        // Assert Title Updated (LorumService sets title based on industry)
        $this->assertEquals('AI Services for Software', $page->title);

        // Assert SEO Meta
        $this->assertNotNull($page->seo);
        $this->assertEquals('AI Solutions for Software | Totan.ai', $page->seo->meta_title);

        // Assert Sections Created
        $this->assertNotEmpty($page->sections);
        $this->assertTrue($page->sections->count() > 0);

        // Assert Log Created
        $this->assertDatabaseHas('ai_generation_logs', [
            'page_id' => $page->id,
            'response_status' => 'success',
            'model_used' => 'lorum',
        ]);
    }
}
