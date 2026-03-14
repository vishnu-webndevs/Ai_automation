<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AiPromptVersion extends Model
{
    use HasFactory;

    protected $fillable = [
        'ai_prompt_id',
        'version_number',
        'prompt_text',
        'variables_json',
        'content_hash',
        'created_by_admin_id',
    ];

    protected $casts = [
        'variables_json' => 'array',
    ];

    public function prompt()
    {
        return $this->belongsTo(AiPrompt::class, 'ai_prompt_id');
    }

    public function createdBy()
    {
        return $this->belongsTo(Admin::class, 'created_by_admin_id');
    }
}

