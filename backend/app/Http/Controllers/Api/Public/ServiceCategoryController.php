<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\ServiceCategory;

class ServiceCategoryController extends Controller
{
    public function index()
    {
        return ServiceCategory::query()
            ->where('is_active', true)
            ->withCount(['services' => function ($q) {
                $q->where('is_active', true);
            }])
            ->orderBy('name')
            ->get();
    }

    public function show(string $slug)
    {
        $category = ServiceCategory::query()
            ->where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        $services = $category->services()
            ->where('is_active', true)
            ->with(['category', 'categories'])
            ->orderBy('name')
            ->get();

        $payload = $category->toArray();
        $payload['services'] = $services;

        return response()->json($payload);
    }
}

