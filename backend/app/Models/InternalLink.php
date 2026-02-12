<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InternalLink extends Model
{
    use HasFactory;

    protected $fillable = ['source_page_id', 'target_page_id', 'anchor_text', 'auto_generated'];

    public function sourcePage()
    {
        return $this->belongsTo(Page::class, 'source_page_id');
    }

    public function targetPage()
    {
        return $this->belongsTo(Page::class, 'target_page_id');
    }
}
