<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SchemaMarkup extends Model
{
    use HasFactory;

    protected $table = 'schema_markup'; // Migration: schema_markup

    protected $fillable = ['page_id', 'type', 'schema_json'];

    protected $casts = [
        'schema_json' => 'array',
    ];

    public function page()
    {
        return $this->belongsTo(Page::class);
    }
}
