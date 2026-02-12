<?php

namespace App\Http\Middleware;

use App\Models\Admin;
use Closure;
use Illuminate\Http\Request;

class EnsureAdminRole
{
    public function handle(Request $request, Closure $next, string $role = 'admin')
    {
        $user = $request->user();

        if (!$user instanceof Admin) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        if ($user->hasRole('super_admin')) {
            return $next($request);
        }

        if (!$user->hasRole($role)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return $next($request);
    }
}

