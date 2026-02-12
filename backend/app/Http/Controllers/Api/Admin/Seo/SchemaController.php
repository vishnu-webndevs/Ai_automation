<?php

namespace App\Http\Controllers\Api\Admin\Seo;

use App\Http\Controllers\Controller;
use App\Models\SchemaMarkup;
use Illuminate\Http\Request;

class SchemaController extends Controller
{
    public function index(Request $request)
    {
        $query = SchemaMarkup::with('page:id,title,slug');

        if ($request->has('page_id')) {
            $query->where('page_id', $request->page_id);
        }

        return response()->json($query->paginate(20));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'page_id' => 'nullable|exists:pages,id',
            'type' => 'required|string',
            'schema_json' => 'required|array',
        ]);

        $schema = SchemaMarkup::create($validated);

        return response()->json($schema, 201);
    }

    public function show($id)
    {
        $schema = SchemaMarkup::with('page')->findOrFail($id);
        return response()->json($schema);
    }

    public function update(Request $request, $id)
    {
        $schema = SchemaMarkup::findOrFail($id);

        $validated = $request->validate([
            'page_id' => 'nullable|exists:pages,id',
            'type' => 'sometimes|required|string',
            'schema_json' => 'sometimes|required|array',
        ]);

        $schema->update($validated);

        return response()->json($schema);
    }

    public function destroy($id)
    {
        $schema = SchemaMarkup::findOrFail($id);
        $schema->delete();

        return response()->json(null, 204);
    }
}
