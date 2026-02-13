<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Page;
use App\Models\PageTemplate;
use App\Models\PageSection;
use App\Models\ContentBlock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PageTemplateController extends Controller
{
    public function index()
    {
        return response()->json(PageTemplate::all());
    }

    public function apply(Request $request, $id)
    {
        $request->validate([
            'template_id' => 'required|exists:page_templates,id',
        ]);

        $page = Page::findOrFail($id);
        $template = PageTemplate::findOrFail($request->template_id);

        DB::transaction(function () use ($page, $template) {
            // 1. Update Page Template
            $page->update(['template_slug' => $template->slug]);

            // 2. Clear existing sections
            $page->sections()->delete(); 
            // Note: Cascade delete should handle blocks if configured in DB, 
            // but if not, we might need to delete blocks explicitly. 
            // Assuming standard migration setup where blocks cascade on section delete or we handle it manually.
            // Safe approach:
            foreach ($page->sections as $section) {
                $section->blocks()->delete();
                $section->delete();
            }

            // 3. Create new sections from config
            if (isset($template->config_json['sections'])) {
                foreach ($template->config_json['sections'] as $sectionConfig) {
                    $section = PageSection::create([
                        'page_id' => $page->id,
                        'section_key' => $sectionConfig['type'], // Using 'type' as 'section_key'
                        'order' => $sectionConfig['order'] ?? 0,
                    ]);

                    // Create a default block for this section containing the content
                    if (isset($sectionConfig['content'])) {
                        ContentBlock::create([
                            'section_id' => $section->id,
                            'block_type' => $sectionConfig['type'] ?? 'text', // Use section type as block type
                            'content_json' => $sectionConfig['content'],
                            'order' => 0,
                        ]);
                    }
                }
            }
        });

        return response()->json(['message' => 'Template applied successfully', 'page' => $page->load('sections.blocks')]);
    }
}
