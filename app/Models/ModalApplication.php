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

    protected $appends = [
        'lampiran_list',
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

    /**
     * Pastikan dokumen_lampiran mengembalikan URL tunggal utama untuk kompatibilitas
     */
    public function getDokumenLampiranAttribute($value): ?string
    {
        try {
            if ($this->relationLoaded('documents') && $this->documents->isNotEmpty()) {
                return $this->documents->first()?->file_url;
            }
        } catch (\Throwable) {
            // Abaikan jika tabel relasi belum ada di environment tertentu
        }

        if (empty($value)) {
            return null;
        }

        if (is_string($value) && str_starts_with(trim($value), '[')) {
            $decoded = json_decode($value, true);
            if (is_array($decoded) && count($decoded) > 0) {
                return is_string($decoded[0]) ? $decoded[0] : ($decoded[0]['url'] ?? null);
            }
            return null;
        }

        return $value;
    }

    /**
     * Mengambil daftar dokumen lampiran dalam bentuk array terstruktur
     * @return array<int, array{id: int|null, url: string, name: string, type: string, size: int|null, jenis_dokumen: string|null, uploaded_at: string|null}>
     */
    public function getLampiranListAttribute(): array
    {
        if ($this->relationLoaded('documents') && $this->documents->isNotEmpty()) {
            return $this->documents->map(function ($doc) {
                return [
                    'id' => $doc->id,
                    'url' => $doc->file_url,
                    'name' => $doc->nama_file,
                    'type' => $doc->ekstensi ?: strtolower(pathinfo($doc->file_url, PATHINFO_EXTENSION)),
                    'size' => $doc->ukuran_file,
                    'jenis_dokumen' => $doc->jenis_dokumen,
                    'uploaded_at' => $doc->created_at?->format('Y-m-d H:i'),
                ];
            })->values()->all();
        }

        $raw = $this->attributes['dokumen_lampiran'] ?? null;
        if (empty($raw)) {
            return [];
        }

        if (is_string($raw) && str_starts_with(trim($raw), '[')) {
            $decoded = json_decode($raw, true);
            if (is_array($decoded)) {
                return array_map(function ($item) {
                    if (is_string($item)) {
                        return [
                            'id' => null,
                            'url' => $item,
                            'name' => basename($item),
                            'type' => strtolower(pathinfo($item, PATHINFO_EXTENSION)),
                            'size' => null,
                            'jenis_dokumen' => 'Proposal Usaha & RAB',
                            'uploaded_at' => $this->updated_at?->format('Y-m-d H:i') ?? $this->created_at?->format('Y-m-d H:i'),
                        ];
                    }
                    return [
                        'id' => $item['id'] ?? null,
                        'url' => $item['url'] ?? '',
                        'name' => $item['name'] ?? basename($item['url'] ?? 'dokumen'),
                        'type' => $item['type'] ?? strtolower(pathinfo($item['url'] ?? '', PATHINFO_EXTENSION)),
                        'size' => $item['size'] ?? null,
                        'jenis_dokumen' => $item['jenis_dokumen'] ?? 'Proposal Usaha & RAB',
                        'uploaded_at' => $item['uploaded_at'] ?? ($this->updated_at?->format('Y-m-d H:i') ?? $this->created_at?->format('Y-m-d H:i')),
                    ];
                }, $decoded);
            }
        }

        return [
            [
                'id' => null,
                'url' => $raw,
                'name' => basename($raw),
                'type' => strtolower(pathinfo($raw, PATHINFO_EXTENSION)),
                'size' => null,
                'jenis_dokumen' => 'Proposal Usaha & RAB',
                'uploaded_at' => $this->updated_at?->format('Y-m-d H:i') ?? $this->created_at?->format('Y-m-d H:i'),
            ],
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

    public function documents(): HasMany
    {
        return $this->hasMany(ModalApplicationDocument::class, 'modal_application_id')->oldest();
    }
}
