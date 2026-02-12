<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use App\Models\MenuItem;
use App\Services\Menus\MenuService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class MenuController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'location' => 'sometimes|nullable|string',
        ]);

        $query = Menu::query()->orderBy('location')->orderBy('name');
        if (!empty($validated['location'])) {
            $query->where('location', $validated['location']);
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'location' => 'required|string|max:50',
            'slug' => 'nullable|string|max:255|unique:menus,slug',
            'is_active' => 'sometimes|boolean',
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = $this->uniqueSlug(Str::slug($validated['name']));
        }

        $menu = Menu::create($validated);

        return response()->json($menu, 201);
    }

    public function show(int $id)
    {
        $menu = Menu::with(['items.page'])->findOrFail($id);
        return response()->json($menu);
    }

    public function update(Request $request, int $id, MenuService $menuService)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'location' => 'sometimes|string|max:50',
            'slug' => 'sometimes|nullable|string|max:255|unique:menus,slug,' . $id,
            'is_active' => 'sometimes|boolean',
        ]);

        $menu = Menu::findOrFail($id);

        if (array_key_exists('name', $validated) && !array_key_exists('slug', $validated)) {
            $validated['slug'] = $this->uniqueSlug(Str::slug($validated['name']), $id);
        }

        if (array_key_exists('slug', $validated) && empty($validated['slug'])) {
            $validated['slug'] = $this->uniqueSlug(Str::slug($validated['name'] ?? $menu->name), $id);
        }

        $oldLocation = $menu->location;
        $menu->update($validated);

        $menuService->clearCache($oldLocation);
        $menuService->clearCache($menu->location);

        return response()->json($menu->fresh());
    }

    public function destroy(int $id, MenuService $menuService)
    {
        $menu = Menu::findOrFail($id);
        $location = $menu->location;
        $menu->delete();
        $menuService->clearCache($location);
        return response()->json(['deleted' => true]);
    }

    public function items(int $menuId)
    {
        $menu = Menu::with(['items.page'])->findOrFail($menuId);
        return response()->json($menu->items->sortBy('order')->values());
    }

    public function addItem(Request $request, int $menuId, MenuService $menuService)
    {
        $validated = $request->validate([
            'parent_id' => 'sometimes|nullable|integer|exists:menu_items,id',
            'label' => 'required|string|max:255',
            'page_id' => 'sometimes|nullable|integer|exists:pages,id',
            'custom_url' => 'sometimes|nullable|string|max:2048',
            'show_on' => 'sometimes|in:all,desktop,mobile',
            'is_visible' => 'sometimes|boolean',
        ]);

        if (empty($validated['page_id']) && empty($validated['custom_url'])) {
            return response()->json(['message' => 'Either page_id or custom_url is required'], 422);
        }

        if (!empty($validated['custom_url']) && !$this->isValidUrl($validated['custom_url'])) {
            return response()->json(['message' => 'custom_url must be an absolute URL or a site-relative path'], 422);
        }

        $menu = Menu::findOrFail($menuId);

        $maxOrder = MenuItem::query()
            ->where('menu_id', $menuId)
            ->where('parent_id', $validated['parent_id'] ?? null)
            ->max('order');

        $item = MenuItem::create([
            'menu_id' => $menuId,
            'parent_id' => $validated['parent_id'] ?? null,
            'label' => $validated['label'],
            'page_id' => $validated['page_id'] ?? null,
            'custom_url' => $validated['custom_url'] ?? null,
            'show_on' => $validated['show_on'] ?? 'all',
            'is_visible' => $validated['is_visible'] ?? true,
            'order' => is_null($maxOrder) ? 0 : ($maxOrder + 1),
        ]);

        $menuService->clearCache($menu->location);

        return response()->json($item->load('page'), 201);
    }

    public function updateItem(Request $request, int $id, MenuService $menuService)
    {
        $validated = $request->validate([
            'label' => 'sometimes|string|max:255',
            'page_id' => 'sometimes|nullable|integer|exists:pages,id',
            'custom_url' => 'sometimes|nullable|string|max:2048',
            'show_on' => 'sometimes|in:all,desktop,mobile',
            'is_visible' => 'sometimes|boolean',
        ]);

        $item = MenuItem::with('menu')->findOrFail($id);

        if (array_key_exists('custom_url', $validated) && !empty($validated['custom_url']) && !$this->isValidUrl($validated['custom_url'])) {
            return response()->json(['message' => 'custom_url must be an absolute URL or a site-relative path'], 422);
        }

        $item->update($validated);
        $menuService->clearCache($item->menu->location);

        return response()->json($item->fresh(['page']));
    }

    public function deleteItem(int $id, MenuService $menuService)
    {
        $item = MenuItem::with('menu')->findOrFail($id);
        $location = $item->menu->location;
        $item->delete();
        $menuService->clearCache($location);
        return response()->json(['deleted' => true]);
    }

    public function reorder(Request $request, int $menuId, MenuService $menuService)
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.id' => 'required|integer|exists:menu_items,id',
            'items.*.parent_id' => 'nullable|integer',
            'items.*.order' => 'required|integer|min:0',
        ]);

        $menu = Menu::findOrFail($menuId);

        DB::transaction(function () use ($validated, $menuId) {
            foreach ($validated['items'] as $row) {
                MenuItem::query()
                    ->where('id', $row['id'])
                    ->where('menu_id', $menuId)
                    ->update([
                        'parent_id' => $row['parent_id'] ?? null,
                        'order' => $row['order'],
                    ]);
            }
        });

        $menuService->clearCache($menu->location);

        return response()->json(['updated' => true]);
    }

    private function uniqueSlug(string $baseSlug, ?int $ignoreId = null): string
    {
        $slug = $baseSlug;
        $i = 2;

        $query = Menu::query();
        if ($ignoreId) {
            $query->where('id', '!=', $ignoreId);
        }

        while ((clone $query)->where('slug', $slug)->exists()) {
            $slug = $baseSlug . '-' . $i;
            $i++;
        }

        return $slug;
    }

    private function isValidUrl(string $url): bool
    {
        if (str_starts_with($url, '/')) {
            return true;
        }

        return (bool)filter_var($url, FILTER_VALIDATE_URL);
    }
}

