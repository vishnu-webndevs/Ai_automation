<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class BlockMaliciousRequests
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $uri = $request->getRequestUri();

        // List of malicious request patterns (case-insensitive)
        $patterns = [
            'wp-admin',
            'wp-includes',
            'wp-content',
            'xmlrpc.php',
            'wp-login.php',
            'wlwmanifest.xml',
            '.env',
            '.git',
            'phpmyadmin',
            'adminer.php',
            'select+select',
            'union+select',
            'etc/passwd'
        ];

        foreach ($patterns as $pattern) {
            if (stripos($uri, $pattern) !== false) {
                // Return immediate 403 Forbidden without database bootstrap or stack traces
                return response('Forbidden', 403)
                    ->header('Content-Type', 'text/plain')
                    ->header('Connection', 'close');
            }
        }

        return $next($request);
    }
}
