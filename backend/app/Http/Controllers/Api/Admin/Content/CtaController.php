<?php

namespace App\Http\Controllers\Api\Admin\Content;

use App\Http\Controllers\Controller;
use App\Models\Cta;
use Illuminate\Http\Request;

class CtaController extends Controller
{
    public function index()
    {
        return response()->json(Cta::withCount('pages')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'content' => 'nullable|string',
            'button_text' => 'nullable|string|max:255',
            'link' => 'nullable|string|max:255',
            'active_status' => 'boolean',
        ]);

        $cta = Cta::create($validated);

        return response()->json($cta, 201);
    }

    public function show($id)
    {
        $cta = Cta::with('pages:id,title,slug')->findOrFail($id);
        return response()->json($cta);
    }

    public function update(Request $request, $id)
    {
        $cta = Cta::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'content' => 'nullable|string',
            'button_text' => 'nullable|string|max:255',
            'link' => 'nullable|string|max:255',
            'active_status' => 'boolean',
        ]);

        $cta->update($validated);

        return response()->json($cta);
    }

    public function destroy($id)
    {
        $cta = Cta::findOrFail($id);
        $cta->delete();

        return response()->json(null, 204);
    }
}
