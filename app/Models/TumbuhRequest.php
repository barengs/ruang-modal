<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class TumbuhRequest extends Model
{
    protected $fillable = [
        'user_id',
        'kode',
        'nama',
        'email',
        'whatsapp',
        'sekolah',
        'bidang_minat',
        'topik_pendampingan',
        'kebutuhan_jadwal',
        'status',
        'catatan_admin',
        'reviewed_by',
    ];

    public static function generateKode(): string
    {
        return 'RT-'.now('Asia/Jakarta')->format('Ymd').'-'.strtoupper(Str::random(8));
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
