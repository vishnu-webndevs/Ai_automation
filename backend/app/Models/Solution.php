<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\HasLock;

class Solution extends Model
{
    use HasFactory, HasLock;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'icon',
        'is_active',
        'locked_at',
        'locked_by'
    ];

    protected $casts = [
        'locked_at' => 'datetime',
        'is_active' => 'boolean'
    ];

    protected $appends = ['locked_status'];

    public function pages()
    {
        return $this->belongsToMany(Page::class, 'page_solution_map');
    }
}
