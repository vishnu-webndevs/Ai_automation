<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\MediaAsset;
use App\Services\Media\MediaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MediaController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'q' => 'sometimes|nullable|string',
            'per_page' => 'sometimes|nullable|integer|min:1|max:100',
        ]);

        $query = MediaAsset::query()->withCount('usages')->orderByDesc('id');

        if (!empty($validated['q'])) {
            $q = $validated['q'];
            $query->where(function ($sub) use ($q) {
                $sub->where('alt_text', 'like', "%{$q}%")
                    ->orWhere('file_name', 'like', "%{$q}%")
                    ->orWhere('original_name', 'like', "%{$q}%");
            });
        }

        $perPage = $validated['per_page'] ?? 30;
        return response()->json($query->paginate($perPage));
    }

    public function store(Request $request, MediaService $mediaService)
    {
        $validated = $request->validate([
            'file' => 'required|file|mimes:jpg,jpeg,png,gif,webp|max:5120',
            'alt_text' => 'required|string|max:255',
        ]);

        $admin = $request->user();
        $createdBy = is_object($admin) && property_exists($admin, 'id') ? $admin->id : null;

        $media = $mediaService->store($validated['file'], $validated['alt_text'], $createdBy);

        return response()->json($media, 201);
    }

    public function show(int $id)
    {
        $media = MediaAsset::with('usages')->findOrFail($id);
        return response()->json($media);
    }

    public function update(Request $request, int $id)
    {
        $validated = $request->validate([
            'alt_text' => 'required|string|max:255',
        ]);

        $media = MediaAsset::findOrFail($id);
        $media->update([
            'alt_text' => $validated['alt_text'],
        ]);

        return response()->json($media->fresh());
    }

    public function replace(Request $request, int $id, MediaService $mediaService)
    {
        $validated = $request->validate([
            'file' => 'required|file|mimes:jpg,jpeg,png,gif,webp|max:5120',
            'alt_text' => 'sometimes|nullable|string|max:255',
        ]);

        $media = MediaAsset::findOrFail($id);
        $updated = $mediaService->replace($media, $validated['file'], $validated['alt_text'] ?? null);

        return response()->json($updated);
    }

    public function destroy(int $id)
    {
        $media = MediaAsset::findOrFail($id);
        $disk = $media->disk ?: 'public';

        if ($media->path) {
            Storage::disk($disk)->delete($media->path);
        }
        if ($media->webp_path) {
            Storage::disk($disk)->delete($media->webp_path);
        }

        $media->delete();

        return response()->json(['deleted' => true]);
    }

    public function scanUsage(MediaService $mediaService)
    {
        return response()->json($mediaService->scanUsage());
    }
}

