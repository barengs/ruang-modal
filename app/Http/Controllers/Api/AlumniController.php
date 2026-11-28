<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ModalApplication;
use App\Models\Monitoring;
use App\Models\PasarProduct;
use App\Models\Testimonial;
use App\Models\TumbuhRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AlumniController extends Controller
{
    public function dashboard(): JsonResponse
    {
        /** @var User|null $user */
        $user = auth('api')->user();

        if (! $user) {
            return response()->json([
                'message' => 'Sesi autentikasi telah berakhir. Silakan login kembali.',
            ], 401);
        }

        try {
            $modal = ModalApplication::with(['reviewer:id,name', 'histories'])
                ->where(function ($q) use ($user) {
                    $q->where('user_id', $user->id)
                        ->orWhere('email', $user->email);
                })
                ->latest()
                ->get();

            $tumbuh = TumbuhRequest::with('reviewer:id,name')
                ->where(function ($q) use ($user) {
                    $q->where('user_id', $user->id)
                        ->orWhere('email', $user->email);
                })
                ->latest()
                ->get();

            $pasar = PasarProduct::with('reviewer:id,name')
                ->where(function ($q) use ($user) {
                    $q->where('user_id', $user->id)
                        ->orWhere('email', $user->email);
                })
                ->latest()
                ->get();

            $refKodes = collect()
                ->merge($modal->pluck('kode'))
                ->merge($tumbuh->pluck('kode'))
                ->merge($pasar->pluck('kode'))
                ->filter()
                ->values()
                ->all();

            $monitorings = collect();
            try {
                $monitorings = Monitoring::with('creator:id,name')
                    ->where(function ($q) use ($user, $refKodes) {
                        $q->where('user_id', $user->id)
                            ->orWhere('nama_alumni', $user->name);
                        if (! empty($refKodes)) {
                            $q->orWhereIn('ref_kode', $refKodes);
                        }
                    })
                    ->latest('tanggal_pantau')
                    ->latest()
                    ->get();
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning('Alumni dashboard monitorings fallback: '.$e->getMessage());
            }

            $testimonials = collect();
            try {
                $testimonials = Testimonial::where(function ($q) use ($user) {
                    $q->where('user_id', $user->id)
                        ->orWhere('nama', $user->name);
                })
                    ->latest()
                    ->get();
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning('Alumni dashboard testimonials fallback: '.$e->getMessage());
            }

            return response()->json([
                'summary' => [
                    'modal_total' => $modal->count(),
                    'modal_disetujui' => $modal->where('status_seleksi', 'Disetujui')->count(),
                    'tumbuh_total' => $tumbuh->count(),
                    'pasar_total' => $pasar->count(),
                    'pasar_tayang' => $pasar->where('status_publikasi', 'Tayang')->count(),
                    'monitoring_total' => $monitorings->count(),
                    'latest_omzet' => $monitorings->first()?->pendapatan_nominal ?? 0,
                ],
                'modal' => $modal,
                'tumbuh' => $tumbuh,
                'pasar' => $pasar,
                'monitorings' => $monitorings,
                'testimonials' => $testimonials,
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Alumni Dashboard Error: '.$e->getMessage(), [
                'user_id' => $user->id ?? null,
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Terjadi kendala pada server saat memuat dashboard alumni: '.$e->getMessage(),
            ], 500);
        }
    }

    public function storeMonitoring(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = auth('api')->user();

        $validated = $request->validate([
            'ref_kode' => ['nullable', 'string', 'max:100'],
            'modul' => ['required', 'in:Modal,Tumbuh,Pasar'],
            'tanggal_pantau' => ['required', 'date'],
            'tahap_pantau' => ['nullable', 'string', 'max:100'],
            'pemanfaatan_bantuan' => ['nullable', 'string', 'max:120'],
            'status_produktif' => ['required', 'string', 'max:120'],
            'pendapatan_omzet' => ['nullable', 'string', 'max:100'],
            'pendapatan_nominal' => ['nullable', 'integer', 'min:0'],
            'catatan' => ['required', 'string', 'max:2000'],
        ]);

        $nominal = $validated['pendapatan_nominal'] ?? 0;
        if (! $nominal && ! empty($validated['pendapatan_omzet'])) {
            $digits = preg_replace('/\D+/', '', $validated['pendapatan_omzet']);
            $nominal = $digits ? (int) $digits : 0;
        }

        $record = Monitoring::create([
            'user_id' => $user->id,
            'kode' => Monitoring::generateKode(),
            'ref_kode' => $validated['ref_kode'] ?? null,
            'nama_alumni' => $user->name,
            'modul' => $validated['modul'],
            'tanggal_pantau' => $validated['tanggal_pantau'],
            'tahap_pantau' => $validated['tahap_pantau'] ?? 'Bulan 1-2 (Implementasi)',
            'pemanfaatan_bantuan' => $validated['pemanfaatan_bantuan'] ?? 'Digunakan sesuai tujuan',
            'status_produktif' => $validated['status_produktif'],
            'pendapatan_omzet' => $validated['pendapatan_omzet'] ?? null,
            'pendapatan_nominal' => $nominal,
            'catatan' => $validated['catatan'],
            'petugas' => 'Laporan Mandiri Alumni',
            'created_by' => $user->id,
        ]);

        return response()->json([
            'data' => $record->load('creator:id,name'),
            'message' => 'Laporan perkembangan usaha berhasil disimpan.',
        ], 201);
    }

    public function storeTestimonial(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = auth('api')->user();

        $validated = $request->validate([
            'program' => ['required', 'string', 'max:80'],
            'usaha' => ['required', 'string', 'max:180'],
            'capaian' => ['required', 'string', 'max:180'],
            'kutipan' => ['required', 'string', 'max:1500'],
        ]);

        $record = Testimonial::create([
            'user_id' => $user->id,
            'nama' => $user->name,
            'sekolah' => $user->sekolah ?: 'Alumni SMA Double Track',
            'angkatan' => $user->tahun_lulus ?: '2025',
            'kompetensi' => $user->kompetensi ?: 'Double Track',
            'program' => $validated['program'],
            'usaha' => trim($validated['usaha']),
            'capaian' => trim($validated['capaian']),
            'kutipan' => trim($validated['kutipan']),
            'is_approved' => true,
        ]);

        return response()->json([
            'data' => $record,
            'message' => 'Testimoni Anda berhasil dikirim dan ditampilkan di halaman utama.',
        ], 201);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = auth('api')->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'whatsapp' => ['required', 'string', 'max:40'],
            'sekolah' => ['required', 'string', 'max:180'],
            'tahun_lulus' => ['required', 'string', 'max:10'],
            'kompetensi' => ['required', 'string', 'max:120'],
            'nama_usaha' => ['nullable', 'string', 'max:180'],
        ]);

        $user->update($validated);

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'whatsapp' => $user->whatsapp,
                'sekolah' => $user->sekolah,
                'tahun_lulus' => $user->tahun_lulus,
                'kompetensi' => $user->kompetensi,
                'nama_usaha' => $user->nama_usaha,
                'roles' => $user->getRoleNames()->values()->all(),
                'permissions' => $user->getAllPermissions()->pluck('name')->values()->all(),
                'is_alumni' => true,
            ],
            'message' => 'Profil alumni berhasil diperbarui.',
        ]);
    }
}
