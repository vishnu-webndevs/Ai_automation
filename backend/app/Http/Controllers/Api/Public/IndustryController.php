<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Industry;
use Illuminate\Http\Request;

class IndustryController extends Controller
{
    public function index()
    {
        return Industry::where('is_active', true)
            ->orderBy('sort_order')
            ->get();
    }

    public function show($slug)
    {
        return Industry::where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();
    }
}
