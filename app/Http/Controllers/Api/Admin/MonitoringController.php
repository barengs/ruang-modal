<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Monitoring;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MonitoringController extends Controller
{
    public function index(): JsonResponse
    {
        $items = Monitoring::with([
            'user:id,name,email,whatsapp,sekolah,tahun_lulus,kompetensi,nama_usaha',
            'creator:id,name',
        ])
            ->latest('tanggal_pantau')
            ->latest()
            ->get();

        return response()->json([
            'data' => $items,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ref_kode' => ['nullable', 'string', 'max:100'],
            'nama_alumni' => ['required', 'string', 'max:150'],
            'modul' => ['required', 'in:Modal,Tumbuh,Pasar'],
            'tanggal_pantau' => ['required', 'date'],
            'tahap_pantau' => ['nullable', 'string', 'max:100'],
            'pemanfaatan_bantuan' => ['nullable', 'string', 'max:120'],
            'status_produktif' => ['required', 'string', 'max:100'],
            'pendapatan_omzet' => ['nullable', 'string', 'max:100'],
            'pendapatan_nominal' => ['nullable', 'integer', 'min:0'],
            'catatan' => ['nullable', 'string', 'max:2000'],
            'petugas' => ['nullable', 'string', 'max:150'],
        ]);

        $nominal = $validated['pendapatan_nominal'] ?? $this->parseNominal($validated['pendapatan_omzet'] ?? null);

        $record = Monitoring::create([
            ...$validated,
            'kode' => Monitoring::generateKode(),
            'pendapatan_nominal' => $nominal,
            'petugas' => ($validated['petugas'] ?? null) ?: auth('api')->user()?->name,
            'created_by' => auth('api')->id(),
        ]);

        return response()->json([
            'data' => $record->load('creator:id,name'),
            'message' => 'Data monitoring berhasil disimpan.',
        ], 201);
    }

    public function update(Request $request, Monitoring $monitoring): JsonResponse
    {
        $validated = $request->validate([
            'ref_kode' => ['nullable', 'string', 'max:100'],
            'nama_alumni' => ['required', 'string', 'max:150'],
            'modul' => ['required', 'in:Modal,Tumbuh,Pasar'],
            'tanggal_pantau' => ['required', 'date'],
            'tahap_pantau' => ['nullable', 'string', 'max:100'],
            'pemanfaatan_bantuan' => ['nullable', 'string', 'max:120'],
            'status_produktif' => ['required', 'string', 'max:100'],
            'pendapatan_omzet' => ['nullable', 'string', 'max:100'],
            'pendapatan_nominal' => ['nullable', 'integer', 'min:0'],
            'catatan' => ['nullable', 'string', 'max:2000'],
            'petugas' => ['nullable', 'string', 'max:150'],
        ]);

        $nominal = $validated['pendapatan_nominal'] ?? $this->parseNominal($validated['pendapatan_omzet'] ?? null);

        $monitoring->update([
            ...$validated,
            'pendapatan_nominal' => $nominal,
        ]);

        return response()->json([
            'data' => $monitoring->load('creator:id,name'),
            'message' => 'Data monitoring berhasil diperbarui.',
        ]);
    }

    public function destroy(Monitoring $monitoring): JsonResponse
    {
        $monitoring->delete();

        return response()->json([
            'message' => 'Data monitoring berhasil dihapus.',
        ]);
    }

    protected function parseNominal(?string $text): int
    {
        if (! $text) {
            return 0;
        }
        $digits = preg_replace('/\D+/', '', $text);

        return $digits ? (int) $digits : 0;
    }
}
