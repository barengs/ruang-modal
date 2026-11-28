<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ModalApplication;
use App\Models\Monitoring;
use App\Models\PasarProduct;
use App\Models\TumbuhRequest;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        try {
            $months = collect(range(5, 0))->map(fn (int $i) => Carbon::now('Asia/Jakarta')->subMonths($i)->startOfMonth());

            $monthlySeries = [
                [
                    'label' => 'Ruang Modal',
                    'data' => $months->map(fn (Carbon $m) => [
                        'primary' => $m->translatedFormat('M Y'),
                        'secondary' => DB::table('modal_applications')->whereBetween('created_at', [$m->copy(), $m->copy()->endOfMonth()])->count(),
                    ])->values()->all(),
                ],
                [
                    'label' => 'Ruang Tumbuh',
                    'data' => $months->map(fn (Carbon $m) => [
                        'primary' => $m->translatedFormat('M Y'),
                        'secondary' => DB::table('tumbuh_requests')->whereBetween('created_at', [$m->copy(), $m->copy()->endOfMonth()])->count(),
                    ])->values()->all(),
                ],
                [
                    'label' => 'Ruang Pasar',
                    'data' => $months->map(fn (Carbon $m) => [
                        'primary' => $m->translatedFormat('M Y'),
                        'secondary' => DB::table('pasar_products')->whereBetween('created_at', [$m->copy(), $m->copy()->endOfMonth()])->count(),
                    ])->values()->all(),
                ],
                [
                    'label' => 'Monitoring',
                    'data' => $months->map(fn (Carbon $m) => [
                        'primary' => $m->translatedFormat('M Y'),
                        'secondary' => DB::table('monitorings')->whereBetween('created_at', [$m->copy(), $m->copy()->endOfMonth()])->count(),
                    ])->values()->all(),
                ],
            ];

            $modalStatusCounts = DB::table('modal_applications')
                ->selectRaw('status_seleksi as label, COUNT(*) as total')
                ->groupBy('status_seleksi')
                ->get()
                ->map(fn ($r) => ['primary' => $r->label, 'secondary' => (int) $r->total])
                ->values()
                ->all();

            $pasarCategoryCounts = DB::table('pasar_products')
                ->selectRaw('kategori as label, COUNT(*) as total')
                ->groupBy('kategori')
                ->orderByDesc('total')
                ->get()
                ->map(fn ($r) => ['primary' => $r->label, 'secondary' => (int) $r->total])
                ->values()
                ->all();

            $modalByJalur = DB::table('modal_applications')
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
                    'modal' => DB::table('modal_applications')->count(),
                    'tumbuh' => DB::table('tumbuh_requests')->count(),
                    'pasar' => DB::table('pasar_products')->count(),
                    'monitoring' => DB::table('monitorings')->count(),
                    'pasar_tayang' => DB::table('pasar_products')->where('status_publikasi', 'Tayang')->count(),
                    'modal_disetujui' => DB::table('modal_applications')->where('status_seleksi', 'Disetujui')->count(),
                    'total_estimasi_biaya' => (int) DB::table('modal_applications')->sum('estimasi_biaya'),
                    'total_omzet_monitoring' => (int) DB::table('monitorings')->sum('pendapatan_nominal'),
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
        } catch (\Throwable $e) {
            Log::error('Admin Dashboard Error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Terjadi kendala pada server saat memuat dashboard admin: ' . $e->getMessage(),
            ], 500);
        }
    }
}
