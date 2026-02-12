<?php

namespace App\Http\Controllers\Api\Admin\Seo;

use App\Http\Controllers\Controller;
use App\Models\InternalLink;
use App\Models\Page;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InternalLinkController extends Controller
{
    public function index(Request $request)
    {
        $query = InternalLink::with(['sourcePage:id,title,slug', 'targetPage:id,title,slug']);

        if ($request->has('source_page_id')) {
            $query->where('source_page_id', $request->source_page_id);
        }

        return response()->json($query->paginate(20));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'source_page_id' => 'required|exists:pages,id|different:target_page_id',
            'target_page_id' => 'required|exists:pages,id',
            'anchor_text' => 'required|string|max:255',
            'auto_generated' => 'boolean',
        ]);

        // Check for duplicates
        $exists = InternalLink::where('source_page_id', $validated['source_page_id'])
            ->where('target_page_id', $validated['target_page_id'])
            ->where('anchor_text', $validated['anchor_text'])
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Internal link already exists'], 409);
        }

        $link = InternalLink::create($validated);

        return response()->json($link, 201);
    }

    public function show($id)
    {
        $link = InternalLink::with(['sourcePage', 'targetPage'])->findOrFail($id);
        return response()->json($link);
    }

    public function update(Request $request, $id)
    {
        $link = InternalLink::findOrFail($id);

        $validated = $request->validate([
            'source_page_id' => 'sometimes|required|exists:pages,id|different:target_page_id',
            'target_page_id' => 'sometimes|required|exists:pages,id',
            'anchor_text' => 'sometimes|required|string|max:255',
            'auto_generated' => 'boolean',
        ]);

        $link->update($validated);

        return response()->json($link);
    }

    public function destroy($id)
    {
        $link = InternalLink::findOrFail($id);
        $link->delete();

        return response()->json(null, 204);
    }

    public function suggest(Request $request)
    {
        $sourcePageId = $request->input('source_page_id');
        $sourcePage = Page::with(['sections.blocks', 'seo'])->findOrFail($sourcePageId);
        
        // Flatten source content for searching
        $sourceContent = $sourcePage->title . ' ';
        if ($sourcePage->seo) {
            $sourceContent .= $sourcePage->seo->meta_description . ' ';
        }
        foreach ($sourcePage->sections as $section) {
            foreach ($section->blocks as $block) {
                $contentJson = $block->content_json;
                if (is_array($contentJson)) {
                    // Naive extraction from JSON
                    array_walk_recursive($contentJson, function ($item) use (&$sourceContent) {
                        if (is_string($item)) {
                            $sourceContent .= $item . ' ';
                        }
                    });
                }
            }
        }
        $sourceContent = strtolower($sourceContent);

        // Find potential targets - pages that are NOT the source page
        $potentialTargets = Page::where('id', '!=', $sourcePageId)
            ->where('status', 'published') 
            ->with('seo')
            ->get();
            
        $suggestions = [];
        
        foreach ($potentialTargets as $target) {
            // Check for title match
            $targetTitle = strtolower($target->title);
            $relevance = 0;
            $anchor = '';

            if (str_contains($sourceContent, $targetTitle)) {
                $relevance += 50;
                $anchor = $target->title;
            }

            // Check for keyword match
            if ($target->seo && $target->seo->meta_keywords) {
                $keywords = explode(',', $target->seo->meta_keywords);
                foreach ($keywords as $keyword) {
                    $keyword = trim(strtolower($keyword));
                    if (!empty($keyword) && str_contains($sourceContent, $keyword)) {
                        $relevance += 30;
                        if (empty($anchor)) $anchor = $keyword;
                    }
                }
            }

            if ($relevance > 0) {
                $suggestions[] = [
                    'target_page_id' => $target->id,
                    'target_page_title' => $target->title,
                    'suggested_anchor_text' => $anchor,
                    'relevance_score' => $relevance
                ];
            }
        }

        // Sort by relevance
        usort($suggestions, function ($a, $b) {
            return $b['relevance_score'] <=> $a['relevance_score'];
        });

        return response()->json(array_slice($suggestions, 0, 20));
    }

    public function orphans(Request $request)
    {
        // Orphan pages are published pages that have NO incoming internal links
        $orphans = Page::where('status', 'published')
            ->whereDoesntHave('internalLinksTo')
            ->with(['seo'])
            ->paginate(20);

        return response()->json($orphans);
    }
}
