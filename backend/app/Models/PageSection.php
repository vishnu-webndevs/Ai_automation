<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PageSection extends Model
{
    use HasFactory;

    protected $fillable = ['page_id', 'section_key', 'order'];

    protected $appends = ['type'];

    public function getTypeAttribute()
    {
        // Infer type from section_key or return default
        if (str_contains($this->section_key, 'hero') || str_contains($this->section_key, 'full-width') || str_contains($this->section_key, 'cta')) {
            return 'full-width';
        }
        return 'default';
    }

    public function blocks()
    {
        return $this->hasMany(ContentBlock::class, 'section_id')->orderBy('order');
    }
}
