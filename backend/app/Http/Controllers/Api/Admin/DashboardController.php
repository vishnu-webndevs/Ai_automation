<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AiGenerationLog;
use App\Models\AuditLog;
use App\Models\Page;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats()
    {
        $payload = Cache::remember('admin_dashboard:stats', 60, function () {
            $now = Carbon::now();
            $start7 = $now->copy()->subDays(6)->startOfDay();
            $startPrev7 = $now->copy()->subDays(13)->startOfDay();
            $endPrev7 = $now->copy()->subDays(7)->endOfDay();

            $pagesTotal = Page::count();
            $aiTotal = AiGenerationLog::count();
            $usersTotal = User::count();

            $pagesLast7 = Page::where('created_at', '>=', $start7)->count();
            $pagesPrev7 = Page::whereBetween('created_at', [$startPrev7, $endPrev7])->count();
            $pagesDelta = $this->percentDelta($pagesPrev7, $pagesLast7);

            $aiLast7 = AiGenerationLog::where('created_at', '>=', $start7)->count();
            $aiPrev7 = AiGenerationLog::whereBetween('created_at', [$startPrev7, $endPrev7])->count();
            $aiDelta = $this->percentDelta($aiPrev7, $aiLast7);

            $healthNowStart = $now->copy()->subHours(24);
            $healthPrevStart = $now->copy()->subHours(48);
            $healthPrevEnd = $now->copy()->subHours(24);

            $healthNow = $this->successRate(AiGenerationLog::where('created_at', '>=', $healthNowStart));
            $healthPrev = $this->successRate(AiGenerationLog::whereBetween('created_at', [$healthPrevStart, $healthPrevEnd]));
            $healthDelta = $healthNow - $healthPrev;

            $chart = $this->buildSeries($start7);
            $activity = $this->buildRecentActivity();

            return [
                'stats' => [
                    'pages_total' => $pagesTotal,
                    'pages_delta_percent' => $pagesDelta,
                    'ai_total' => $aiTotal,
                    'ai_delta_percent' => $aiDelta,
                    'health_percent' => $healthNow,
                    'health_delta_percent' => $healthDelta,
                    'users_total' => $usersTotal,
                ],
                'chart' => $chart,
                'recent_activity' => $activity,
            ];
        });

        return response()->json($payload);
    }

    private function percentDelta(int $previous, int $current): float
    {
        if ($previous <= 0) {
            return $current > 0 ? 100.0 : 0.0;
        }

        return round((($current - $previous) / $previous) * 100, 1);
    }

    private function successRate($query): float
    {
        $total = (clone $query)->count();
        if ($total === 0) return 100.0;

        $success = (clone $query)->where('response_status', 'success')->count();
        return round(($success / $total) * 100, 1);
    }

    private function buildSeries(Carbon $start7): array
    {
        $pageRows = Page::query()
            ->select(DB::raw('DATE(created_at) as d'), DB::raw('COUNT(*) as c'))
            ->where('created_at', '>=', $start7)
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('d')
            ->get();

        $aiRows = AiGenerationLog::query()
            ->select(DB::raw('DATE(created_at) as d'), DB::raw('COUNT(*) as c'))
            ->where('created_at', '>=', $start7)
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('d')
            ->get();

        $pageMap = [];
        foreach ($pageRows as $row) {
            $pageMap[(string)$row->d] = (int)$row->c;
        }
        $aiMap = [];
        foreach ($aiRows as $row) {
            $aiMap[(string)$row->d] = (int)$row->c;
        }

        $data = [];
        for ($i = 0; $i < 7; $i++) {
            $day = $start7->copy()->addDays($i);
            $key = $day->toDateString();
            $data[] = [
                'date' => $key,
                'label' => $day->format('D'),
                'pages' => $pageMap[$key] ?? 0,
                'ai' => $aiMap[$key] ?? 0,
            ];
        }

        return [
            'range' => [
                'from' => $start7->toDateString(),
                'to' => Carbon::now()->toDateString(),
            ],
            'data' => $data,
        ];
    }

    private function buildRecentActivity(): array
    {
        $audit = AuditLog::query()
            ->with('admin:id,name')
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->map(function ($row) {
                $entity = $row->entity_type ? class_basename($row->entity_type) : 'Entity';
                $action = $row->action_type ?: 'updated';
                $label = $this->formatAuditLabel($entity, $action, $row->change_summary, (int) $row->entity_id);

                return [
                    'kind' => 'audit',
                    'id' => $row->id,
                    'title' => $label,
                    'actor' => $row->admin?->name ?: 'Admin',
                    'status' => $action,
                    'created_at' => optional($row->created_at)->toIso8601String(),
                ];
            })
            ->all();

        $ai = AiGenerationLog::query()
            ->with(['page:id,title', 'service:id,name'])
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->map(function ($row) {
                $target = $row->page ? $row->page->title : ($row->service ? $row->service->name : 'Content');
                $status = $row->response_status ?: 'unknown';

                return [
                    'kind' => 'ai',
                    'id' => $row->id,
                    'title' => "AI generation: {$target}",
                    'actor' => 'System',
                    'status' => $status,
                    'created_at' => optional($row->created_at)->toIso8601String(),
                ];
            })
            ->all();

        $merged = array_merge($audit, $ai);
        usort($merged, function ($a, $b) {
            return strcmp($b['created_at'] ?? '', $a['created_at'] ?? '');
        });

        return array_slice($merged, 0, 10);
    }

    private function formatAuditLabel(string $entity, string $action, ?string $summary, int $entityId): string
    {
        $fallback = trim((string) $summary);
        if ($fallback !== '' && !str_starts_with($fallback, '{')) {
            return Str::limit($fallback, 90);
        }

        $decoded = null;
        if (is_string($summary) && $summary !== '' && str_starts_with($summary, '{')) {
            $decoded = json_decode($summary, true);
        }

        $before = is_array($decoded) ? ($decoded['before'] ?? []) : [];
        $after = is_array($decoded) ? ($decoded['after'] ?? []) : [];

        $name = $after['title'] ?? $after['name'] ?? $before['title'] ?? $before['name'] ?? null;
        $name = $name ? Str::limit(trim((string) $name), 70) : null;

        if ($action === 'created') {
            return $name ? "Created {$entity} “{$name}”" : "Created {$entity} #{$entityId}";
        }

        if ($action === 'deleted') {
            return $name ? "Deleted {$entity} “{$name}”" : "Deleted {$entity} #{$entityId}";
        }

        if (is_array($before) && is_array($after)) {
            if (isset($before['status'], $after['status']) && $before['status'] !== $after['status'] && $name) {
                $to = Str::ucfirst((string) $after['status']);
                return "{$to} {$entity} “{$name}”";
            }

            if (isset($before['is_active'], $after['is_active']) && $before['is_active'] !== $after['is_active'] && $name) {
                return ((bool) $after['is_active'] ? 'Activated' : 'Deactivated') . " {$entity} “{$name}”";
            }
        }

        return $name ? "Updated {$entity} “{$name}”" : "Updated {$entity} #{$entityId}";
    }
}
