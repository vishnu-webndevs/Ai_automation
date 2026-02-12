<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
    }

    public function boot(): void
    {
        RateLimiter::for('ai-generation', function (Request $request) {
            $user = $request->user();
            $key = $user ? ('admin:' . $user->id) : $request->ip();

            return Limit::perMinute(10)->by($key);
        });
    }
}
