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
        $items = ModalApplication::with('reviewer:id,name')
            ->latest()
            ->get();

        return response()->json([
            'data' => $items,
        ]);
    }

    public function update(Request $request, ModalApplication $modal): JsonResponse
    {
        $validated = $request->validate([
            'status_seleksi' => ['required', 'in:Menunggu Seleksi,Disetujui,Perlu Perbaikan,Ditolak'],
            'catatan_admin' => ['nullable', 'string', 'max:2000'],
        ]);

        $modal->update([
            ...$validated,
            'reviewed_by' => auth('api')->id(),
        ]);

        return response()->json([
            'data' => $modal->load('reviewer:id,name'),
            'message' => 'Status pengajuan Ruang Modal berhasil diperbarui.',
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
