<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Services\Menus\MenuService;

class MenuController extends Controller
{
    public function show(string $location, MenuService $menuService)
    {
        return response()->json([
            'location' => $location,
            'items' => $menuService->getMenuTreeByLocation($location),
        ]);
    }
}

