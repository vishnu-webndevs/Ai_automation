<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ContentBlock extends Model
{
    use HasFactory;

    protected $fillable = ['section_id', 'block_type', 'content_json', 'order'];

    protected $casts = [
        'content_json' => 'array',
    ];

    protected $appends = ['content'];

    public function getContentAttribute()
    {
        return $this->content_json;
    }

    public function section()
    {
        return $this->belongsTo(PageSection::class, 'section_id');
    }
}
