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
            'dokumen_lampiran' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:5120'],
        ]);

        $lampiranPath = null;
        if ($request->hasFile('dokumen_lampiran') && $request->file('dokumen_lampiran')->isValid()) {
            $file = $request->file('dokumen_lampiran');
            $uploadDir = public_path('uploads/modal');
            if (! is_dir($uploadDir)) {
                @mkdir($uploadDir, 0775, true);
            }

            $ext = strtolower($file->getClientOriginalExtension());
            $randomSuffix = strtolower(Str::random(8));
            $timestamp = now('Asia/Jakarta')->format('YmdHis');

            try {
                if (in_array($ext, ['jpg', 'jpeg', 'png', 'webp'])) {
                    $filename = "lampiran-modal-{$timestamp}-{$randomSuffix}.webp";
                    $fullPath = $uploadDir.DIRECTORY_SEPARATOR.$filename;

                    $manager = ImageManager::usingDriver(Driver::class);
                    $image = $manager->decodePath($file->getRealPath());
                    $image->scaleDown(1200, 1200);
                    $image->encodeUsingFileExtension('webp', quality: 85)->save($fullPath);
                    $lampiranPath = '/uploads/modal/'.$filename;
                } else {
                    $filename = "proposal-modal-{$timestamp}-{$randomSuffix}.{$ext}";
                    $file->move($uploadDir, $filename);
                    $lampiranPath = '/uploads/modal/'.$filename;
                }
            } catch (\Throwable $e) {
                // Fallback: jika pemrosesan WebP/GD gagal, simpan file original langsung
                try {
                    $fallbackFilename = "lampiran-modal-{$timestamp}-{$randomSuffix}.{$ext}";
                    $file->move($uploadDir, $fallbackFilename);
                    $lampiranPath = '/uploads/modal/'.$fallbackFilename;
                } catch (\Throwable $fallbackError) {
                    \Illuminate\Support\Facades\Log::error('Gagal menyimpan dokumen lampiran modal: '.$fallbackError->getMessage());
                    $lampiranPath = null;
                }
            }
        }

        unset($validated['dokumen_lampiran']);

        $record = ModalApplication::create([
            ...$validated,
            'user_id' => auth('api')->id(),
            'kode' => ModalApplication::generateKode(),
            'estimasi_biaya' => $validated['estimasi_biaya'] ?? 0,
            'komitmen_pendampingan' => filter_var($request->input('komitmen_pendampingan', true), FILTER_VALIDATE_BOOLEAN),
            'dokumen_lampiran' => $lampiranPath,
            'status_seleksi' => 'Menunggu Seleksi',
        ]);

        $record->histories()->create([
            'status_seleksi' => 'Menunggu Seleksi',
            'catatan' => 'Pengajuan Ruang Modal dikirim oleh pemohon beserta komitmen pendampingan.',
            'actor_type' => 'pemohon',
            'actor_name' => $record->nama,
        ]);

        return response()->json([
            'kode' => $record->kode,
            'data' => $record->load(['reviewer:id,name', 'histories']),
            'message' => 'Pengajuan Ruang Modal berhasil dikirim. Simpan nomor pengajuan Anda.',
        ], 201);
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
