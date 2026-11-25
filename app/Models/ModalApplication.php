<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class ModalApplication extends Model
{
    protected $fillable = [
        'user_id',
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
        'guru_pendamping',
        'dokumen_lampiran',
        'komitmen_pendampingan',
        'status_seleksi',
        'catatan_admin',
        'skor_kompetensi',
        'skor_rencana',
        'skor_kebutuhan',
        'skor_dampak',
        'skor_komitmen',
        'skor_total',
        'nominal_disetujui',
        'rincian_bantuan_disalurkan',
        'nomor_bast',
        'tanggal_penyaluran',
        'reviewed_by',
    ];

    protected function casts(): array
    {
        return [
            'estimasi_biaya' => 'integer',
            'komitmen_pendampingan' => 'boolean',
            'skor_kompetensi' => 'integer',
            'skor_rencana' => 'integer',
            'skor_kebutuhan' => 'integer',
            'skor_dampak' => 'integer',
            'skor_komitmen' => 'integer',
            'skor_total' => 'float',
            'nominal_disetujui' => 'integer',
            'tanggal_penyaluran' => 'date:Y-m-d',
        ];
    }

    public static function generateKode(): string
    {
        return 'RM-'.now('Asia/Jakarta')->format('Ymd').'-'.strtoupper(Str::random(8));
    }

    public static function generateNomorBast(string $kode): string
    {
        $suffix = substr(preg_replace('/[^A-Z0-9]/', '', strtoupper($kode)), -6);

        return 'BAST/DT-RM/'.now('Asia/Jakarta')->format('Y/m').'/'.$suffix;
    }

    public static function calculateSkorTotal(array $scores): ?float
    {
        $keys = ['skor_kompetensi', 'skor_rencana', 'skor_kebutuhan', 'skor_dampak', 'skor_komitmen'];
        $hasAny = false;
        foreach ($keys as $k) {
            if (isset($scores[$k]) && $scores[$k] !== null && $scores[$k] !== '') {
                $hasAny = true;
                break;
            }
        }

        if (! $hasAny) {
            return null;
        }

        $sKomp = (float) ($scores['skor_kompetensi'] ?? 0);
        $sRenc = (float) ($scores['skor_rencana'] ?? 0);
        $sKeb = (float) ($scores['skor_kebutuhan'] ?? 0);
        $sDamp = (float) ($scores['skor_dampak'] ?? 0);
        $sKomit = (float) ($scores['skor_komitmen'] ?? 0);

        return round(
            ($sKomp * 0.20) +
            ($sRenc * 0.25) +
            ($sKeb * 0.25) +
            ($sDamp * 0.20) +
            ($sKomit * 0.10),
            2
        );
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
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
