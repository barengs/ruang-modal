<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ModalApplicationHistory extends Model
{
    protected $fillable = [
        'modal_application_id',
        'status_seleksi',
        'catatan',
        'actor_type',
        'actor_name',
    ];

    public function modalApplication(): BelongsTo
    {
        return $this->belongsTo(ModalApplication::class);
    }
}
