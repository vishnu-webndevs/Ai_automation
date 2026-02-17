<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Page;
use App\Models\PageSection;
use App\Models\ContentBlock;
use App\Models\SeoMeta;
use App\Models\AiGenerationLog;
use App\Models\Service;
use App\Models\UseCase;
use App\Models\BlogCategory;
use App\Models\BlogTag;
use App\Models\Cta;
use App\Models\Industry;
use App\Models\MediaAsset;
use App\Jobs\GeneratePageContent;
use App\Services\AI\AIManager;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class PageController extends Controller
{
    protected $aiManager;

    public function __construct(AIManager $aiManager)
    {
        $this->aiManager = $aiManager;
    }
    public function index(Request $request)
    {
        $validated = $request->validate([
            'type' => 'sometimes|nullable|string',
            'status' => 'sometimes|nullable|in:draft,published',
            'q' => 'sometimes|nullable|string',
            'sort' => 'sometimes|nullable|in:title,slug,type,status,updated_at,created_at',
            'dir' => 'sometimes|nullable|in:asc,desc',
            'per_page' => 'sometimes|nullable|integer|min:1|max:100',
        ]);

        $query = Page::query()->with('seo')->withCount('sections');

        if (!empty($validated['type'])) {
            $query->where('type', $validated['type']);
        }

        if ($request->has('exclude_type')) {
            $query->where('type', '!=', $request->input('exclude_type'));
        }

        if (!empty($validated['status'])) {
            $query->where('status', $validated['status']);
        }

        if (!empty($validated['q'])) {
            $q = $validated['q'];
            $query->where(function ($sub) use ($q) {
                $sub->where('title', 'like', "%{$q}%")
                    ->orWhere('slug', 'like', "%{$q}%");
            });
        }

        $sort = $validated['sort'] ?? 'updated_at';
        $dir = $validated['dir'] ?? 'desc';
        $perPage = $validated['per_page'] ?? 20;

        return response()->json(
            $query->orderBy($sort, $dir)->paginate($perPage)
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|string',
            'status' => 'required|in:draft,published,scheduled,archived',
            'slug' => 'nullable|string|unique:pages,slug',
            'template' => 'nullable|string',
            // Relations
            'services' => 'sometimes|array',
            'services.*' => 'integer|exists:services,id',
            'solutions' => 'sometimes|array',
            'solutions.*' => 'integer|exists:solutions,id',
            'integrations' => 'sometimes|array',
            'integrations.*' => 'integer|exists:integrations,id',
            'industries' => 'sometimes|array',
            'industries.*' => 'integer|exists:industries,id',
            'use_cases' => 'sometimes|array',
            'use_cases.*' => 'integer|exists:use_cases,id',
            'blog_categories' => 'sometimes|array',
            'blog_categories.*' => 'integer|exists:blog_categories,id',
            'blog_tags' => 'sometimes|array',
            'blog_tags.*' => 'integer|exists:blog_tags,id',
            'ctas' => 'sometimes|array',
            'ctas.*' => 'integer|exists:ctas,id',
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']);
        }

        $page = DB::transaction(function () use ($validated, $request) {
            $page = Page::create($validated);
            $this->syncRelationships($page, $request);
            return $page;
        });

        return response()->json($page->load(['services', 'industries', 'useCases', 'blogCategories', 'blogTags', 'ctas']), 201);
    }

    public function update(Request $request, int $id)
    {
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'type' => 'sometimes|string',
            'status' => 'sometimes|in:draft,published,scheduled,archived',
            'slug' => 'sometimes|nullable|string|unique:pages,slug,' . $id,
            'template' => 'sometimes|nullable|string',
            
            // Relations
            'services' => 'sometimes|array',
            'solutions' => 'sometimes|array',
            'integrations' => 'sometimes|array',
            'industries' => 'sometimes|array',
            'use_cases' => 'sometimes|array',
            'blog_categories' => 'sometimes|array',
            'blog_tags' => 'sometimes|array',
            'ctas' => 'sometimes|array',

            // Content
            'sections' => 'sometimes|array',
            'seo' => 'sometimes|array',
        ]);

        $page = Page::findOrFail($id);

        if (array_key_exists('slug', $validated) && empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title'] ?? $page->title);
        }

        DB::transaction(function () use ($page, $validated, $request) {
            $page->update($validated);
            
            $this->syncRelationships($page, $request);

            if ($request->has('seo')) {
                $page->seoMeta()->updateOrCreate([], $request->input('seo'));
            }

            if ($request->has('sections')) {
                $this->syncSections($page, $request->input('sections'));
            }
        });

        return response()->json($page->fresh(['seo', 'services', 'industries', 'useCases', 'blogCategories', 'blogTags', 'ctas'])->loadCount('sections'));
    }

    public function destroy(int $id)
    {
        $page = Page::findOrFail($id);
        $page->delete();
        return response()->json(null, 204);
    }

    public function togglePublish(int $id)
    {
        $page = Page::findOrFail($id);

        $nextStatus = $page->status === 'published' ? 'draft' : 'published';
        if ($nextStatus === 'published') {
            $missing = $this->findMissingAltForPage($page->id);
            if (count($missing) > 0) {
                return response()->json([
                    'message' => 'Alt text is required before publishing',
                    'missing' => $missing,
                ], 422);
            }
        }

        $page->status = $nextStatus;
        $page->save();

        return response()->json($page->fresh(['seo'])->loadCount('sections'));
    }

    public function bulkStatus(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:pages,id',
            'status' => 'required|in:draft,published',
        ]);

        if ($validated['status'] === 'published') {
            $missing = [];
            foreach ($validated['ids'] as $pageId) {
                $pageMissing = $this->findMissingAltForPage((int)$pageId);
                if (count($pageMissing) > 0) {
                    $missing[] = [
                        'page_id' => (int)$pageId,
                        'missing' => $pageMissing,
                    ];
                }
            }

            if (count($missing) > 0) {
                return response()->json([
                    'message' => 'Alt text is required before publishing',
                    'missing_pages' => $missing,
                ], 422);
            }
        }

        $count = Page::query()
            ->whereIn('id', $validated['ids'])
            ->update(['status' => $validated['status']]);

        return response()->json(['updated' => $count]);
    }

    public function bulkCreate(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.title' => 'required|string|max:255',
            'items.*.type' => 'required|string', // e.g., 'service', 'blog'
            'items.*.target_industry' => 'nullable|string',
            'items.*.primary_keyword' => 'nullable|string',
        ]);

        $createdPages = [];

        DB::transaction(function () use ($validated, &$createdPages) {
            foreach ($validated['items'] as $item) {
                $slug = Str::slug($item['title']);
                $baseSlug = $slug;
                $i = 1;
                while (Page::where('slug', $slug)->exists()) {
                    $slug = $baseSlug . '-' . $i++;
                }

                $page = Page::create([
                    'title' => $item['title'],
                    'slug' => $slug,
                    'type' => $item['type'],
                    'status' => 'draft',
                ]);

                if (!empty($item['primary_keyword'])) {
                    SeoMeta::create([
                        'page_id' => $page->id,
                        'meta_title' => $item['title'],
                        'meta_description' => '',
                        'meta_keywords' => $item['primary_keyword'],
                    ]);
                }

                if (!empty($item['target_industry'])) {
                    $industry = Industry::firstOrCreate(
                        ['name' => $item['target_industry']],
                        ['slug' => Str::slug($item['target_industry'])]
                    );
                    $page->industries()->attach($industry->id);
                }

                $createdPages[] = $page;
            }
        });

        return response()->json($createdPages, 201);
    }

    public function bulkGenerate(Request $request)
    {
        $validated = $request->validate([
            'page_ids' => 'required|array|min:1',
            'page_ids.*' => 'integer|exists:pages,id',
            'model' => 'required|in:lorum,openai,gemini',
            'tone' => 'required|string',
            'content_length' => 'required|string',
            // Individual overrides can be handled if passed, but for bulk usually global settings apply
            // If pages were created via bulkCreate, they might lack keywords.
            // The prompt implies "Action: Auto-generate content for each (Queue)".
            // We need keywords. If they aren't stored on the page, we can't generate.
            // Let's assume the user passes a map or we rely on existing metadata?
            // "Input: List of keywords/titles".
            // If the user used bulkCreate, they have titles.
            // We can derive keyword from title if missing.
        ]);

        $dispatched = 0;

        foreach ($validated['page_ids'] as $pageId) {
            $page = Page::find($pageId);
            
            // Try to find keyword from existing SEO meta or fallback to title
            $keyword = $page->seo?->meta_keywords ?? $page->title;
            
            // We need industry too. 
            // In a real app, we might check attached Industry model.
            // For now, we'll use a default or empty if not found.
            $industry = 'General'; 
            if ($page->industries()->exists()) {
                $industry = $page->industries->first()->name;
            }

            $params = [
                'page_id' => $page->id,
                'primary_keyword' => $keyword,
                'target_industry' => $industry,
                'tone' => $validated['tone'],
                'content_length' => $validated['content_length'],
                'model' => $validated['model'],
            ];

            GeneratePageContent::dispatch($page->id, $params);
            $dispatched++;
        }

        return response()->json(['message' => "Queued {$dispatched} pages for generation"]);
    }

    public function validateSlug(Request $request)
    {
        $validated = $request->validate([
            'slug' => 'required|string',
            'page_id' => 'sometimes|nullable|integer',
        ]);

        $query = Page::query()->where('slug', $validated['slug']);
        if (!empty($validated['page_id'])) {
            $query->where('id', '!=', $validated['page_id']);
        }

        return response()->json([
            'available' => !$query->exists(),
        ]);
    }

    public function duplicate(int $id)
    {
        $page = Page::with(['sections.blocks', 'seo'])->findOrFail($id);

        $copy = DB::transaction(function () use ($page) {
            $newTitle = 'Copy of ' . $page->title;
            $baseSlug = Str::slug($newTitle);
            $slug = $this->uniqueSlug($baseSlug);

            $copy = Page::create([
                'title' => $newTitle,
                'slug' => $slug,
                'type' => $page->type,
                'status' => 'draft',
                'template' => $page->template,
            ]);

            if ($page->seo) {
                SeoMeta::create([
                    'page_id' => $copy->id,
                    'meta_title' => $page->seo->meta_title,
                    'meta_description' => $page->seo->meta_description,
                    'meta_keywords' => $page->seo->meta_keywords,
                    'canonical_url' => null,
                    'schema_json' => $page->seo->schema_json,
                ]);
            }

            foreach ($page->sections as $section) {
                $newSection = PageSection::create([
                    'page_id' => $copy->id,
                    'section_key' => $section->section_key,
                    'order' => $section->order,
                ]);

                foreach ($section->blocks as $block) {
                    ContentBlock::create([
                        'section_id' => $newSection->id,
                        'block_type' => $block->block_type,
                        'content_json' => $block->content_json,
                        'order' => $block->order,
                    ]);
                }
            }

            return $copy;
        });

        return response()->json($copy->load(['seo'])->loadCount('sections'), 201);
    }

    public function generateContent(Request $request)
    {
        $validated = $request->validate([
            'page_id' => 'required|exists:pages,id',
            'primary_keyword' => 'required|string',
            'target_industry' => 'required|string',
            'tone' => 'required|string',
            'content_length' => 'required|string',
            'model' => 'required|in:lorum,openai,gemini',
            'confirm_overwrite' => 'sometimes|boolean',
        ]);

        $page = Page::findOrFail($validated['page_id']);

        try {
            $page->loadCount('sections');

            $hasExistingContent = ($page->sections_count ?? 0) > 0 || $page->seo()->exists();
            $confirmed = (bool)($validated['confirm_overwrite'] ?? false);

            if ($hasExistingContent && !$confirmed) {
                return response()->json([
                    'message' => 'Overwrite confirmation required',
                    'code' => 'CONFIRM_OVERWRITE_REQUIRED',
                ], 409);
            }

            $aiService = $this->aiManager->createService($validated['model']);

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

            $page->load(['sections.blocks', 'seo']);

            return response()->json([
                'message' => 'Content generated successfully',
                'data' => $page,
                'raw_ai_response' => $generatedContent
            ]);

        } catch (ValidationException $e) {
            AiGenerationLog::create([
                'page_id' => $page->id,
                'model_used' => $validated['model'] ?? 'unknown',
                'prompt_used' => "Keyword: " . ($validated['primary_keyword'] ?? ''),
                'response_status' => 'invalid_json',
            ]);

            return response()->json([
                'message' => 'AI response failed validation',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('AI Generation Failed: ' . $e->getMessage());
            
            AiGenerationLog::create([
                'page_id' => $page->id,
                'model_used' => $validated['model'],
                'prompt_used' => "Keyword: {$validated['primary_keyword']}",
                'response_status' => 'failed',
            ]);

            return response()->json(['message' => 'AI Generation Failed', 'error' => $e->getMessage()], 500);
        }
    }
    
    public function show($id)
    {
        $page = Page::with(['sections.blocks', 'seo', 'services', 'solutions', 'integrations', 'industries', 'useCases', 'blogCategories', 'blogTags', 'ctas'])->findOrFail($id);
        return response()->json($page);
    }

    public function checkKeyword(Request $request)
    {
        $validated = $request->validate([
            'keyword' => 'required|string|min:3',
            'page_id' => 'nullable|integer',
        ]);

        $keyword = $validated['keyword'];
        $excludeId = $validated['page_id'] ?? null;

        // Check SeoMeta
        $query = SeoMeta::where('meta_keywords', 'like', "%{$keyword}%")
            ->whereHas('page', function ($q) {
                $q->where('status', 'published'); // Only care about published pages for cannibalization
            });

        if ($excludeId) {
            $query->where('page_id', '!=', $excludeId);
        }

        $conflicts = $query->with('page:id,title,slug')->get();

        return response()->json([
            'cannibalization_detected' => $conflicts->isNotEmpty(),
            'conflicts' => $conflicts->map(function ($meta) {
                return [
                    'page_id' => $meta->page_id,
                    'title' => $meta->page->title,
                    'slug' => $meta->page->slug,
                    'keyword_match' => $meta->meta_keywords
                ];
            })
        ]);
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

    private function uniqueSlug(string $baseSlug): string
    {
        $slug = $baseSlug;
        $i = 2;

        while (Page::query()->where('slug', $slug)->exists()) {
            $slug = $baseSlug . '-' . $i;
            $i++;
        }

        return $slug;
    }

    private function findMissingAltForPage(int $pageId): array
    {
        $blocks = ContentBlock::query()
            ->where('block_type', 'image')
            ->whereHas('section', function ($q) use ($pageId) {
                $q->where('page_id', $pageId);
            })
            ->get();

        $mediaIds = [];
        foreach ($blocks as $block) {
            $content = $block->content_json;
            if (is_array($content) && !empty($content['media_id'])) {
                $mediaIds[] = (int)$content['media_id'];
            }
        }
        $mediaIds = array_values(array_unique(array_filter($mediaIds)));

        $mediaAlt = [];
        if (count($mediaIds) > 0) {
            $mediaAlt = MediaAsset::query()
                ->whereIn('id', $mediaIds)
                ->pluck('alt_text', 'id')
                ->all();
        }

        $missing = [];

        foreach ($blocks as $block) {
            $content = $block->content_json;
            if (!is_array($content)) {
                continue;
            }

            $alt = trim((string)($content['alt'] ?? ''));
            $src = trim((string)($content['src'] ?? ''));
            $mediaId = $content['media_id'] ?? null;

            if ($alt !== '') {
                continue;
            }

            if ($mediaId) {
                $mAlt = trim((string)($mediaAlt[(int)$mediaId] ?? ''));
                if ($mAlt === '') {
                    $missing[] = ['block_id' => $block->id, 'media_id' => (int)$mediaId];
                }
                continue;
            }

            if ($src !== '') {
                $missing[] = ['block_id' => $block->id];
            }
        }

        return $missing;
    }

    private function syncRelationships(Page $page, Request $request): void
    {
        if ($request->has('services')) {
            $page->services()->sync($request->input('services'));
        }
        if ($request->has('solutions')) {
            $page->solutions()->sync($request->input('solutions'));
        }
        if ($request->has('integrations')) {
            $page->integrations()->sync($request->input('integrations'));
        }
        if ($request->has('industries')) {
            $page->industries()->sync($request->input('industries'));
        }
        if ($request->has('use_cases')) {
            $page->useCases()->sync($request->input('use_cases'));
        }
        if ($request->has('blog_categories')) {
            $page->blogCategories()->sync($request->input('blog_categories'));
        }
        if ($request->has('blog_tags')) {
            $page->blogTags()->sync($request->input('blog_tags'));
        }
        if ($request->has('ctas')) {
            $page->ctas()->sync($request->input('ctas'));
        }
    }

    private function syncSections(Page $page, array $sectionsData): void
    {
        $existingSectionIds = $page->sections()->pluck('id')->toArray();
        $updatedSectionIds = [];

        foreach ($sectionsData as $sectionData) {
            $section = null;
            
            if (isset($sectionData['id']) && in_array($sectionData['id'], $existingSectionIds)) {
                $section = PageSection::find($sectionData['id']);
                $section->update([
                    'section_key' => $sectionData['section_key'],
                    'order' => $sectionData['order'] ?? 0,
                ]);
                $updatedSectionIds[] = $section->id;
            } else {
                $section = $page->sections()->create([
                    'section_key' => $sectionData['section_key'],
                    'order' => $sectionData['order'] ?? 0,
                ]);
                $updatedSectionIds[] = $section->id;
            }

            if (isset($sectionData['blocks'])) {
                $this->syncBlocks($section, $sectionData['blocks']);
            }
        }

        $sectionsToDelete = array_diff($existingSectionIds, $updatedSectionIds);
        PageSection::destroy($sectionsToDelete);
    }

    private function syncBlocks(PageSection $section, array $blocksData): void
    {
        $existingBlockIds = $section->blocks()->pluck('id')->toArray();
        $updatedBlockIds = [];

        foreach ($blocksData as $blockData) {
            if (isset($blockData['id']) && in_array($blockData['id'], $existingBlockIds)) {
                $block = ContentBlock::find($blockData['id']);
                $block->update([
                    'block_type' => $blockData['block_type'] ?? $block->block_type,
                    'content_json' => $blockData['content_json'] ?? $block->content_json,
                    'order' => $blockData['order'] ?? 0,
                ]);
                $updatedBlockIds[] = $block->id;
            } else {
                $block = $section->blocks()->create([
                    'block_type' => $blockData['block_type'],
                    'content_json' => $blockData['content_json'],
                    'order' => $blockData['order'] ?? 0,
                ]);
                $updatedBlockIds[] = $block->id;
            }
        }

        $blocksToDelete = array_diff($existingBlockIds, $updatedBlockIds);
        ContentBlock::destroy($blocksToDelete);
    }
}
