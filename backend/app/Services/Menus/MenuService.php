<?php

namespace App\Services\Menus;

use App\Models\Menu;
use Illuminate\Support\Facades\Cache;

class MenuService
{
    public function getMenuTreeByLocation(string $location): array
    {
        $cacheKey = 'public_menu_tree:' . $location;

        return Cache::remember($cacheKey, 600, function () use ($location) {
            $menu = Menu::query()
                ->where('location', $location)
                ->where('is_active', true)
                ->with(['items.page'])
                ->first();

            if (!$menu) {
                return [];
            }

            $items = $menu->items->sortBy('order')->values();

            $byParent = [];
            foreach ($items as $item) {
                $pid = $item->parent_id ?: 0;
                $byParent[$pid] = $byParent[$pid] ?? [];
                $byParent[$pid][] = $item;
            }

            $build = function ($parentId) use (&$build, $byParent) {
                $children = $byParent[$parentId] ?? [];
                $out = [];

                foreach ($children as $child) {
                    $url = null;
                    if ($child->page) {
                        $url = '/' . ltrim($child->page->slug, '/');
                    } elseif (!empty($child->custom_url)) {
                        $url = $child->custom_url;
                    }

                    $out[] = [
                        'id' => $child->id,
                        'label' => $child->label,
                        'url' => $url,
                        'show_on' => $child->show_on,
                        'is_visible' => (bool)$child->is_visible,
                        'children' => $build($child->id),
                    ];
                }

                return $out;
            };

            return $build(0);
        });
    }

    public function clearCache(string $location): void
    {
        Cache::forget('public_menu_tree:' . $location);
    }
}

