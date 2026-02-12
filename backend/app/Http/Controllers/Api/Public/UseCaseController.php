<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\UseCase;
use Illuminate\Http\Request;

class UseCaseController extends Controller
{
    public function index()
    {
        return UseCase::where('is_active', true)
            ->orderBy('sort_order')
            ->get();
    }

    public function show($slug)
    {
        return UseCase::where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();
    }
}
