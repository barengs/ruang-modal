<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\PasarProduct;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PasarController extends Controller
{
    public function index(): JsonResponse
    {
        $items = PasarProduct::with([
            'user:id,name,email,whatsapp,sekolah,tahun_lulus,kompetensi,nama_usaha',
            'reviewer:id,name',
        ])
            ->latest()
            ->get();

        return response()->json([
            'data' => $items,
        ]);
    }

    public function update(Request $request, PasarProduct $pasar): JsonResponse
    {
        $validated = $request->validate([
            'status_publikasi' => ['required', 'in:Menunggu Moderasi,Tayang,Perlu Perbaikan,Ditolak'],
            'catatan_admin' => ['nullable', 'string', 'max:2000'],
        ]);

        $pasar->update([
            ...$validated,
            'reviewed_by' => auth('api')->id(),
        ]);

        return response()->json([
            'data' => $pasar->load('reviewer:id,name'),
            'message' => 'Status publikasi produk Ruang Pasar berhasil diperbarui.',
        ]);
    }

    public function destroy(PasarProduct $pasar): JsonResponse
    {
        $pasar->delete();

        return response()->json([
            'message' => 'Produk Ruang Pasar berhasil dihapus.',
        ]);
    }
}
