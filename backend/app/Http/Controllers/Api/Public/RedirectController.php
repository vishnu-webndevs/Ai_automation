<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Redirect;
use Illuminate\Support\Facades\Cache;

class RedirectController extends Controller
{
    public function index()
    {
        $redirects = Cache::remember('public_redirects', 3600, function () {
            return Redirect::where('is_active', true)->get(['source_url', 'target_url', 'status_code']);
        });

        return response()->json($redirects);
    }
}
