<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MediaUsage extends Model
{
    use HasFactory;

    protected $table = 'media_usage';

    protected $fillable = [
        'media_id',
        'usable_type',
        'usable_id',
        'field',
    ];

    public function media()
    {
        return $this->belongsTo(MediaAsset::class, 'media_id');
    }
}

