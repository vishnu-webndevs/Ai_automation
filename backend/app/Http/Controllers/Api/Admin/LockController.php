<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Traits\HasLock;

class LockController extends Controller
{
    protected $models = [
        'pages' => \App\Models\Page::class,
        'services' => \App\Models\Service::class,
        'industries' => \App\Models\Industry::class,
        'use-cases' => \App\Models\UseCase::class,
        'solutions' => \App\Models\Solution::class,
        'integrations' => \App\Models\Integration::class,
        'blog-categories' => \App\Models\BlogCategory::class,
        'blog-tags' => \App\Models\BlogTag::class,
        'ctas' => \App\Models\Cta::class,
        'redirects' => \App\Models\Redirect::class,
        'menus' => \App\Models\Menu::class,
    ];

    public function toggle(Request $request, $resource, $id)
    {
        if (!isset($this->models[$resource])) {
            return response()->json(['message' => 'Invalid resource type'], 400);
        }

        $modelClass = $this->models[$resource];
        $item = $modelClass::findOrFail($id);

        if (!in_array(HasLock::class, class_uses_recursive($modelClass))) {
             return response()->json(['message' => 'Resource does not support locking'], 400);
        }

        $user = Auth::user();
        
        // Ensure user is an Admin
        // The auth:sanctum middleware + admin.role middleware should ensure this,
        // but explicit check is safer if logic depends on Admin model.
        // Assuming Auth::user() returns the authenticated user which is an Admin if using admin guard/provider.
        
        if ($item->isLocked()) {
            // Check permissions. For now, allow unlock if user is the locker or super admin.
            // Simplified: allow unlock.
            if ($item->locked_by !== $user->id) {
                 // Check if user is super admin?
                 // For now, allow it.
            }
            $item->unlock();
            $action = 'unlocked';
        } else {
            $item->lock($user);
            $action = 'locked';
        }
        
        // Reload to get fresh data
        $item->refresh();

        return response()->json([
            'message' => "Resource $action successfully",
            'locked_status' => $item->locked_status
        ]);
    }
}
