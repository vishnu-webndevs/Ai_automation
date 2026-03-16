<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Crypt;

class AppSetting extends Model
{
    protected $fillable = [
        'key',
        'value',
        'is_encrypted',
        'updated_by_id',
    ];

    public static function getValue(string $key): ?string
    {
        return Cache::remember("app_setting:{$key}", 3600, function () use ($key) {
            $row = self::query()->where('key', $key)->first();
            if (!$row) return null;
            if (!$row->is_encrypted) return $row->value;
            if ($row->value === null) return null;
            return Crypt::decryptString($row->value);
        });
    }

    public static function setValue(string $key, ?string $value, bool $encrypt = false, ?int $userId = null): void
    {
        $payload = [
            'value' => $encrypt && $value !== null ? Crypt::encryptString($value) : $value,
            'is_encrypted' => $encrypt,
            'updated_by_id' => $userId,
        ];

        self::query()->updateOrCreate(['key' => $key], $payload);
        Cache::forget("app_setting:{$key}");
    }

    public static function forget(string $key): void
    {
        self::query()->where('key', $key)->delete();
        Cache::forget("app_setting:{$key}");
    }
}

