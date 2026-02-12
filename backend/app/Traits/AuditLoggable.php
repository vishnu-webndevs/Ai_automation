<?php

namespace App\Traits;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Database\Eloquent\Model;

trait AuditLoggable
{
    public $_old_values;

    public static function bootAuditLoggable()
    {
        static::created(function (Model $model) {
            self::logAudit('created', $model);
        });

        static::updating(function (Model $model) {
            $model->_old_values = $model->getOriginal();
        });

        static::updated(function (Model $model) {
            self::logAudit('updated', $model);
        });

        static::deleted(function (Model $model) {
            self::logAudit('deleted', $model);
        });
    }

    protected static function logAudit($action, Model $model)
    {
        $adminId = null;
        
        // Check for authenticated user (works in web and tests)
        if (Auth::guard('sanctum')->check()) {
            $user = Auth::guard('sanctum')->user();
            if ($user instanceof \App\Models\Admin) {
                $adminId = $user->id;
            }
        } elseif (Auth::check()) {
            // Fallback for other guards if needed
             $user = Auth::user();
             if ($user instanceof \App\Models\Admin) {
                $adminId = $user->id;
            }
        }

        $changes = null;
        if ($action === 'updated') {
            $changes = json_encode([
                'before' => array_intersect_key($model->_old_values ?? [], $model->getChanges()),
                'after' => $model->getChanges(),
            ]);
        } elseif ($action === 'created') {
             $changes = 'Created new record';
        } elseif ($action === 'deleted') {
            $changes = 'Deleted record';
        }

        try {
            AuditLog::create([
                'admin_id' => $adminId,
                'action_type' => $action,
                'entity_type' => get_class($model),
                'entity_id' => $model->id,
                'change_summary' => $changes,
                'ip_address' => request()->ip(),
            ]);
        } catch (\Exception $e) {
            // Silently fail if audit logging fails to avoid blocking main action
            // Or log to system log
            \Illuminate\Support\Facades\Log::error('Audit Log Failed: ' . $e->getMessage());
        }
    }
}
