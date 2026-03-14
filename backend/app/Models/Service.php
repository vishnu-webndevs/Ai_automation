<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\HasLock;

class Service extends Model
{
    use HasFactory, HasLock;

    protected $fillable = [
        'service_category_id',
        'name',
        'slug',
        'template_slug',
        'short_description',
        'full_description',
        'content_json',
        'icon',
        'is_active',
        'locked_at',
        'locked_by'
    ];

    protected $casts = [
        'locked_at' => 'datetime',
        'is_active' => 'boolean',
        'content_json' => 'array',
    ];

    protected $appends = ['locked_status'];

    public function category()
    {
        return $this->belongsTo(ServiceCategory::class, 'service_category_id');
    }

    public function categories()
    {
        return $this->belongsToMany(ServiceCategory::class, 'service_category_service')->withTimestamps();
    }

    public function features()
    {
        return $this->hasMany(ServiceFeature::class)->orderBy('sort_order');
    }

    public function pages()
    {
        return $this->belongsToMany(Page::class, 'page_service_map');
    }
}
