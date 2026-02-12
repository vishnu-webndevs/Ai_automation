<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RobotsConfig extends Model
{
    use HasFactory;

    protected $table = 'robots_config'; // Migration: robots_config

    protected $fillable = ['user_agent', 'allow_paths', 'disallow_paths'];
}
