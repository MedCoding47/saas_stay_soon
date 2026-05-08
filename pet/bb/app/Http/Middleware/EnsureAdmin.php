<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureAdmin
{
    public function handle(Request $request, Closure $next)
    {
        if (!auth()->check() || !auth()->user()->is_admin) {
            return response()->json([
                'message' => 'Admin access required',
                'success' => false
            ], 403);
        }

        return $next($request);
    }
}