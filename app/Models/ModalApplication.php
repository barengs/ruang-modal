<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class ModalApplication extends Model
{
    protected $fillable = [
        'kode',
        'nama',
        'email',
        'whatsapp',
        'sekolah',
        'tahun_lulus',
        'kompetensi',
        'jalur',
        'status_aktivitas',
        'jenis_bantuan',
        'rincian_kebutuhan',
        'estimasi_biaya',
        'rencana_deskripsi',
        'status_seleksi',
        'catatan_admin',
        'reviewed_by',
    ];

    protected function casts(): array
    {
        return [
            'estimasi_biaya' => 'integer',
        ];
    }

    public static function generateKode(): string
    {
        return 'RM-'.now('Asia/Jakarta')->format('Ymd').'-'.strtoupper(Str::random(8));
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function histories(): HasMany
    {
        return $this->hasMany(ModalApplicationHistory::class)->oldest();
    }
}
