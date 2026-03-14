<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    public function index()
    {
        return Service::with(['category', 'categories'])
            ->where('is_active', true)
            ->orderBy('name')
            ->get();
    }

    public function show($slug)
    {
        return Service::with(['category', 'categories', 'features'])
            ->where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();
    }
}
