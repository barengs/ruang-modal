<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\TumbuhRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TumbuhController extends Controller
{
    public function index(): JsonResponse
    {
        $items = TumbuhRequest::with([
            'user:id,name,email,whatsapp,sekolah,tahun_lulus,kompetensi,nama_usaha',
            'reviewer:id,name',
        ])
            ->latest()
            ->get();

        return response()->json([
            'data' => $items,
        ]);
    }

    public function update(Request $request, TumbuhRequest $tumbuh): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:Menunggu,Disetujui,Perlu Perbaikan,Selesai,Ditolak'],
            'catatan_admin' => ['nullable', 'string', 'max:2000'],
        ]);

        $tumbuh->update([
            ...$validated,
            'reviewed_by' => auth('api')->id(),
        ]);

        return response()->json([
            'data' => $tumbuh->load('reviewer:id,name'),
            'message' => 'Status permintaan Ruang Tumbuh berhasil diperbarui.',
        ]);
    }

    public function destroy(TumbuhRequest $tumbuh): JsonResponse
    {
        $tumbuh->delete();

        return response()->json([
            'message' => 'Permintaan Ruang Tumbuh berhasil dihapus.',
        ]);
    }
}
