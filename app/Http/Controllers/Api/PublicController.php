<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MasterOption;
use App\Models\ModalApplication;
use App\Models\Monitoring;
use App\Models\PasarProduct;
use App\Models\Testimonial;
use App\Models\TumbuhRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\ImageManager;

class PublicController extends Controller
{
    public function stats(): JsonResponse
    {
        return response()->json([
            'counts' => [
                'products' => PasarProduct::where('status_publikasi', 'Tayang')->count(),
                'modal' => ModalApplication::count(),
                'tumbuh' => TumbuhRequest::count(),
                'monitoring' => Monitoring::count(),
            ],
        ]);
    }

    public function masterOptions(): JsonResponse
    {
        $options = MasterOption::where('is_active', true)
            ->orderBy('urutan')
            ->orderBy('id')
            ->get()
            ->groupBy('group_key')
            ->map(fn ($items) => $items->pluck('label')->values()->all());

        return response()->json([
            'options' => $options,
        ]);
    }

    public function testimonials(): JsonResponse
    {
        $items = Testimonial::where('is_approved', true)
            ->latest()
            ->get();

        return response()->json([
            'data' => $items,
        ]);
    }

    public function pasar(Request $request): JsonResponse
    {
        $query = PasarProduct::query()
            ->where('status_publikasi', 'Tayang')
            ->latest();

        if ($kategori = $request->string('kategori')->trim()->toString()) {
            $query->where('kategori', $kategori);
        }

        if ($search = $request->string('search')->trim()->toString()) {
            $query->where(function ($q) use ($search) {
                $q->where('nama_produk', 'like', "%{$search}%")
                    ->orWhere('deskripsi', 'like', "%{$search}%")
                    ->orWhere('nama_alumni', 'like', "%{$search}%")
                    ->orWhere('sekolah', 'like', "%{$search}%");
            });
        }

        $products = $query->get()->map(fn (PasarProduct $p) => [
            'id' => $p->id,
            'kode' => $p->kode,
            'nama_produk' => $p->nama_produk,
            'kategori' => $p->kategori,
            'thumbnail' => $p->thumbnail,
            'deskripsi' => $p->deskripsi,
            'harga' => $p->harga,
            'kontak_link' => $p->kontak_link,
            'nama_alumni' => $p->nama_alumni,
            'sekolah' => $p->sekolah,
            'created_at' => $p->created_at?->toISOString(),
        ]);

        return response()->json([
            'products' => $products,
            'total' => $products->count(),
        ]);
    }

    public function modalList(Request $request): JsonResponse
    {
        $query = ModalApplication::with(['reviewer:id,name', 'histories'])
            ->latest();

        if ($status = $request->string('status')->trim()->toString()) {
            $query->where('status_seleksi', $status);
        }

        if ($search = $request->string('search')->trim()->toString()) {
            $query->where(function ($q) use ($search) {
                $q->where('kode', 'like', "%{$search}%")
                    ->orWhere('nama', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('whatsapp', 'like', "%{$search}%")
                    ->orWhere('sekolah', 'like', "%{$search}%")
                    ->orWhere('kompetensi', 'like', "%{$search}%");
            });
        }

        $items = $query->get();

        return response()->json([
            'data' => $items,
            'total' => $items->count(),
        ]);
    }

    public function submitModal(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nama' => ['required', 'string', 'max:150'],
            'email' => ['required', 'email', 'max:150'],
            'whatsapp' => ['required', 'string', 'max:40'],
            'sekolah' => ['required', 'string', 'max:180'],
            'tahun_lulus' => ['required', 'string', 'max:10'],
            'kompetensi' => ['required', 'string', 'max:120'],
            'jalur' => ['required', 'string', 'max:100'],
            'status_aktivitas' => ['nullable', 'string', 'max:80'],
            'jenis_bantuan' => ['required', 'string', 'max:80'],
            'rincian_kebutuhan' => ['required', 'string', 'max:2000'],
            'estimasi_biaya' => ['nullable', 'integer', 'min:0'],
            'rencana_deskripsi' => ['required', 'string', 'max:3000'],
            'guru_pendamping' => ['nullable', 'string', 'max:150'],
            'komitmen_pendampingan' => ['nullable', 'boolean'],
            'dokumen_lampiran' => ['nullable'],
            'dokumen_lampiran.*' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,pdf,doc,docx,xls,xlsx', 'max:5120'],
            'lampiran_files' => ['nullable'],
            'lampiran_files.*' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,pdf,doc,docx,xls,xlsx', 'max:5120'],
        ]);

        $files = [];
        if ($request->hasFile('dokumen_lampiran')) {
            $inputFiles = $request->file('dokumen_lampiran');
            if (is_array($inputFiles)) {
                $files = array_merge($files, $inputFiles);
            } else {
                $files[] = $inputFiles;
            }
        }
        if ($request->hasFile('lampiran_files')) {
            $inputFiles = $request->file('lampiran_files');
            if (is_array($inputFiles)) {
                $files = array_merge($files, $inputFiles);
            } else {
                $files[] = $inputFiles;
            }
        }

        $savedList = [];
        foreach ($files as $f) {
            $meta = $this->processUploadedLampiran($f);
            if ($meta) {
                $savedList[] = $meta;
            }
        }

        $primaryUrl = count($savedList) > 0 ? $savedList[0]['url'] : null;

        unset($validated['dokumen_lampiran'], $validated['lampiran_files']);

        $record = ModalApplication::create([
            ...$validated,
            'user_id' => auth('api')->id(),
            'kode' => ModalApplication::generateKode(),
            'estimasi_biaya' => $validated['estimasi_biaya'] ?? 0,
            'komitmen_pendampingan' => filter_var($request->input('komitmen_pendampingan', true), FILTER_VALIDATE_BOOLEAN),
            'dokumen_lampiran' => $primaryUrl,
            'status_seleksi' => 'Menunggu Seleksi',
        ]);

        // Simpan setiap file ke tabel relasional modal_application_documents
        foreach ($savedList as $idx => $saved) {
            $record->documents()->create([
                'nama_file' => $saved['name'],
                'file_url' => $saved['url'],
                'file_path' => $saved['url'],
                'jenis_dokumen' => $idx === 0 ? 'Proposal Usaha & RAB' : 'Dokumen Pendukung',
                'ekstensi' => $saved['type'],
                'ukuran_file' => $saved['size'] ?? null,
                'uploaded_by' => auth('api')->id(),
            ]);
        }

        $record->histories()->create([
            'status_seleksi' => 'Menunggu Seleksi',
            'catatan' => 'Pengajuan Ruang Modal dikirim oleh pemohon beserta komitmen pendampingan.',
            'actor_type' => 'pemohon',
            'actor_name' => $record->nama,
        ]);

        return response()->json([
            'kode' => $record->kode,
            'data' => $record->load(['reviewer:id,name', 'histories', 'documents']),
            'message' => 'Pengajuan Ruang Modal berhasil dikirim. Simpan nomor pengajuan Anda.',
        ], 201);
    }

    public function updateModalLampiran(Request $request, ModalApplication $modal): JsonResponse
    {
        $request->validate([
            'dokumen_lampiran' => ['nullable'],
            'dokumen_lampiran.*' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,pdf,doc,docx,xls,xlsx', 'max:5120'],
            'lampiran_files' => ['nullable'],
            'lampiran_files.*' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,pdf,doc,docx,xls,xlsx', 'max:5120'],
            'email' => ['nullable', 'string', 'email'],
            'catatan' => ['nullable', 'string', 'max:500'],
            'action' => ['nullable', 'string', 'in:append,replace'],
        ]);

        $user = auth('api')->user();

        if ($user) {
            $isAdmin = $user->hasRole(['admin', 'super-admin']) || $user->can('modal.update');
            $isOwner = ($modal->user_id && (int) $modal->user_id === (int) $user->id) ||
                (strtolower(trim((string) $modal->email)) === strtolower(trim((string) $user->email)));

            if (! $isAdmin && ! $isOwner) {
                return response()->json([
                    'message' => 'Anda tidak memiliki hak akses untuk memperbarui dokumen pengajuan ini.',
                ], 403);
            }

            $actorType = $isAdmin && ! $isOwner ? 'admin' : 'pemohon';
            $actorName = $user->name;
        } else {
            // Verifikasi email pemohon jika tidak login
            $providedEmail = strtolower(trim((string) $request->input('email', '')));
            if (! $providedEmail || $providedEmail !== strtolower(trim((string) $modal->email))) {
                return response()->json([
                    'message' => 'Verifikasi email tidak sesuai dengan email pemohon pengajuan ini.',
                ], 403);
            }

            $actorType = 'pemohon';
            $actorName = $modal->nama;
        }

        $files = [];
        if ($request->hasFile('dokumen_lampiran')) {
            $inputFiles = $request->file('dokumen_lampiran');
            if (is_array($inputFiles)) {
                $files = array_merge($files, $inputFiles);
            } else {
                $files[] = $inputFiles;
            }
        }
        if ($request->hasFile('lampiran_files')) {
            $inputFiles = $request->file('lampiran_files');
            if (is_array($inputFiles)) {
                $files = array_merge($files, $inputFiles);
            } else {
                $files[] = $inputFiles;
            }
        }

        if (empty($files)) {
            return response()->json([
                'message' => 'Pilih minimal satu berkas dokumen lampiran untuk diunggah.',
            ], 422);
        }

        $newSavedList = [];
        foreach ($files as $f) {
            $meta = $this->processUploadedLampiran($f);
            if ($meta) {
                $newSavedList[] = $meta;
            }
        }

        if (empty($newSavedList)) {
            return response()->json([
                'message' => 'Gagal mengunggah berkas dokumen lampiran ke server.',
            ], 500);
        }

        $action = $request->input('action', 'append');
        if ($action === 'replace') {
            $modal->documents()->delete();
            $historyText = "Dokumen lampiran proposal/RAB diganti oleh {$actorName}.";
        } else {
            $countAdded = count($newSavedList);
            $historyText = "{$countAdded} dokumen lampiran baru ditambahkan oleh {$actorName}.";
        }

        foreach ($newSavedList as $idx => $saved) {
            $modal->documents()->create([
                'nama_file' => $saved['name'],
                'file_url' => $saved['url'],
                'file_path' => $saved['url'],
                'jenis_dokumen' => ($action === 'replace' && $idx === 0) ? 'Proposal Usaha & RAB' : 'Dokumen Pendukung',
                'ekstensi' => $saved['type'],
                'ukuran_file' => $saved['size'] ?? null,
                'uploaded_by' => $user?->id,
            ]);
        }

        $firstDoc = $modal->documents()->first();
        $modal->dokumen_lampiran = $firstDoc?->file_url;
        $modal->save();

        $catatanTambahan = trim((string) $request->input('catatan', ''));
        if ($catatanTambahan !== '') {
            $historyText .= " Catatan: {$catatanTambahan}";
        }

        $modal->histories()->create([
            'status_seleksi' => $modal->status_seleksi,
            'catatan' => $historyText,
            'actor_type' => $actorType,
            'actor_name' => $actorName,
        ]);

        return response()->json([
            'message' => count($newSavedList) > 1
                ? count($newSavedList).' dokumen lampiran berhasil diperbarui.'
                : 'Dokumen lampiran berhasil diperbarui.',
            'dokumen_lampiran' => $modal->dokumen_lampiran,
            'lampiran_list' => $modal->lampiran_list,
            'documents' => $modal->documents,
            'data' => $modal->fresh(['reviewer:id,name', 'histories', 'documents']),
        ]);
    }

    public function deleteModalLampiran(Request $request, ModalApplication $modal): JsonResponse
    {
        $request->validate([
            'document_id' => ['nullable', 'integer'],
            'id' => ['nullable', 'integer'],
            'index' => ['nullable', 'integer', 'min:0'],
            'url' => ['nullable', 'string'],
            'email' => ['nullable', 'string', 'email'],
        ]);

        $user = auth('api')->user();

        if ($user) {
            $isAdmin = $user->hasRole(['admin', 'super-admin']) || $user->can('modal.update');
            $isOwner = ($modal->user_id && (int) $modal->user_id === (int) $user->id) ||
                (strtolower(trim((string) $modal->email)) === strtolower(trim((string) $user->email)));

            if (! $isAdmin && ! $isOwner) {
                return response()->json([
                    'message' => 'Anda tidak memiliki hak akses untuk menghapus dokumen lampiran ini.',
                ], 403);
            }

            $actorName = $user->name;
            $actorType = $isAdmin && ! $isOwner ? 'admin' : 'pemohon';
        } else {
            $providedEmail = strtolower(trim((string) $request->input('email', '')));
            if (! $providedEmail || $providedEmail !== strtolower(trim((string) $modal->email))) {
                return response()->json([
                    'message' => 'Verifikasi email tidak sesuai dengan email pemohon pengajuan ini.',
                ], 403);
            }

            $actorName = $modal->nama;
            $actorType = 'pemohon';
        }

        $targetDocId = $request->input('document_id', $request->input('id'));
        $targetIndex = $request->input('index');
        $targetUrl = $request->input('url');

        $docToDelete = null;
        if ($targetDocId) {
            $docToDelete = $modal->documents()->find($targetDocId);
        } elseif ($targetUrl) {
            $docToDelete = $modal->documents()->where('file_url', $targetUrl)->first();
        } elseif ($targetIndex !== null) {
            $docToDelete = $modal->documents()->skip((int) $targetIndex)->first();
        }

        if (! $docToDelete) {
            // Fallback: hapus dari legacy list jika belum bermigrasi
            $list = $modal->lampiran_list ?? [];
            if ($targetIndex !== null && isset($list[$targetIndex])) {
                $docName = $list[$targetIndex]['name'] ?? 'Dokumen';
                array_splice($list, $targetIndex, 1);
                $modal->dokumen_lampiran = count($list) > 0 ? json_encode(array_values($list)) : null;
                $modal->save();
            } else {
                return response()->json([
                    'message' => 'Dokumen lampiran yang dipilih tidak ditemukan.',
                ], 404);
            }
        } else {
            $docName = $docToDelete->nama_file;
            $docToDelete->delete();

            $firstDoc = $modal->documents()->first();
            $modal->dokumen_lampiran = $firstDoc?->file_url;
            $modal->save();
        }

        $modal->histories()->create([
            'status_seleksi' => $modal->status_seleksi,
            'catatan' => "Dokumen lampiran '{$docName}' dihapus oleh {$actorName}.",
            'actor_type' => $actorType,
            'actor_name' => $actorName,
        ]);

        return response()->json([
            'message' => "Dokumen lampiran '{$docName}' berhasil dihapus.",
            'dokumen_lampiran' => $modal->dokumen_lampiran,
            'lampiran_list' => $modal->lampiran_list,
            'documents' => $modal->documents,
            'data' => $modal->fresh(['reviewer:id,name', 'histories', 'documents']),
        ]);
    }

    /**
     * Helper untuk menyimpan berkas lampiran modal dan mengembalikan metadata terstruktur
     * @return array{url: string, name: string, type: string, size: int, uploaded_at: string}|null
     */
    private function processUploadedLampiran($file): ?array
    {
        if (! $file || ! $file->isValid()) {
            return null;
        }

        $uploadDir = public_path('uploads/modal');
        $storageDir = storage_path('app/public/uploads/modal');

        if (! is_dir($uploadDir)) {
            @mkdir($uploadDir, 0775, true);
        }
        if (! is_dir($storageDir)) {
            @mkdir($storageDir, 0775, true);
        }

        $originalName = $file->getClientOriginalName();
        $ext = strtolower($file->getClientOriginalExtension());
        $fileSize = $file->getSize() ?: 0;
        $randomSuffix = strtolower(Str::random(8));
        $timestamp = now('Asia/Jakarta')->format('YmdHis');
        $lampiranPath = null;

        try {
            if (in_array($ext, ['jpg', 'jpeg', 'png', 'webp'])) {
                $filename = "lampiran-modal-{$timestamp}-{$randomSuffix}.webp";
                $fullPath = $uploadDir.DIRECTORY_SEPARATOR.$filename;

                $manager = ImageManager::usingDriver(Driver::class);
                $image = $manager->decodePath($file->getRealPath());
                $image->scaleDown(1200, 1200);
                $image->encodeUsingFileExtension('webp', quality: 85)->save($fullPath);
                @copy($fullPath, $storageDir.DIRECTORY_SEPARATOR.$filename);
                $lampiranPath = '/uploads/modal/'.$filename;
            } else {
                $filename = "proposal-modal-{$timestamp}-{$randomSuffix}.{$ext}";
                $file->move($uploadDir, $filename);
                @copy($uploadDir.DIRECTORY_SEPARATOR.$filename, $storageDir.DIRECTORY_SEPARATOR.$filename);
                $lampiranPath = '/uploads/modal/'.$filename;
            }
        } catch (\Throwable $e) {
            try {
                $fallbackFilename = "proposal-modal-{$timestamp}-{$randomSuffix}.{$ext}";
                $file->move($uploadDir, $fallbackFilename);
                @copy($uploadDir.DIRECTORY_SEPARATOR.$fallbackFilename, $storageDir.DIRECTORY_SEPARATOR.$fallbackFilename);
                $lampiranPath = '/uploads/modal/'.$fallbackFilename;
            } catch (\Throwable $fallbackError) {
                \Illuminate\Support\Facades\Log::error('Gagal menyimpan dokumen lampiran modal: '.$fallbackError->getMessage());
                return null;
            }
        }

        return [
            'url' => $lampiranPath,
            'name' => $originalName,
            'type' => $ext,
            'size' => $fileSize,
            'uploaded_at' => now('Asia/Jakarta')->format('Y-m-d H:i'),
        ];
    }

    public function tumbuhList(Request $request): JsonResponse
    {
        $query = TumbuhRequest::with('reviewer:id,name')
            ->latest();

        if ($status = $request->string('status')->trim()->toString()) {
            $query->where('status', $status);
        }

        if ($search = $request->string('search')->trim()->toString()) {
            $query->where(function ($q) use ($search) {
                $q->where('kode', 'like', "%{$search}%")
                    ->orWhere('nama', 'like', "%{$search}%")
                    ->orWhere('sekolah', 'like', "%{$search}%")
                    ->orWhere('bidang_minat', 'like', "%{$search}%")
                    ->orWhere('topik_pendampingan', 'like', "%{$search}%");
            });
        }

        $items = $query->get();

        return response()->json([
            'data' => $items,
            'total' => $items->count(),
        ]);
    }

    public function pasarList(Request $request): JsonResponse
    {
        $query = PasarProduct::with('reviewer:id,name')
            ->latest();

        if ($status = $request->string('status')->trim()->toString()) {
            $query->where('status_publikasi', $status);
        }

        $items = $query->get();

        return response()->json([
            'data' => $items,
            'total' => $items->count(),
        ]);
    }

    public function submitTumbuh(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nama' => ['required', 'string', 'max:150'],
            'email' => ['required', 'email', 'max:150'],
            'whatsapp' => ['required', 'string', 'max:40'],
            'sekolah' => ['required', 'string', 'max:180'],
            'bidang_minat' => ['required', 'string', 'max:100'],
            'topik_pendampingan' => ['required', 'string', 'max:500'],
            'kebutuhan_jadwal' => ['required', 'string', 'max:2000'],
        ]);

        $record = TumbuhRequest::create([
            ...$validated,
            'user_id' => auth('api')->id(),
            'kode' => TumbuhRequest::generateKode(),
            'status' => 'Menunggu',
        ]);

        return response()->json([
            'kode' => $record->kode,
            'data' => $record->load('reviewer:id,name'),
            'message' => 'Permintaan pendampingan Ruang Tumbuh berhasil dikirim.',
        ], 201);
    }

    public function submitPasar(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nama_alumni' => ['required', 'string', 'max:150'],
            'email' => ['required', 'email', 'max:150'],
            'whatsapp' => ['required', 'string', 'max:40'],
            'sekolah' => ['required', 'string', 'max:180'],
            'nama_produk' => ['required', 'string', 'max:180'],
            'kategori' => ['required', 'string', 'max:100'],
            'thumbnail' => ['nullable', 'file', 'image', 'mimes:jpg,jpeg,png,webp,gif,bmp', 'max:5120'],
            'deskripsi' => ['required', 'string', 'max:2000'],
            'harga' => ['nullable', 'string', 'max:100'],
            'kontak_link' => ['required', 'string', 'max:500'],
        ]);

        $defaultThumbnails = [
            'Kuliner' => '/images/etalase/kuliner.webp',
            'Fashion' => '/images/etalase/fashion.webp',
            'Jasa kreatif' => '/images/etalase/jasa-kreatif.webp',
            'Kecantikan' => '/images/etalase/kecantikan.webp',
            'Kerajinan' => '/images/etalase/kerajinan.webp',
            'Teknologi' => '/images/etalase/teknologi.webp',
        ];

        $thumbnailPath = $defaultThumbnails[$validated['kategori']] ?? '/images/etalase/default.webp';

        if ($request->hasFile('thumbnail') && $request->file('thumbnail')->isValid()) {
            $uploadDir = public_path('images/etalase/uploads');
            if (! is_dir($uploadDir)) {
                @mkdir($uploadDir, 0775, true);
            }

            $timestamp = now('Asia/Jakarta')->format('YmdHis');
            $randomSuffix = strtolower(Str::random(8));

            try {
                $filename = "produk-{$timestamp}-{$randomSuffix}.webp";
                $fullPath = $uploadDir.DIRECTORY_SEPARATOR.$filename;

                $manager = ImageManager::usingDriver(Driver::class);
                $image = $manager->decodePath($request->file('thumbnail')->getRealPath());
                $image->coverDown(800, 450);
                $image->encodeUsingFileExtension('webp', quality: 85)->save($fullPath);

                $thumbnailPath = '/images/etalase/uploads/'.$filename;
            } catch (\Throwable $e) {
                try {
                    $ext = strtolower($request->file('thumbnail')->getClientOriginalExtension()) ?: 'webp';
                    $fallbackFilename = "produk-{$timestamp}-{$randomSuffix}.{$ext}";
                    $request->file('thumbnail')->move($uploadDir, $fallbackFilename);
                    $thumbnailPath = '/images/etalase/uploads/'.$fallbackFilename;
                } catch (\Throwable $fallbackError) {
                    \Illuminate\Support\Facades\Log::error('Gagal menyimpan thumbnail produk: '.$fallbackError->getMessage());
                }
            }
        }

        unset($validated['thumbnail']);

        $record = PasarProduct::create([
            ...$validated,
            'user_id' => auth('api')->id(),
            'thumbnail' => $thumbnailPath,
            'kode' => PasarProduct::generateKode(),
            'status_publikasi' => 'Menunggu Moderasi',
        ]);

        return response()->json([
            'kode' => $record->kode,
            'data' => $record->load('reviewer:id,name'),
            'message' => 'Produk berhasil diajukan (thumbnail diproses ke WebP) dan akan ditinjau admin.',
        ], 201);
    }
}
