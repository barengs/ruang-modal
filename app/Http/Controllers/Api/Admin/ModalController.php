<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ModalApplication;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ModalController extends Controller
{
    public function index(): JsonResponse
    {
        $items = ModalApplication::with([
            'user:id,name,email,whatsapp,sekolah,tahun_lulus,kompetensi,nama_usaha',
            'reviewer:id,name',
            'histories',
        ])
            ->latest()
            ->get();

        return response()->json([
            'data' => $items,
        ]);
    }

    public function show(ModalApplication $modal): JsonResponse
    {
        $modal->loadMissing([
            'user:id,name,email,whatsapp,sekolah,tahun_lulus,kompetensi,nama_usaha',
            'reviewer:id,name',
            'histories',
        ]);

        return response()->json([
            'data' => $modal,
        ]);
    }

    public function update(Request $request, ModalApplication $modal): JsonResponse
    {
        $validated = $request->validate([
            'status_seleksi' => ['required', 'in:Menunggu Seleksi,Disetujui,Disalurkan,Perlu Perbaikan,Ditolak'],
            'catatan_admin' => ['nullable', 'string', 'max:2000'],
            'skor_kompetensi' => ['nullable', 'integer', 'min:0', 'max:100'],
            'skor_rencana' => ['nullable', 'integer', 'min:0', 'max:100'],
            'skor_kebutuhan' => ['nullable', 'integer', 'min:0', 'max:100'],
            'skor_dampak' => ['nullable', 'integer', 'min:0', 'max:100'],
            'skor_komitmen' => ['nullable', 'integer', 'min:0', 'max:100'],
            'nominal_disetujui' => ['nullable', 'integer', 'min:0'],
            'rincian_bantuan_disalurkan' => ['nullable', 'string', 'max:2000'],
            'nomor_bast' => ['nullable', 'string', 'max:100'],
            'tanggal_penyaluran' => ['nullable', 'date'],
        ]);

        $user = auth('api')->user();
        $skorTotal = ModalApplication::calculateSkorTotal($validated) ?? $modal->skor_total;

        $nomorBast = $validated['nomor_bast'] ?? $modal->nomor_bast;
        $tanggalPenyaluran = $validated['tanggal_penyaluran'] ?? $modal->tanggal_penyaluran?->format('Y-m-d');
        $nominalDisetujui = $validated['nominal_disetujui'] ?? $modal->nominal_disetujui;
        $rincianDisalurkan = $validated['rincian_bantuan_disalurkan'] ?? $modal->rincian_bantuan_disalurkan;

        if (in_array($validated['status_seleksi'], ['Disetujui', 'Disalurkan'], true)) {
            if (! $nominalDisetujui) {
                $nominalDisetujui = $modal->estimasi_biaya;
            }
            if (! $rincianDisalurkan) {
                $rincianDisalurkan = $modal->rincian_kebutuhan;
            }
        }

        if ($validated['status_seleksi'] === 'Disalurkan') {
            if (! $nomorBast) {
                $nomorBast = ModalApplication::generateNomorBast($modal->kode);
            }
            if (! $tanggalPenyaluran) {
                $tanggalPenyaluran = now('Asia/Jakarta')->format('Y-m-d');
            }
        }

        $modal->update([
            ...$validated,
            'skor_total' => $skorTotal,
            'nominal_disetujui' => $nominalDisetujui,
            'rincian_bantuan_disalurkan' => $rincianDisalurkan,
            'nomor_bast' => $nomorBast,
            'tanggal_penyaluran' => $tanggalPenyaluran,
            'reviewed_by' => $user?->id,
        ]);

        $historyNote = ! empty($validated['catatan_admin'])
            ? $validated['catatan_admin']
            : 'Status seleksi diperbarui menjadi '.$validated['status_seleksi'].'.';

        if ($skorTotal !== null) {
            $historyNote .= " (Skor Rubrik: {$skorTotal}/100)";
        }
        if ($validated['status_seleksi'] === 'Disalurkan' && $nomorBast) {
            $historyNote .= " [BAST: {$nomorBast}]";
        }

        $modal->histories()->create([
            'status_seleksi' => $validated['status_seleksi'],
            'catatan' => $historyNote,
            'actor_type' => 'admin',
            'actor_name' => $user?->name ?? 'Admin Pengelola',
        ]);

        return response()->json([
            'data' => $modal->load([
                'user:id,name,email,whatsapp,sekolah,tahun_lulus,kompetensi,nama_usaha',
                'reviewer:id,name',
                'histories',
            ]),
            'message' => 'Data seleksi & penyaluran Ruang Modal berhasil diperbarui.',
        ]);
    }

    public function destroy(ModalApplication $modal): JsonResponse
    {
        $modal->delete();

        return response()->json([
            'message' => 'Pengajuan Ruang Modal berhasil dihapus.',
        ]);
    }
}
