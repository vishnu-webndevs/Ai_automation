<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Solution;
use Illuminate\Http\Request;

class SolutionController extends Controller
{
    public function index()
    {
        return Solution::where('is_active', true)
            ->orderBy('name')
            ->get();
    }

    public function show($slug)
    {
        return Solution::where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();
    }
}
