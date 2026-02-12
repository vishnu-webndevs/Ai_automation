<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AiGenerationLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'page_id', 'model_used', 'prompt_used', 'tokens_used', 'response_status'
    ];

    public function page()
    {
        return $this->belongsTo(Page::class);
    }
}
