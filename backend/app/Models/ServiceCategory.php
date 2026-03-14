<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ServiceCategory extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'slug', 'description', 'is_active'];

    public function services()
    {
        return $this->belongsToMany(Service::class, 'service_category_service')->withTimestamps();
    }

    public function primaryServices()
    {
        return $this->hasMany(Service::class, 'service_category_id');
    }
}
