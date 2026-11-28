<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ModalApplicationDocument extends Model
{
    protected $table = 'modal_application_documents';

    protected $fillable = [
        'modal_application_id',
        'nama_file',
        'file_url',
        'file_path',
        'jenis_dokumen',
        'tipe_mime',
        'ekstensi',
        'ukuran_file',
        'catatan',
        'uploaded_by',
    ];

    protected function casts(): array
    {
        return [
            'ukuran_file' => 'integer',
        ];
    }

    public function modalApplication(): BelongsTo
    {
        return $this->belongsTo(ModalApplication::class, 'modal_application_id');
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
