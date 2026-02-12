<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Integration;
use Illuminate\Http\Request;

class IntegrationController extends Controller
{
    public function index()
    {
        return Integration::where('is_active', true)
            ->orderBy('name')
            ->get();
    }

    public function show($slug)
    {
        return Integration::where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();
    }
}
