<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ModalApplication;
use App\Models\Monitoring;
use App\Models\PasarProduct;
use App\Models\TumbuhRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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

    public function submitModal(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nama' => ['required', 'string', 'max:150'],
            'email' => ['required', 'email', 'max:150'],
            'whatsapp' => ['required', 'string', 'max:40'],
            'sekolah' => ['required', 'string', 'max:180'],
            'tahun_lulus' => ['required', 'string', 'max:10'],
            'kompetensi' => ['required', 'string', 'max:120'],
            'jalur' => ['required', 'in:Kerja,Usaha'],
            'status_aktivitas' => ['nullable', 'string', 'max:80'],
            'jenis_bantuan' => ['required', 'string', 'max:80'],
            'rincian_kebutuhan' => ['required', 'string', 'max:2000'],
            'estimasi_biaya' => ['nullable', 'integer', 'min:0'],
            'rencana_deskripsi' => ['required', 'string', 'max:3000'],
        ]);

        $record = ModalApplication::create([
            ...$validated,
            'kode' => ModalApplication::generateKode(),
            'estimasi_biaya' => $validated['estimasi_biaya'] ?? 0,
            'status_seleksi' => 'Menunggu Seleksi',
        ]);

        return response()->json([
            'kode' => $record->kode,
            'data' => $record,
            'message' => 'Pengajuan Ruang Modal berhasil dikirim. Simpan nomor pengajuan Anda.',
        ], 201);
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
            'kode' => TumbuhRequest::generateKode(),
            'status' => 'Menunggu',
        ]);

        return response()->json([
            'kode' => $record->kode,
            'data' => $record,
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
            'deskripsi' => ['required', 'string', 'max:2000'],
            'harga' => ['nullable', 'string', 'max:100'],
            'kontak_link' => ['required', 'string', 'max:500'],
        ]);

        $record = PasarProduct::create([
            ...$validated,
            'kode' => PasarProduct::generateKode(),
            'status_publikasi' => 'Menunggu Moderasi',
        ]);

        return response()->json([
            'kode' => $record->kode,
            'data' => $record,
            'message' => 'Produk berhasil diajukan dan akan ditinjau admin sebelum ditampilkan.',
        ], 201);
    }
}
