<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KeywordMap extends Model
{
    use HasFactory;

    protected $table = 'keyword_map'; // Explicitly set table name if convention doesn't match singular/plural perfectly or if needed.
    // Laravel usually guesses 'keyword_maps', but migration was 'keyword_map'.
    // Let's check migration again.
    // Migration: Schema::create('keyword_map', ...
    // So model should map to 'keyword_map'.

    protected $fillable = ['page_id', 'keyword', 'is_primary'];

    public function page()
    {
        return $this->belongsTo(Page::class);
    }
}
