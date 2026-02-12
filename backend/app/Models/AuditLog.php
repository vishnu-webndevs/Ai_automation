<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'admin_id',
        'action_type',
        'entity_type',
        'entity_id',
        'change_summary',
        'ip_address'
    ];

    public function admin()
    {
        return $this->belongsTo(Admin::class);
    }
}
