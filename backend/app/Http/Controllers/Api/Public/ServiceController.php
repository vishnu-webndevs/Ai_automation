<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    public function index()
    {
        return Service::with('category')
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get();
    }

    public function show($slug)
    {
        return Service::with(['category', 'features'])
            ->where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();
    }
}
