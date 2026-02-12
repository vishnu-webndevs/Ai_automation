<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cta extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'content', 'button_text', 'link', 'active_status'];

    public function pages()
    {
        return $this->belongsToMany(Page::class, 'cta_page_map')->withPivot('placement');
    }
}
