<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Page;
use App\Models\Industry;
use App\Models\Service;
use App\Models\UseCase;
use App\Models\BlogCategory;
use Illuminate\Support\Facades\DB;

class SearchController extends Controller
{
    public function globalSearch(Request $request)
    {
        $query = $request->input('q');

        if (strlen($query) < 2) {
            return response()->json([]);
        }

        $results = [];

        // Search Pages
        $pages = Page::where('title', 'like', "%{$query}%")
            ->orWhere('slug', 'like', "%{$query}%")
            ->limit(5)
            ->get(['id', 'title', 'slug', 'type', 'status']);

        foreach ($pages as $page) {
            $results[] = [
                'id' => $page->id,
                'title' => $page->title,
                'description' => "Page ({$page->type}) - " . ucfirst($page->status),
                'type' => 'Page',
                'url' => "/web-admin/pages", // Updated to Admin route
                'group' => 'Pages'
            ];
        }

        // Search Industries
        $industries = Industry::where('name', 'like', "%{$query}%")
            ->limit(3)
            ->get(['id', 'name', 'slug']);

        foreach ($industries as $industry) {
            $results[] = [
                'id' => $industry->id,
                'title' => $industry->name,
                'description' => 'Industry Vertical',
                'type' => 'Industry',
                'url' => "/web-admin/taxonomy/industries",
                'group' => 'Taxonomy'
            ];
        }

        // Search Services
        $services = Service::where('name', 'like', "%{$query}%")
            ->limit(3)
            ->get(['id', 'name', 'slug']);

        foreach ($services as $service) {
            $results[] = [
                'id' => $service->id,
                'title' => $service->name,
                'description' => 'Service',
                'type' => 'Service',
                'url' => "/web-admin/taxonomy/services",
                'group' => 'Taxonomy'
            ];
        }

        // Search Use Cases
        $useCases = UseCase::where('name', 'like', "%{$query}%")
            ->limit(3)
            ->get(['id', 'name', 'slug']);

        foreach ($useCases as $useCase) {
            $results[] = [
                'id' => $useCase->id,
                'title' => $useCase->name,
                'description' => 'Use Case',
                'type' => 'UseCase',
                'url' => "/web-admin/taxonomy/use-cases",
                'group' => 'Taxonomy'
            ];
        }

         // Search Blog Categories
         $blogCategories = BlogCategory::where('name', 'like', "%{$query}%")
         ->limit(3)
         ->get(['id', 'name', 'slug']);

        foreach ($blogCategories as $category) {
            $results[] = [
                'id' => $category->id,
                'title' => $category->name,
                'description' => 'Blog Category',
                'type' => 'BlogCategory',
                'url' => "/web-admin/blog/categories",
                'group' => 'Blog'
            ];
        }

        return response()->json($results);
    }
}
