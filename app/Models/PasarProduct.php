<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class PasarProduct extends Model
{
    protected $fillable = [
        'kode',
        'nama_alumni',
        'email',
        'whatsapp',
        'sekolah',
        'nama_produk',
        'kategori',
        'deskripsi',
        'harga',
        'kontak_link',
        'status_publikasi',
        'catatan_admin',
        'reviewed_by',
    ];

    public static function generateKode(): string
    {
        return 'RP-'.now('Asia/Jakarta')->format('Ymd').'-'.strtoupper(Str::random(8));
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
