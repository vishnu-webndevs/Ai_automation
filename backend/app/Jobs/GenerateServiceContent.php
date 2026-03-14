<?php

namespace App\Jobs;

use App\Models\AiGenerationLog;
use App\Models\Service;
use App\Services\AI\AIManager;
use App\Services\AI\AiPromptService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class GenerateServiceContent implements ShouldQueue
{
    use Queueable;

    protected int $serviceId;
    protected array $parameters;

    public function __construct(int $serviceId, array $parameters)
    {
        $this->serviceId = $serviceId;
        $this->parameters = $parameters;
    }

    public function handle(AIManager $aiManager, AiPromptService $promptService): void
    {
        $service = Service::with(['category', 'features'])->find($this->serviceId);

        if (!$service) {
            Log::error("GenerateServiceContent: Service {$this->serviceId} not found.");
            return;
        }

        $validated = $this->parameters;
        $model = $validated['model'] ?? 'lorum';
        $tone = $validated['tone'] ?? 'professional';
        $contentLength = $validated['content_length'] ?? 'long';
        $confirmOverwrite = (bool)($validated['confirm_overwrite'] ?? false);

        $hasExisting = !empty($service->content_json) || !empty($service->short_description) || !empty($service->full_description);
        if ($hasExisting && !$confirmOverwrite) {
            AiGenerationLog::create([
                'service_id' => $service->id,
                'model_used' => $model,
                'prompt_used' => "Service: {$service->name}",
                'response_status' => 'confirm_overwrite_required',
            ]);
            return;
        }

        $industry = $validated['target_industry'] ?? 'General';
        $automationType = $validated['automation_type'] ?? 'automation';
        $targetProblem = $validated['target_problem'] ?? 'manual workflows and operational bottlenecks';
        $toolStack = $validated['tool_stack'] ?? ['OpenAI', 'LangChain', 'Python', 'Node.js', 'Zapier', 'REST APIs'];

        try {
            $aiService = $aiManager->createService($model);
            $baseSeed = $validated['uniqueness_seed'] ?? $service->slug;
            $normalized = null;
            $fingerprint = null;

            $existingFingerprints = $this->loadExistingFingerprints($service->id);
            $promptTemplate = $promptService->getActivePromptText('service_page');

            for ($attempt = 1; $attempt <= 2; $attempt++) {
                $seed = $attempt === 1 ? $baseSeed : "{$baseSeed}-{$attempt}";
                $vars = [
                    'service_name' => (string)$service->name,
                    'industry' => (string)$industry,
                    'automation_type' => (string)$automationType,
                    'target_problem' => (string)$targetProblem,
                    'tool_stack' => is_array($toolStack) ? implode(', ', array_map('strval', $toolStack)) : (string)$toolStack,
                    'uniqueness_seed' => (string)$seed,
                    'service_slug' => (string)$service->slug,
                ];

                $promptOverride = null;
                if (is_string($promptTemplate) && trim($promptTemplate) !== '') {
                    $promptOverride = $promptService->render($promptTemplate, $vars);
                }

                $context = [
                    'output_schema' => 'service',
                    'service_name' => $service->name,
                    'service_slug' => $service->slug,
                    'primary_keyword' => $validated['primary_keyword'] ?? $service->name,
                    'target_industry' => $industry,
                    'tone' => $tone,
                    'content_length' => $contentLength,
                    'automation_type' => $automationType,
                    'target_problem' => $targetProblem,
                    'tool_stack' => $toolStack,
                    'uniqueness_seed' => $seed,
                ];
                if ($promptOverride) {
                    $context['prompt_override'] = $promptOverride;
                }

                $generatedContent = $aiService->generatePageContent($context);
                if (!is_array($generatedContent)) {
                    throw new \RuntimeException('AI response is not an array');
                }

                $candidate = $this->normalizeAiResponse($generatedContent, $service->name);
                $this->validateAiResponse($candidate);

                $candidateFingerprint = $this->fingerprint($candidate);
                $candidate['uniqueness']['seed'] = (string)$context['uniqueness_seed'];
                $candidate['uniqueness']['fingerprint'] = $candidateFingerprint;

                if (!isset($existingFingerprints[$candidateFingerprint])) {
                    $normalized = $candidate;
                    $fingerprint = $candidateFingerprint;
                    break;
                }
            }

            if (!$normalized || !$fingerprint) {
                throw new \RuntimeException('Duplicate content fingerprint detected after retries');
            }

            DB::transaction(function () use ($service, $normalized) {
                $service->content_json = $normalized;
                $service->short_description = $normalized['hero']['short_description'] ?? $service->short_description;
                $service->full_description = $this->toHtml($normalized['intro']['body'] ?? '');
                $service->save();

                $generatedFeatures = $normalized['features'] ?? [];
                if (is_array($generatedFeatures) && count($generatedFeatures) > 0) {
                    $service->features()->delete();
                    foreach ($generatedFeatures as $idx => $feature) {
                        $title = is_array($feature) ? (string)($feature['title'] ?? '') : '';
                        $title = trim($title);
                        if ($title === '') {
                            $title = 'Feature ' . ($idx + 1);
                        }
                        $service->features()->create([
                            'title' => $title,
                            'description' => is_array($feature) ? ($feature['description'] ?? null) : null,
                            'icon' => is_array($feature) ? ($feature['icon'] ?? null) : null,
                            'sort_order' => $idx,
                        ]);
                    }
                }
            });

            AiGenerationLog::create([
                'service_id' => $service->id,
                'model_used' => $model,
                'prompt_used' => "Service: {$service->name}, Industry: {$industry}",
                'tokens_used' => 0,
                'response_status' => 'success',
            ]);
        } catch (ValidationException $e) {
            AiGenerationLog::create([
                'service_id' => $service->id,
                'model_used' => $model,
                'prompt_used' => "Service: {$service->name}",
                'response_status' => 'invalid_json',
            ]);
            Log::error("GenerateServiceContent Validation Error: " . json_encode($e->errors()));
        } catch (\Exception $e) {
            AiGenerationLog::create([
                'service_id' => $service->id,
                'model_used' => $model,
                'prompt_used' => "Service: {$service->name}",
                'response_status' => 'failed',
            ]);
            Log::error('GenerateServiceContent Failed: ' . $e->getMessage());
        }
    }

    private function normalizeAiResponse(array $data, string $serviceName): array
    {
        $normalized = $data;
        $normalized['service_name'] = $normalized['service_name'] ?? $serviceName;
        $normalized['hero'] = is_array($normalized['hero'] ?? null) ? $normalized['hero'] : [];
        $normalized['intro'] = is_array($normalized['intro'] ?? null) ? $normalized['intro'] : [];
        $normalized['problems'] = is_array($normalized['problems'] ?? null) ? $normalized['problems'] : [];
        $normalized['solution_bullets'] = is_array($normalized['solution_bullets'] ?? null) ? $normalized['solution_bullets'] : [];
        $normalized['features'] = is_array($normalized['features'] ?? null) ? $normalized['features'] : [];
        $normalized['benefits'] = is_array($normalized['benefits'] ?? null) ? $normalized['benefits'] : [];
        $normalized['use_cases'] = is_array($normalized['use_cases'] ?? null) ? $normalized['use_cases'] : [];
        $normalized['process_steps'] = is_array($normalized['process_steps'] ?? null) ? $normalized['process_steps'] : [];
        $normalized['tech_stack'] = is_array($normalized['tech_stack'] ?? null) ? $normalized['tech_stack'] : [];
        $normalized['industry_applications'] = is_array($normalized['industry_applications'] ?? null) ? $normalized['industry_applications'] : [];
        $normalized['comparison'] = is_array($normalized['comparison'] ?? null) ? $normalized['comparison'] : [];
        $normalized['roi'] = is_array($normalized['roi'] ?? null) ? $normalized['roi'] : [];
        $normalized['related_services'] = is_array($normalized['related_services'] ?? null) ? $normalized['related_services'] : [];
        $normalized['faqs'] = is_array($normalized['faqs'] ?? null) ? $normalized['faqs'] : [];
        $normalized['seo_expanders'] = is_array($normalized['seo_expanders'] ?? null) ? $normalized['seo_expanders'] : [];
        $normalized['seo'] = is_array($normalized['seo'] ?? null) ? $normalized['seo'] : [];
        $normalized['location'] = is_array($normalized['location'] ?? null) ? $normalized['location'] : ['enabled' => false];
        $normalized['uniqueness'] = is_array($normalized['uniqueness'] ?? null) ? $normalized['uniqueness'] : [];

        return $normalized;
    }

    private function loadExistingFingerprints(int $excludeServiceId): array
    {
        $fingerprints = [];
        $services = Service::query()
            ->whereNotNull('content_json')
            ->where('id', '!=', $excludeServiceId)
            ->get(['id', 'content_json']);

        foreach ($services as $service) {
            $content = is_array($service->content_json) ? $service->content_json : null;
            if (!$content) continue;
            $fp = $content['uniqueness']['fingerprint'] ?? null;
            if (is_string($fp) && $fp !== '') {
                $fingerprints[$fp] = true;
            }
        }

        return $fingerprints;
    }

    private function fingerprint(array $data): string
    {
        $text = $this->extractPlainText($data);
        $normalized = mb_strtolower(trim(preg_replace('/\s+/', ' ', $text)));
        return sha1($normalized);
    }

    private function extractPlainText(array $data): string
    {
        $chunks = [];

        $push = function ($value) use (&$chunks) {
            if (is_string($value)) {
                $chunks[] = $value;
                return;
            }
            if (is_numeric($value)) {
                $chunks[] = (string)$value;
                return;
            }
        };

        $push($data['service_name'] ?? '');
        $push($data['meta_title'] ?? '');
        $push($data['meta_description'] ?? '');

        foreach (['hero', 'intro', 'comparison', 'roi', 'seo', 'location', 'uniqueness'] as $key) {
            if (!is_array($data[$key] ?? null)) continue;
            $this->walkStrings($data[$key], $push);
        }

        foreach (['problems', 'solution_bullets', 'features', 'benefits', 'use_cases', 'process_steps', 'industry_applications', 'related_services', 'faqs', 'seo_expanders'] as $listKey) {
            if (!is_array($data[$listKey] ?? null)) continue;
            $this->walkStrings($data[$listKey], $push);
        }

        if (is_array($data['tech_stack'] ?? null)) {
            foreach ($data['tech_stack'] as $item) {
                $push($item);
            }
        }

        return implode(' ', $chunks);
    }

    private function walkStrings(array $value, callable $push): void
    {
        foreach ($value as $v) {
            if (is_array($v)) {
                $this->walkStrings($v, $push);
                continue;
            }
            $push($v);
        }
    }

    private function validateAiResponse(array $data): void
    {
        $validator = Validator::make($data, [
            'service_name' => 'required|string',
            'meta_title' => 'required|string',
            'meta_description' => 'required|string',
            'hero' => 'required|array',
            'hero.headline' => 'required|string',
            'hero.subheadline' => 'required|string',
            'hero.short_description' => 'required|string',
            'hero.trust_text' => 'required|string',
            'hero.primary_cta_label' => 'required|string',
            'hero.secondary_cta_label' => 'required|string',
            'intro' => 'required|array',
            'intro.body' => 'required|string',
            'intro.key_outcomes' => 'required|array|min:3',
            'problems' => 'required|array|min:4',
            'problems.*.title' => 'required|string',
            'problems.*.summary' => 'required|string',
            'solution_bullets' => 'required|array|min:4',
            'solution_bullets.*.title' => 'required|string',
            'solution_bullets.*.text' => 'required|string',
            'features' => 'required|array|min:6',
            'features.*.title' => 'required|string',
            'features.*.description' => 'required|string',
            'benefits' => 'required|array|min:6',
            'benefits.*.title' => 'required|string',
            'benefits.*.description' => 'required|string',
            'use_cases' => 'required|array|min:4',
            'use_cases.*.title' => 'required|string',
            'use_cases.*.industry' => 'required|string',
            'use_cases.*.summary' => 'required|string',
            'process_steps' => 'required|array|min:5',
            'process_steps.*.title' => 'required|string',
            'process_steps.*.description' => 'required|string',
            'tech_stack' => 'required|array|min:6',
            'industry_applications' => 'required|array|min:4',
            'industry_applications.*.title' => 'required|string',
            'industry_applications.*.body' => 'required|string',
            'comparison' => 'required|array',
            'comparison.left_label' => 'required|string',
            'comparison.right_label' => 'required|string',
            'comparison.rows' => 'required|array|min:4',
            'comparison.rows.*.topic' => 'required|string',
            'comparison.rows.*.left' => 'required|string',
            'comparison.rows.*.right' => 'required|string',
            'roi' => 'required|array',
            'roi.highlights' => 'required|array|min:3',
            'roi.highlights.*.title' => 'required|string',
            'roi.highlights.*.value' => 'required|string',
            'roi.highlights.*.note' => 'required|string',
            'related_services' => 'required|array|min:3',
            'related_services.*.title' => 'required|string',
            'related_services.*.href' => 'required|string',
            'related_services.*.summary' => 'required|string',
            'faqs' => 'required|array|min:6',
            'faqs.*.question' => 'required|string',
            'faqs.*.short_answer' => 'required|string',
            'faqs.*.expanded_answer' => 'required|string',
            'seo_expanders' => 'required|array|min:2',
            'seo_expanders.*.title' => 'required|string',
            'seo_expanders.*.body' => 'required|string',
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }
    }

    private function toHtml(string $text): string
    {
        $trimmed = trim($text);
        if ($trimmed === '') return '';

        $parts = preg_split("/\r\n|\n|\r/", $trimmed);
        $paragraphs = [];
        foreach ($parts as $part) {
            $line = trim($part);
            if ($line === '') continue;
            $paragraphs[] = '<p>' . e($line) . '</p>';
        }

        return implode("\n", $paragraphs);
    }
}
    
