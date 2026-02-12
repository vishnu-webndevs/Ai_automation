<?php

namespace App\Http\Controllers\Api\Admin\Seo;

use App\Http\Controllers\Controller;
use App\Models\Redirect;
use Illuminate\Http\Request;

class RedirectController extends Controller
{
    public function index()
    {
        return response()->json(Redirect::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'source_url' => 'required|string|unique:redirects,source_url',
            'target_url' => 'required|string',
            'status_code' => 'integer|in:301,302',
            'is_active' => 'boolean',
        ]);

        if ($validated['source_url'] === $validated['target_url']) {
            return response()->json(['message' => 'Source and Target URLs cannot be the same.'], 422);
        }

        if ($this->detectLoop($validated['source_url'], $validated['target_url'])) {
            return response()->json(['message' => 'Redirect loop detected.'], 422);
        }

        $redirect = Redirect::create($validated);

        return response()->json($redirect, 201);
    }

    public function show($id)
    {
        $redirect = Redirect::findOrFail($id);
        return response()->json($redirect);
    }

    public function update(Request $request, $id)
    {
        $redirect = Redirect::findOrFail($id);

        $validated = $request->validate([
            'source_url' => 'sometimes|required|string|unique:redirects,source_url,' . $id,
            'target_url' => 'sometimes|required|string',
            'status_code' => 'integer|in:301,302',
            'is_active' => 'boolean',
        ]);

        $source = $validated['source_url'] ?? $redirect->source_url;
        $target = $validated['target_url'] ?? $redirect->target_url;

        if ($source === $target) {
            return response()->json(['message' => 'Source and Target URLs cannot be the same.'], 422);
        }

        if ($this->detectLoop($source, $target, $id)) {
            return response()->json(['message' => 'Redirect loop detected.'], 422);
        }

        $redirect->update($validated);

        return response()->json($redirect);
    }

    private function detectLoop($source, $target, $ignoreId = null)
    {
        // 1. Check if target points back to source directly (A -> B -> A)
        // We look for a redirect where source == current target
        
        $chain = [$source, $target];
        $current = $target;
        $depth = 0;
        $maxDepth = 10;

        while ($depth < $maxDepth) {
            $next = Redirect::where('source_url', $current)
                ->when($ignoreId, function ($q) use ($ignoreId) {
                    return $q->where('id', '!=', $ignoreId);
                })
                ->first();

            if (!$next) {
                return false; // Chain ends
            }

            if ($next->target_url === $source || in_array($next->target_url, $chain)) {
                return true; // Loop detected
            }

            $chain[] = $next->target_url;
            $current = $next->target_url;
            $depth++;
        }

        return false;
    }

    public function destroy($id)
    {
        $redirect = Redirect::findOrFail($id);
        $redirect->delete();

        return response()->json(null, 204);
    }
}
