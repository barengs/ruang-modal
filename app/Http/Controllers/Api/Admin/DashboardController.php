<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ModalApplication;
use App\Models\Monitoring;
use App\Models\PasarProduct;
use App\Models\TumbuhRequest;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $months = collect(range(5, 0))->map(fn (int $i) => Carbon::now('Asia/Jakarta')->subMonths($i)->startOfMonth());

        $monthlySeries = [
            [
                'label' => 'Ruang Modal',
                'data' => $months->map(fn (Carbon $m) => [
                    'primary' => $m->translatedFormat('M Y'),
                    'secondary' => ModalApplication::whereBetween('created_at', [$m->copy(), $m->copy()->endOfMonth()])->count(),
                ])->values()->all(),
            ],
            [
                'label' => 'Ruang Tumbuh',
                'data' => $months->map(fn (Carbon $m) => [
                    'primary' => $m->translatedFormat('M Y'),
                    'secondary' => TumbuhRequest::whereBetween('created_at', [$m->copy(), $m->copy()->endOfMonth()])->count(),
                ])->values()->all(),
            ],
            [
                'label' => 'Ruang Pasar',
                'data' => $months->map(fn (Carbon $m) => [
                    'primary' => $m->translatedFormat('M Y'),
                    'secondary' => PasarProduct::whereBetween('created_at', [$m->copy(), $m->copy()->endOfMonth()])->count(),
                ])->values()->all(),
            ],
            [
                'label' => 'Monitoring',
                'data' => $months->map(fn (Carbon $m) => [
                    'primary' => $m->translatedFormat('M Y'),
                    'secondary' => Monitoring::whereBetween('created_at', [$m->copy(), $m->copy()->endOfMonth()])->count(),
                ])->values()->all(),
            ],
        ];

        $modalStatusCounts = ModalApplication::query()
            ->selectRaw('status_seleksi as label, COUNT(*) as total')
            ->groupBy('status_seleksi')
            ->get()
            ->map(fn ($r) => ['primary' => $r->label, 'secondary' => (int) $r->total])
            ->values()
            ->all();

        $pasarCategoryCounts = PasarProduct::query()
            ->selectRaw('kategori as label, COUNT(*) as total')
            ->groupBy('kategori')
            ->orderByDesc('total')
            ->get()
            ->map(fn ($r) => ['primary' => $r->label, 'secondary' => (int) $r->total])
            ->values()
            ->all();

        $modalByJalur = ModalApplication::query()
            ->selectRaw('jalur, COUNT(*) as total, COALESCE(SUM(estimasi_biaya), 0) as total_biaya')
            ->groupBy('jalur')
            ->get()
            ->map(fn ($r) => [
                'jalur' => $r->jalur,
                'total' => (int) $r->total,
                'total_biaya' => (int) $r->total_biaya,
            ])
            ->values()
            ->all();

        return response()->json([
            'counts' => [
                'modal' => ModalApplication::count(),
                'tumbuh' => TumbuhRequest::count(),
                'pasar' => PasarProduct::count(),
                'monitoring' => Monitoring::count(),
                'pasar_tayang' => PasarProduct::where('status_publikasi', 'Tayang')->count(),
                'modal_disetujui' => ModalApplication::where('status_seleksi', 'Disetujui')->count(),
                'total_estimasi_biaya' => (int) ModalApplication::sum('estimasi_biaya'),
                'total_omzet_monitoring' => (int) Monitoring::sum('pendapatan_nominal'),
            ],
            'charts' => [
                'monthly_submissions' => $monthlySeries,
                'modal_by_status' => [
                    [
                        'label' => 'Jumlah Pengajuan',
                        'data' => count($modalStatusCounts) ? $modalStatusCounts : [['primary' => 'Belum ada data', 'secondary' => 0]],
                    ],
                ],
                'pasar_by_category' => [
                    [
                        'label' => 'Produk / Jasa',
                        'data' => count($pasarCategoryCounts) ? $pasarCategoryCounts : [['primary' => 'Belum ada data', 'secondary' => 0]],
                    ],
                ],
                'modal_by_jalur' => $modalByJalur,
            ],
        ]);
    }
}
