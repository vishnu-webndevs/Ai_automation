<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SitemapCache extends Model
{
    use HasFactory;

    protected $table = 'sitemap_cache'; // Migration: sitemap_cache

    protected $fillable = ['url', 'last_modified', 'change_freq', 'priority', 'type'];

    protected $casts = [
        'last_modified' => 'datetime',
    ];
}
