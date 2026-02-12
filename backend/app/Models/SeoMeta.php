<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SeoMeta extends Model
{
    use HasFactory;

    protected $table = 'seo_meta';

    protected $fillable = [
        'page_id', 'meta_title', 'meta_description', 'meta_keywords', 'canonical_url', 'schema_json'
    ];

    protected $casts = [
        'schema_json' => 'array',
    ];

    public function page()
    {
        return $this->belongsTo(Page::class);
    }
}
