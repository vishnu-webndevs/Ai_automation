<?php

namespace App\Traits;

use App\Models\Admin;

trait HasLock
{
    public function locker()
    {
        return $this->belongsTo(Admin::class, 'locked_by');
    }

    public function isLocked()
    {
        return !is_null($this->locked_at);
    }

    public function lock(Admin $admin)
    {
        $this->update([
            'locked_at' => now(),
            'locked_by' => $admin->id,
        ]);
    }

    public function unlock()
    {
        $this->update([
            'locked_at' => null,
            'locked_by' => null,
        ]);
    }
    
    public function getLockedStatusAttribute()
    {
        return [
            'is_locked' => $this->isLocked(),
            'locked_at' => $this->locked_at,
            'locked_by' => $this->locker ? $this->locker->name : null,
            'locked_by_id' => $this->locked_by,
        ];
    }
}
