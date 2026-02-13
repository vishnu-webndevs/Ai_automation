<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PageTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'preview_image',
        'config_json',
    ];

    protected $casts = [
        'config_json' => 'array',
    ];
}
