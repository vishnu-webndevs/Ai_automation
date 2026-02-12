<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class MediaAsset extends Model
{
    use HasFactory;

    protected $fillable = [
        'disk',
        'path',
        'webp_path',
        'file_name',
        'original_name',
        'mime_type',
        'size_bytes',
        'width',
        'height',
        'alt_text',
        'checksum',
        'created_by_admin_id',
    ];

    protected $casts = [
        'size_bytes' => 'int',
        'width' => 'int',
        'height' => 'int',
    ];

    protected $appends = [
        'url',
        'webp_url',
    ];

    public function usages()
    {
        return $this->hasMany(MediaUsage::class, 'media_id');
    }

    public function getUrlAttribute(): string
    {
        $disk = $this->disk ?: 'public';
        $path = $this->webp_path ?: $this->path;
        return Storage::disk($disk)->url($path);
    }

    public function getWebpUrlAttribute(): ?string
    {
        if (!$this->webp_path) {
            return null;
        }
        $disk = $this->disk ?: 'public';
        return Storage::disk($disk)->url($this->webp_path);
    }
}

