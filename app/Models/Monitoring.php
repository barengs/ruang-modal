<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Monitoring extends Model
{
    protected $fillable = [
        'user_id',
        'kode',
        'ref_kode',
        'nama_alumni',
        'modul',
        'tanggal_pantau',
        'tahap_pantau',
        'pemanfaatan_bantuan',
        'status_produktif',
        'pendapatan_omzet',
        'pendapatan_nominal',
        'catatan',
        'petugas',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'tanggal_pantau' => 'date:Y-m-d',
            'pendapatan_nominal' => 'integer',
        ];
    }

    public static function generateKode(): string
    {
        return 'MON-'.now('Asia/Jakarta')->format('Ymd').'-'.strtoupper(Str::random(8));
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
