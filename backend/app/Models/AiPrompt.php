<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AiPrompt extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'name',
        'description',
        'is_active',
        'variables_json',
        'current_version_id',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'variables_json' => 'array',
    ];

    public function versions()
    {
        return $this->hasMany(\App\Models\AiPromptVersion::class)->orderByDesc('version_number');
    }

    public function currentVersion()
    {
        return $this->belongsTo(\App\Models\AiPromptVersion::class, 'current_version_id');
    }
}
