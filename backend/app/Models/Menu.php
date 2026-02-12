<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\HasLock;

class Menu extends Model
{
    use HasFactory, HasLock;

    protected $fillable = [
        'name',
        'slug',
        'location',
        'is_active',
        'locked_at',
        'locked_by'
    ];

    protected $casts = [
        'is_active' => 'bool',
        'locked_at' => 'datetime',
    ];

    protected $appends = ['locked_status'];

    public function items()
    {
        return $this->hasMany(MenuItem::class);
    }
}

