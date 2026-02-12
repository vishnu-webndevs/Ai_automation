<?php

namespace App\Services\Media;

use App\Models\ContentBlock;
use App\Models\MediaAsset;
use App\Models\MediaUsage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MediaService
{
    public function store(UploadedFile $file, string $altText, ?int $createdByAdminId = null): MediaAsset
    {
        return DB::transaction(function () use ($file, $altText, $createdByAdminId) {
            $media = MediaAsset::create([
                'disk' => 'public',
                'path' => 'pending',
                'file_name' => 'pending',
                'original_name' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType(),
                'size_bytes' => $file->getSize() ?: 0,
                'alt_text' => $altText,
                'created_by_admin_id' => $createdByAdminId,
            ]);

            $ext = strtolower($file->getClientOriginalExtension() ?: 'bin');
            $baseName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
            $safeBase = Str::slug($baseName) ?: 'asset';
            $fileName = $safeBase . '.' . $ext;

            $dir = "media/{$media->id}";
            $originalPath = "{$dir}/original.{$ext}";
            Storage::disk('public')->putFileAs($dir, $file, "original.{$ext}");

            $absolute = Storage::disk('public')->path($originalPath);
            $checksum = is_file($absolute) ? sha1_file($absolute) : null;
            $sizeBytes = is_file($absolute) ? filesize($absolute) : ($file->getSize() ?: 0);

            [$w, $h] = $this->readImageSize($absolute);

            $webpPath = "{$dir}/asset.webp";
            $webpCreated = $this->createWebp($absolute, Storage::disk('public')->path($webpPath));

            $media->update([
                'path' => $originalPath,
                'webp_path' => $webpCreated ? $webpPath : null,
                'file_name' => $fileName,
                'mime_type' => $file->getMimeType(),
                'size_bytes' => $sizeBytes ?: 0,
                'width' => $w,
                'height' => $h,
                'checksum' => $checksum,
            ]);

            return $media->fresh();
        });
    }

    public function replace(MediaAsset $media, UploadedFile $file, ?string $altText = null): MediaAsset
    {
        return DB::transaction(function () use ($media, $file, $altText) {
            $oldPath = $media->path;
            $oldWebp = $media->webp_path;

            $ext = strtolower($file->getClientOriginalExtension() ?: 'bin');
            $baseName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
            $safeBase = Str::slug($baseName) ?: 'asset';
            $fileName = $safeBase . '.' . $ext;

            $dir = "media/{$media->id}";
            $originalPath = "{$dir}/original.{$ext}";
            Storage::disk('public')->putFileAs($dir, $file, "original.{$ext}");

            $absolute = Storage::disk('public')->path($originalPath);
            $checksum = is_file($absolute) ? sha1_file($absolute) : null;
            $sizeBytes = is_file($absolute) ? filesize($absolute) : ($file->getSize() ?: 0);
            [$w, $h] = $this->readImageSize($absolute);

            $webpPath = "{$dir}/asset.webp";
            $webpCreated = $this->createWebp($absolute, Storage::disk('public')->path($webpPath));

            $media->update([
                'path' => $originalPath,
                'webp_path' => $webpCreated ? $webpPath : null,
                'file_name' => $fileName,
                'original_name' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType(),
                'size_bytes' => $sizeBytes ?: 0,
                'width' => $w,
                'height' => $h,
                'checksum' => $checksum,
                'alt_text' => $altText !== null ? $altText : $media->alt_text,
            ]);

            if ($oldPath && $oldPath !== $originalPath) {
                Storage::disk('public')->delete($oldPath);
            }
            if ($oldWebp && $oldWebp !== $media->webp_path) {
                Storage::disk('public')->delete($oldWebp);
            }

            return $media->fresh();
        });
    }

    public function scanUsage(): array
    {
        return DB::transaction(function () {
            MediaUsage::query()->delete();

            $created = 0;

            $blocks = ContentBlock::query()
                ->where('block_type', 'image')
                ->get();

            foreach ($blocks as $block) {
                $content = $block->content_json;
                if (!is_array($content)) {
                    continue;
                }

                $mediaId = $content['media_id'] ?? null;
                if (!$mediaId) {
                    $src = $content['src'] ?? null;
                    $mediaId = $this->extractMediaIdFromSrc($src);
                }

                if (!$mediaId) {
                    continue;
                }

                MediaUsage::create([
                    'media_id' => $mediaId,
                    'usable_type' => 'content_blocks',
                    'usable_id' => $block->id,
                    'field' => 'content_json',
                ]);
                $created++;
            }

            return ['created' => $created];
        });
    }

    private function extractMediaIdFromSrc(?string $src): ?int
    {
        if (!$src) {
            return null;
        }

        if (preg_match('#/storage/media/(\\d+)/#', $src, $m)) {
            return (int)$m[1];
        }

        return null;
    }

    private function readImageSize(string $absolutePath): array
    {
        if (!is_file($absolutePath)) {
            return [null, null];
        }

        $info = @getimagesize($absolutePath);
        if (!is_array($info) || count($info) < 2) {
            return [null, null];
        }

        return [$info[0] ?? null, $info[1] ?? null];
    }

    private function createWebp(string $sourceAbsolute, string $destAbsolute): bool
    {
        if (!function_exists('imagewebp')) {
            return false;
        }

        $info = @getimagesize($sourceAbsolute);
        if (!is_array($info) || empty($info['mime'])) {
            return false;
        }

        $mime = $info['mime'];
        $image = null;

        if ($mime === 'image/jpeg' && function_exists('imagecreatefromjpeg')) {
            $image = @imagecreatefromjpeg($sourceAbsolute);
        } elseif ($mime === 'image/png' && function_exists('imagecreatefrompng')) {
            $image = @imagecreatefrompng($sourceAbsolute);
            if ($image) {
                imagepalettetotruecolor($image);
                imagealphablending($image, true);
                imagesavealpha($image, true);
            }
        } elseif ($mime === 'image/gif' && function_exists('imagecreatefromgif')) {
            $image = @imagecreatefromgif($sourceAbsolute);
        } elseif ($mime === 'image/webp' && function_exists('imagecreatefromwebp')) {
            $image = @imagecreatefromwebp($sourceAbsolute);
        } else {
            return false;
        }

        if (!$image) {
            return false;
        }

        $dir = dirname($destAbsolute);
        if (!is_dir($dir)) {
            @mkdir($dir, 0777, true);
        }

        $ok = @imagewebp($image, $destAbsolute, 82);
        imagedestroy($image);

        return (bool)$ok;
    }
}

