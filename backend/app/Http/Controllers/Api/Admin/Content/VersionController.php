<?php

namespace App\Http\Controllers\Api\Admin\Content;

use App\Http\Controllers\Controller;
use App\Models\ContentVersion;
use App\Models\Page;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class VersionController extends Controller
{
    public function index($id)
    {
        // Get versions for a specific page
        $versions = ContentVersion::where('page_id', $id)
            ->orderBy('version_number', 'desc')
            ->with('creator')
            ->paginate(10);

        return response()->json($versions);
    }

    public function store(Request $request, $id)
    {
        // Manually create a snapshot for a page
        $page = Page::findOrFail($id);
        
        // Get latest version number
        $latestVersion = ContentVersion::where('page_id', $id)->max('version_number') ?? 0;

        // Snapshot sections and blocks instead of direct contentBlocks
        $snapshot = $page->load(['sections.blocks', 'seo', 'services', 'industries', 'useCases', 'blogCategories', 'blogTags', 'ctas', 'keywords'])->toArray();

        $version = ContentVersion::create([
            'page_id' => $page->id,
            'version_number' => $latestVersion + 1,
            'snapshot_json' => $snapshot,
            'created_by' => $request->user()->id ?? null, // Assuming Sanctum auth
        ]);

        return response()->json($version, 201);
    }

    public function restore($id)
    {
        $version = ContentVersion::findOrFail($id);
        $page = Page::findOrFail($version->page_id);
        $snapshot = $version->snapshot_json;

        DB::beginTransaction();
        try {
            // Restore basic page attributes
            // Filter out timestamps and id
            $attributes = collect($snapshot)->except(['id', 'created_at', 'updated_at', 'sections', 'seo', 'services', 'industries', 'use_cases', 'blog_categories', 'blog_tags', 'ctas', 'keywords'])->toArray();
            
            $page->update($attributes);

            // Restore Sections and Blocks
            if (isset($snapshot['sections'])) {
                // Delete existing sections (and their blocks via cascade if configured, or manually)
                // Assuming DB cascade or we manually delete blocks if needed. 
                // Safest to delete sections.
                $page->sections()->each(function ($section) {
                    $section->blocks()->delete();
                    $section->delete();
                });

                foreach ($snapshot['sections'] as $sectionData) {
                    $section = $page->sections()->create(
                        collect($sectionData)->except(['id', 'page_id', 'created_at', 'updated_at', 'blocks'])->toArray()
                    );

                    if (isset($sectionData['blocks'])) {
                        $blocks = array_map(function ($block) {
                            return collect($block)->except(['id', 'section_id', 'created_at', 'updated_at'])->toArray();
                        }, $sectionData['blocks']);
                        $section->blocks()->createMany($blocks);
                    }
                }
            }

            // Restore SEO Meta
            if (isset($snapshot['seo'])) {
                $seoData = collect($snapshot['seo'])->except(['id', 'page_id', 'created_at', 'updated_at'])->toArray();
                $page->seo()->updateOrCreate([], $seoData);
            }
            
            // Restore Relationships (Sync)
            // Note: This assumes simple IDs are enough, but if snapshot contains full objects we need to map to IDs.
            // Eloquent `load` returns objects. We need to extract IDs.
            
            $this->syncRelation($page, 'services', $snapshot['services'] ?? []);
            $this->syncRelation($page, 'industries', $snapshot['industries'] ?? []);
            $this->syncRelation($page, 'useCases', $snapshot['use_cases'] ?? []);
            $this->syncRelation($page, 'blogCategories', $snapshot['blog_categories'] ?? []);
            $this->syncRelation($page, 'blogTags', $snapshot['blog_tags'] ?? []);
            $this->syncRelation($page, 'ctas', $snapshot['ctas'] ?? []);
            // keywords relation uses HasMany, so sync won't work directly if it's not BelongsToMany.
            // Page model says: public function keywords() { return $this->hasMany(KeywordMap::class); }
            // So we need to delete and recreate.
            if (isset($snapshot['keywords'])) {
                 $page->keywords()->delete();
                 $page->keywords()->createMany(
                     array_map(function ($k) {
                         return collect($k)->except(['id', 'page_id', 'created_at', 'updated_at'])->toArray();
                     }, $snapshot['keywords'])
                 );
            }
            
            // Log the restoration (could trigger AuditLog)

            DB::commit();
            return response()->json(['message' => 'Page restored successfully to version ' . $version->version_number]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Restore failed: ' . $e->getMessage()], 500);
        }
    }
    
    private function syncRelation($page, $relationName, $data)
    {
        if (empty($data)) {
            $page->{$relationName}()->sync([]);
            return;
        }
        
        // Extract IDs
        $ids = array_column($data, 'id');
        $page->{$relationName}()->sync($ids);
    }
}
