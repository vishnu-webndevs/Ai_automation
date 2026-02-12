<?php

namespace App\Jobs;

use App\Models\AiGenerationLog;
use App\Models\ContentBlock;
use App\Models\Page;
use App\Models\PageSection;
use App\Models\SeoMeta;
use App\Services\AI\AIManager;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class GeneratePageContent implements ShouldQueue
{
    use Queueable;

    protected $pageId;
    protected $parameters;

    /**
     * Create a new job instance.
     */
    public function __construct(int $pageId, array $parameters)
    {
        $this->pageId = $pageId;
        $this->parameters = $parameters;
    }

    /**
     * Execute the job.
     */
    public function handle(AIManager $aiManager): void
    {
        $page = Page::find($this->pageId);

        if (!$page) {
            Log::error("GeneratePageContent: Page {$this->pageId} not found.");
            return;
        }

        try {
            $validated = $this->parameters;
            $aiService = $aiManager->createService($validated['model']);

            $generatedContent = $aiService->generatePageContent($validated);
            $generatedContent = $this->normalizeAiResponse($generatedContent);
            $this->validateAiResponse($generatedContent);

            DB::transaction(function () use ($page, $generatedContent, $validated) {
                $page->sections()->delete();
                if ($page->seo) {
                    $page->seo->delete();
                }

                if (!empty($generatedContent['title'])) {
                    $page->update(['title' => $generatedContent['title']]);
                }

                SeoMeta::create([
                    'page_id' => $page->id,
                    'meta_title' => $generatedContent['meta_title'] ?? null,
                    'meta_description' => $generatedContent['meta_description'] ?? null,
                    'meta_keywords' => $validated['primary_keyword'],
                    'schema_json' => $generatedContent['schema_json'] ?? null,
                ]);

                if (!empty($generatedContent['sections'])) {
                    foreach ($generatedContent['sections'] as $index => $sectionData) {
                        $section = PageSection::create([
                            'page_id' => $page->id,
                            'section_key' => $sectionData['section_key'] ?? 'section-' . $index,
                            'order' => $index,
                        ]);

                        if (!empty($sectionData['content_blocks'])) {
                            foreach ($sectionData['content_blocks'] as $blockIndex => $blockData) {
                                ContentBlock::create([
                                    'section_id' => $section->id,
                                    'block_type' => $blockData['type'],
                                    'content_json' => $blockData['content'],
                                    'order' => $blockIndex,
                                ]);
                            }
                        }
                    }
                }
                
                if (!empty($generatedContent['faqs'])) {
                     $faqSection = PageSection::create([
                        'page_id' => $page->id,
                        'section_key' => 'faqs',
                        'order' => 1000,
                    ]);
                    
                    ContentBlock::create([
                        'section_id' => $faqSection->id,
                        'block_type' => 'faq_list',
                        'content_json' => $generatedContent['faqs'],
                        'order' => 0,
                    ]);
                }

                if (!empty($generatedContent['internal_links'])) {
                    $linksSection = PageSection::create([
                        'page_id' => $page->id,
                        'section_key' => 'internal_links',
                        'order' => 1001,
                    ]);

                    ContentBlock::create([
                        'section_id' => $linksSection->id,
                        'block_type' => 'internal_links',
                        'content_json' => $generatedContent['internal_links'],
                        'order' => 0,
                    ]);
                }
            });

            AiGenerationLog::create([
                'page_id' => $page->id,
                'model_used' => $validated['model'],
                'prompt_used' => "Keyword: {$validated['primary_keyword']}, Industry: {$validated['target_industry']}",
                'tokens_used' => 0,
                'response_status' => 'success',
            ]);

        } catch (ValidationException $e) {
            AiGenerationLog::create([
                'page_id' => $page->id,
                'model_used' => $validated['model'] ?? 'unknown',
                'prompt_used' => "Keyword: " . ($validated['primary_keyword'] ?? ''),
                'response_status' => 'invalid_json',
            ]);
            Log::error("GeneratePageContent Validation Error: " . json_encode($e->errors()));

        } catch (\Exception $e) {
            Log::error('AI Generation Failed: ' . $e->getMessage());
            
            AiGenerationLog::create([
                'page_id' => $page->id,
                'model_used' => $validated['model'],
                'prompt_used' => "Keyword: {$validated['primary_keyword']}",
                'response_status' => 'failed',
            ]);
        }
    }

    private function validateAiResponse(array $data): void
    {
        $validator = Validator::make($data, [
            'title' => 'required|string',
            'meta_title' => 'required|string',
            'meta_description' => 'required|string',
            'sections' => 'required|array',
            'sections.*.section_key' => 'required|string',
            'sections.*.content_blocks' => 'required|array',
            'sections.*.content_blocks.*.type' => 'required|string',
            'sections.*.content_blocks.*.content' => 'present',
            'faqs' => 'required|array',
            'faqs.*.question' => 'required|string',
            'faqs.*.answer' => 'required|string',
            'internal_links' => 'required|array',
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }
    }

    private function normalizeAiResponse(array $data): array
    {
        $data['sections'] = $data['sections'] ?? [];
        $data['faqs'] = $data['faqs'] ?? [];
        $data['internal_links'] = $data['internal_links'] ?? [];

        return $data;
    }
}
