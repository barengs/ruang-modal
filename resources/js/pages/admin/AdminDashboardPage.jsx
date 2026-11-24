import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Activity, Briefcase, RefreshCw, Store, TrendingUp, Wallet } from 'lucide-react';
import { fetchDashboard } from '../../store/slices/adminSlice';
import AnalyticsChart from '../../components/AnalyticsChart';
import { formatRupiah } from '../../utils/format';

export default function AdminDashboardPage() {
    const dispatch = useDispatch();
    const { dashboard, loading, error } = useSelector((state) => state.admin);

    useEffect(() => {
        dispatch(fetchDashboard());
    }, [dispatch]);

    const counts = dashboard?.counts || {
        modal: 0,
        tumbuh: 0,
        pasar: 0,
        monitoring: 0,
        pasar_tayang: 0,
        modal_disetujui: 0,
        total_estimasi_biaya: 0,
        total_omzet_monitoring: 0,
    };

    const charts = dashboard?.charts || {};

    return (
        <div className="space-y-5">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                    <h1 className="text-xl font-bold text-[#203880]">Dashboard Ekosistem Alumni</h1>
                    <p className="text-xs text-[#6c757d]">
                        Ringkasan statistik & analitik visual berbasis TanStack Chart.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => dispatch(fetchDashboard())}
                    disabled={loading}
                    className="bs-btn bs-btn-sm bs-btn-outline-primary"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    Muat Ulang Data
                </button>
            </div>

            {error && <div className="bs-alert bs-alert-danger">{error}</div>}

            {/* KPI Cards (Bootstrap 4-column Row) */}
            <div className="bs-row">
                <div className="col-span-12 sm:col-span-6 xl:col-span-3">
                    <div className="bs-card">
                        <div className="bs-card-body flex items-center justify-between">
                            <div>
                                <div className="text-xs font-semibold uppercase text-[#6c757d]">Ruang Modal</div>
                                <div className="text-2xl font-bold text-[#203880] mt-1">{counts.modal}</div>
                                <div className="text-xs text-[#198754] mt-0.5">
                                    {counts.modal_disetujui} disetujui
                                </div>
                            </div>
                            <div className="w-13 h-13 rounded-full bg-[#e7f1ff] text-[#203880] flex items-center justify-center shrink-0">
                                <Briefcase className="w-7 h-7" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-span-12 sm:col-span-6 xl:col-span-3">
                    <div className="bs-card">
                        <div className="bs-card-body flex items-center justify-between">
                            <div>
                                <div className="text-xs font-semibold uppercase text-[#6c757d]">Ruang Tumbuh</div>
                                <div className="text-2xl font-bold text-[#0068b0] mt-1">{counts.tumbuh}</div>
                                <div className="text-xs text-[#6c757d] mt-0.5">Permintaan mentoring</div>
                            </div>
                            <div className="w-13 h-13 rounded-full bg-[#e7f1ff] text-[#0068b0] flex items-center justify-center shrink-0">
                                <TrendingUp className="w-7 h-7" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-span-12 sm:col-span-6 xl:col-span-3">
                    <div className="bs-card">
                        <div className="bs-card-body flex items-center justify-between">
                            <div>
                                <div className="text-xs font-semibold uppercase text-[#6c757d]">Ruang Pasar</div>
                                <div className="text-2xl font-bold text-[#198754] mt-1">{counts.pasar}</div>
                                <div className="text-xs text-[#198754] mt-0.5">{counts.pasar_tayang} tayang publik</div>
                            </div>
                            <div className="w-13 h-13 rounded-full bg-[#d1e7dd] text-[#198754] flex items-center justify-center shrink-0">
                                <Store className="w-7 h-7" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-span-12 sm:col-span-6 xl:col-span-3">
                    <div className="bs-card">
                        <div className="bs-card-body flex items-center justify-between">
                            <div>
                                <div className="text-xs font-semibold uppercase text-[#6c757d]">Monitoring</div>
                                <div className="text-2xl font-bold text-[#b45309] mt-1">{counts.monitoring}</div>
                                <div className="text-xs text-[#6c757d] mt-0.5">
                                    Omzet: {formatRupiah(counts.total_omzet_monitoring)}
                                </div>
                            </div>
                            <div className="w-13 h-13 rounded-full bg-[#fff3cd] text-[#b45309] flex items-center justify-center shrink-0">
                                <Activity className="w-7 h-7" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* TanStack Charts Section */}
            <div className="bs-row">
                <div className="col-span-12 lg:col-span-8">
                    <div className="bs-card h-full">
                        <div className="bs-card-header">
                            <span>Tren Data Masuk 6 Bulan Terakhir</span>
                            <span className="bs-badge bs-badge-info">TanStack Chart</span>
                        </div>
                        <div className="bs-card-body">
                            <AnalyticsChart
                                series={charts.monthly_submissions || []}
                                elementType="bar"
                                height={290}
                            />
                        </div>
                    </div>
                </div>

                <div className="col-span-12 lg:col-span-4">
                    <div className="bs-card h-full">
                        <div className="bs-card-header">
                            <span className="inline-flex items-center gap-1.5">
                                <Wallet className="w-4 h-4 text-[#0068b0]" />
                                Estimasi Kebutuhan Modal
                            </span>
                        </div>
                        <div className="bs-card-body space-y-4">
                            <div className="p-3.5 rounded bg-[#f8f9fa] border border-[#dee2e6]">
                                <div className="text-xs text-[#6c757d]">Total Estimasi Pengajuan</div>
                                <div className="text-xl font-bold text-[#203880] mt-1">
                                    {formatRupiah(counts.total_estimasi_biaya)}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="text-xs font-semibold uppercase text-[#6c757d]">
                                    Rincian per Jalur
                                </div>
                                {(charts.modal_by_jalur || []).map((row) => (
                                    <div
                                        key={row.jalur}
                                        className="flex items-center justify-between p-2.5 rounded border border-[#dee2e6] bg-white text-sm"
                                    >
                                        <div>
                                            <div className="font-semibold text-[#203880]">Jalur {row.jalur}</div>
                                            <div className="text-xs text-[#6c757d]">{row.total} pengajuan</div>
                                        </div>
                                        <div className="font-bold text-[#198754]">
                                            {formatRupiah(row.total_biaya)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bs-row">
                <div className="col-span-12 lg:col-span-6">
                    <div className="bs-card">
                        <div className="bs-card-header">
                            <span>Distribusi Status Ruang Modal</span>
                            <span className="bs-badge bs-badge-secondary">Bar Chart</span>
                        </div>
                        <div className="bs-card-body">
                            <AnalyticsChart
                                series={charts.modal_by_status || []}
                                elementType="bar"
                                height={240}
                                colors={['#0068b0']}
                            />
                        </div>
                    </div>
                </div>

                <div className="col-span-12 lg:col-span-6">
                    <div className="bs-card">
                        <div className="bs-card-header">
                            <span>Distribusi Kategori Ruang Pasar</span>
                            <span className="bs-badge bs-badge-secondary">Bar Chart</span>
                        </div>
                        <div className="bs-card-body">
                            <AnalyticsChart
                                series={charts.pasar_by_category || []}
                                elementType="bar"
                                height={240}
                                colors={['#198754']}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
