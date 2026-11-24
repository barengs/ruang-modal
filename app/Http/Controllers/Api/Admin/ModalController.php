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
        $items = ModalApplication::with(['reviewer:id,name', 'histories'])
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

        $user = auth('api')->user();

        $modal->update([
            ...$validated,
            'reviewed_by' => $user?->id,
        ]);

        $modal->histories()->create([
            'status_seleksi' => $validated['status_seleksi'],
            'catatan' => ! empty($validated['catatan_admin'])
                ? $validated['catatan_admin']
                : 'Status seleksi diperbarui menjadi '.$validated['status_seleksi'].'.',
            'actor_type' => 'admin',
            'actor_name' => $user?->name ?? 'Admin Pengelola',
        ]);

        return response()->json([
            'data' => $modal->load(['reviewer:id,name', 'histories']),
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
