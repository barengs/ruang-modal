import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    Activity,
    AlertCircle,
    Award,
    Briefcase,
    CheckCircle2,
    Eye,
    GraduationCap,
    History,
    LogOut,
    PlusCircle,
    Quote,
    RefreshCw,
    Send,
    Sparkles,
    Store,
    TrendingUp,
    User,
} from 'lucide-react';
import api from '../../api/axios';
import { logoutUser } from '../../store/slices/authSlice';
import CurrencyInput from '../../components/CurrencyInput';
import StatusBadge from '../../components/StatusBadge';
import ModalApplicationDetailModal from '../../components/ModalApplicationDetailModal';
import TumbuhRequestDetailModal from '../../components/TumbuhRequestDetailModal';
import PasarProductDetailModal from '../../components/PasarProductDetailModal';
import MonitoringDetailModal from '../../components/MonitoringDetailModal';
import { formatDateTime, formatRupiah } from '../../utils/format';

export default function AlumniDashboardPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { token, user } = useSelector((state) => state.auth);

    const [activeTab, setActiveTab] = useState('pengajuan');
    const [loading, setLoading] = useState(true);
    const [flash, setFlash] = useState(null);
    const [error, setError] = useState(null);
    const [dashboardData, setDashboardData] = useState({
        summary: {
            modal_total: 0,
            modal_disetujui: 0,
            tumbuh_total: 0,
            pasar_total: 0,
            pasar_tayang: 0,
            monitoring_total: 0,
            latest_omzet: 0,
        },
        modal: [],
        tumbuh: [],
        pasar: [],
        monitorings: [],
        testimonials: [],
    });

    // Selected items for detail modals
    const [selectedModalItem, setSelectedModalItem] = useState(null);
    const [selectedTumbuhItem, setSelectedTumbuhItem] = useState(null);
    const [selectedPasarItem, setSelectedPasarItem] = useState(null);
    const [selectedMonitoringItem, setSelectedMonitoringItem] = useState(null);

    // Form Perkembangan Usaha
    const [monForm, setMonForm] = useState({
        ref_kode: '',
        modul: 'Modal',
        tanggal_pantau: new Date().toISOString().slice(0, 10),
        tahap_pantau: 'Bulan 1-2 (Implementasi)',
        pemanfaatan_bantuan: 'Digunakan sesuai tujuan',
        status_produktif: 'Usaha aktif berkembang',
        pendapatan_omzet: '',
        pendapatan_nominal: '',
        catatan: '',
    });
    const [submittingMon, setSubmittingMon] = useState(false);

    // Form Testimoni
    const [testiForm, setTestiForm] = useState({
        program: 'Penerima Ruang Modal',
        usaha: user?.nama_usaha || '',
        capaian: '',
        kutipan: '',
    });
    const [submittingTesti, setSubmittingTesti] = useState(false);

    const fetchAlumniDashboard = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const { data } = await api.get('/alumni/dashboard');
            setDashboardData(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal memuat data dashboard alumni.');
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchAlumniDashboard();
    }, [fetchAlumniDashboard]);

    const allSubmissionRefs = useMemo(() => {
        const list = [];
        (dashboardData.modal || []).forEach((m) =>
            list.push({ kode: m.kode, modul: 'Modal', label: `${m.kode} — Ruang Modal (${m.jenis_bantuan})` })
        );
        (dashboardData.tumbuh || []).forEach((t) =>
            list.push({ kode: t.kode, modul: 'Tumbuh', label: `${t.kode} — Ruang Tumbuh (${t.bidang_minat})` })
        );
        (dashboardData.pasar || []).forEach((p) =>
            list.push({ kode: p.kode, modul: 'Pasar', label: `${p.kode} — Ruang Pasar (${p.nama_produk})` })
        );
        return list;
    }, [dashboardData]);

    if (!token) {
        return <Navigate to="/login?redirect=/alumni" replace />;
    }

    const handleLogout = async () => {
        await dispatch(logoutUser());
        navigate('/login');
    };

    const handleSubmitMonitoring = async (e) => {
        e.preventDefault();
        setSubmittingMon(true);
        setFlash(null);
        setError(null);
        try {
            const payload = {
                ...monForm,
                pendapatan_nominal: monForm.pendapatan_nominal ? Number(monForm.pendapatan_nominal) : 0,
            };
            const { data } = await api.post('/alumni/monitoring', payload);
            setFlash(data.message);
            setMonForm({
                ref_kode: '',
                modul: 'Modal',
                tanggal_pantau: new Date().toISOString().slice(0, 10),
                status_produktif: 'Usaha aktif berkembang',
                pendapatan_omzet: '',
                pendapatan_nominal: '',
                catatan: '',
            });
            fetchAlumniDashboard();
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal menyimpan laporan perkembangan usaha.');
        } finally {
            setSubmittingMon(false);
        }
    };

    const handleSubmitTestimonial = async (e) => {
        e.preventDefault();
        setSubmittingTesti(true);
        setFlash(null);
        setError(null);
        try {
            const { data } = await api.post('/alumni/testimonials', testiForm);
            setFlash(data.message);
            setTestiForm((prev) => ({ ...prev, capaian: '', kutipan: '' }));
            fetchAlumniDashboard();
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal mengirim testimoni.');
        } finally {
            setSubmittingTesti(false);
        }
    };

    const { summary, modal, tumbuh, pasar, monitorings, testimonials } = dashboardData;

    return (
        <div className="space-y-6">
            {/* Alumni Profile Hero Banner */}
            <div className="bg-gradient-to-r from-[#203880] via-[#0068b0] to-[#1098e0] text-white p-6 md:p-7 shadow-sm border-b-4 border-[#f8a000]">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-start sm:items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-[#f8a000] text-[#17285e] font-bold text-lg flex items-center justify-center shrink-0 shadow-xs">
                            {(user?.name || 'AL')
                                .split(' ')
                                .slice(0, 2)
                                .map((n) => n[0])
                                .join('')}
                        </div>
                        <div className="space-y-1">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-[#ffc010] text-xs font-semibold">
                                <GraduationCap className="w-3.5 h-3.5" />
                                Portal Akun Alumni SMA Double Track
                            </div>
                            <h1 className="text-xl md:text-2xl font-bold leading-tight">{user?.name}</h1>
                            <div className="text-xs sm:text-sm text-[#e6f2ff] flex flex-wrap items-center gap-2">
                                <span>{user?.sekolah || 'Alumni SMA Double Track'}</span>
                                {user?.tahun_lulus && <span>• Lulusan {user.tahun_lulus}</span>}
                                {user?.kompetensi && (
                                    <span className="px-2 py-0.5 rounded bg-white/15 text-white text-xs font-semibold">
                                        {user.kompetensi}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Link
                            to="/ruang-modal"
                            className="bs-btn bs-btn-sm bg-[#f8a000] text-[#17285e] font-semibold hover:bg-[#ffc010]"
                        >
                            <PlusCircle className="w-3.5 h-3.5" />
                            Ajukan Modal
                        </Link>
                        <Link
                            to="/ruang-tumbuh"
                            className="bs-btn bs-btn-sm bg-white/15 text-white border-white/25 hover:bg-white/25"
                        >
                            <PlusCircle className="w-3.5 h-3.5" />
                            Ajukan Mentoring
                        </Link>
                        <Link
                            to="/ruang-pasar"
                            className="bs-btn bs-btn-sm bg-white/15 text-white border-white/25 hover:bg-white/25"
                        >
                            <PlusCircle className="w-3.5 h-3.5" />
                            Daftarkan Produk
                        </Link>
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="bs-btn bs-btn-sm bg-[#e11d48] text-white hover:bg-[#be123c]"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            Keluar
                        </button>
                    </div>
                </div>
            </div>

            {flash && (
                <div className="bs-alert bs-alert-success">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{flash}</span>
                </div>
            )}

            {error && (
                <div className="bs-alert bs-alert-danger">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                </div>
            )}

            {/* 4 KPI Summary Cards */}
            <div className="bs-row">
                <div className="col-span-12 sm:col-span-6 lg:col-span-3">
                    <div className="bs-card">
                        <div className="bs-card-body flex items-center justify-between">
                            <div>
                                <div className="text-xs font-semibold uppercase text-[#64748b]">
                                    Pengajuan Modal
                                </div>
                                <div className="text-2xl font-bold text-[#203880] mt-1">
                                    {summary.modal_total}
                                </div>
                                <div className="text-xs text-[#008a75] mt-0.5">
                                    {summary.modal_disetujui} disetujui
                                </div>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-[#e6f2ff] text-[#203880] flex items-center justify-center">
                                <Briefcase className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-span-12 sm:col-span-6 lg:col-span-3">
                    <div className="bs-card">
                        <div className="bs-card-body flex items-center justify-between">
                            <div>
                                <div className="text-xs font-semibold uppercase text-[#64748b]">
                                    Ruang Tumbuh
                                </div>
                                <div className="text-2xl font-bold text-[#0068b0] mt-1">
                                    {summary.tumbuh_total}
                                </div>
                                <div className="text-xs text-[#64748b] mt-0.5">Permintaan mentoring</div>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-[#e6f2ff] text-[#0068b0] flex items-center justify-center">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-span-12 sm:col-span-6 lg:col-span-3">
                    <div className="bs-card">
                        <div className="bs-card-body flex items-center justify-between">
                            <div>
                                <div className="text-xs font-semibold uppercase text-[#64748b]">
                                    Produk Ruang Pasar
                                </div>
                                <div className="text-2xl font-bold text-[#008a75] mt-1">
                                    {summary.pasar_total}
                                </div>
                                <div className="text-xs text-[#008a75] mt-0.5">
                                    {summary.pasar_tayang} tayang di etalase
                                </div>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-[#e0f7f4] text-[#008a75] flex items-center justify-center">
                                <Store className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-span-12 sm:col-span-6 lg:col-span-3">
                    <div className="bs-card">
                        <div className="bs-card-body flex items-center justify-between">
                            <div>
                                <div className="text-xs font-semibold uppercase text-[#64748b]">
                                    Perkembangan Usaha
                                </div>
                                <div className="text-2xl font-bold text-[#b45309] mt-1">
                                    {summary.monitoring_total}
                                </div>
                                <div className="text-xs text-[#64748b] mt-0.5">
                                    Omzet: {formatRupiah(summary.latest_omzet)}
                                </div>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-[#fff4db] text-[#b45309] flex items-center justify-center">
                                <Activity className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Navigation Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#dbe3f0] pb-3">
                <div className="flex flex-wrap items-center gap-2">
                    {[
                        {
                            key: 'pengajuan',
                            label: 'Dashboard & Perkembangan Ajuan',
                            icon: History,
                            count: modal.length + tumbuh.length + pasar.length,
                        },
                        {
                            key: 'perkembangan',
                            label: 'Isi Perkembangan Usaha',
                            icon: Activity,
                            count: monitorings.length,
                        },
                        {
                            key: 'testimoni',
                            label: 'Isi Testimoni Alumni',
                            icon: Sparkles,
                            count: testimonials.length,
                        },
                    ].map((tab) => {
                        const Icon = tab.icon;
                        const active = activeTab === tab.key;
                        return (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => {
                                    setActiveTab(tab.key);
                                    setFlash(null);
                                    setError(null);
                                }}
                                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded text-xs sm:text-sm font-semibold border transition-colors cursor-pointer ${
                                    active
                                        ? 'bg-[#203880] text-white border-[#203880] shadow-2xs'
                                        : 'bg-white text-[#203880] border-[#dbe3f0] hover:bg-[#eef4ff]'
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span>{tab.label}</span>
                                <span
                                    className={`px-1.5 py-0.5 rounded-full text-[11px] font-bold ${
                                        active
                                            ? 'bg-[#f8a000] text-[#17285e]'
                                            : 'bg-[#e6f2ff] text-[#00528c]'
                                    }`}
                                >
                                    {tab.count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <button
                    type="button"
                    onClick={fetchAlumniDashboard}
                    disabled={loading}
                    className="bs-btn bs-btn-sm bs-btn-outline-primary"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    Segarkan Data
                </button>
            </div>

            {/* TAB 1: DASHBOARD & PERKEMBANGAN AJUAN */}
            {activeTab === 'pengajuan' && (
                <div className="space-y-5">
                    {/* 1. Pengajuan Ruang Modal Saya */}
                    <div className="bs-card">
                        <div className="bs-card-header">
                            <span className="inline-flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-[#0068b0]" />
                                Perkembangan Pengajuan Ruang Modal Saya
                            </span>
                            <Link to="/ruang-modal" className="bs-btn bs-btn-sm bs-btn-primary">
                                + Ajukan Ruang Modal
                            </Link>
                        </div>
                        <div className="bs-card-body">
                            {modal.length === 0 ? (
                                <div className="text-xs text-[#64748b] py-3">
                                    Anda belum memiliki pengajuan Ruang Modal.
                                </div>
                            ) : (
                                <div className="bs-table-responsive">
                                    <table className="bs-table">
                                        <thead>
                                            <tr>
                                                <th>Kode</th>
                                                <th>Tanggal</th>
                                                <th>Jalur &amp; Bantuan</th>
                                                <th>Estimasi</th>
                                                <th>Status Seleksi</th>
                                                <th>Catatan Evaluasi Admin</th>
                                                <th>Detail</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {modal.map((m) => (
                                                <tr
                                                    key={m.id}
                                                    onClick={() => setSelectedModalItem(m)}
                                                    className="cursor-pointer"
                                                >
                                                    <td>
                                                        <code className="text-xs font-semibold text-[#203880]">
                                                            {m.kode}
                                                        </code>
                                                    </td>
                                                    <td className="text-xs text-[#64748b]">
                                                        {formatDateTime(m.created_at)}
                                                    </td>
                                                    <td>
                                                        <span className="bs-badge bs-badge-info mr-1.5">
                                                            {m.jalur}
                                                        </span>
                                                        <span className="text-xs font-medium">
                                                            {m.jenis_bantuan}
                                                        </span>
                                                    </td>
                                                    <td className="font-semibold">
                                                        {formatRupiah(m.estimasi_biaya)}
                                                    </td>
                                                    <td>
                                                        <StatusBadge status={m.status_seleksi} />
                                                    </td>
                                                    <td className="text-xs text-[#475569] max-w-xs">
                                                        {m.catatan_admin || 'Menunggu peninjauan pengelola'}
                                                    </td>
                                                    <td>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedModalItem(m);
                                                            }}
                                                            className="bs-btn bs-btn-sm bs-btn-outline-primary"
                                                        >
                                                            <Eye className="w-3.5 h-3.5" />
                                                            Riwayat
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 2. Permintaan Ruang Tumbuh Saya */}
                    <div className="bs-card">
                        <div className="bs-card-header">
                            <span className="inline-flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-[#008a75]" />
                                Perkembangan Permintaan Pendampingan (Ruang Tumbuh)
                            </span>
                            <Link to="/ruang-tumbuh" className="bs-btn bs-btn-sm bs-btn-primary">
                                + Ajukan Pendampingan
                            </Link>
                        </div>
                        <div className="bs-card-body">
                            {tumbuh.length === 0 ? (
                                <div className="text-xs text-[#64748b] py-3">
                                    Anda belum memiliki permintaan pendampingan Ruang Tumbuh.
                                </div>
                            ) : (
                                <div className="bs-table-responsive">
                                    <table className="bs-table">
                                        <thead>
                                            <tr>
                                                <th>Kode</th>
                                                <th>Tanggal</th>
                                                <th>Bidang Minat &amp; Topik</th>
                                                <th>Status</th>
                                                <th>Catatan Mentor / Admin</th>
                                                <th>Detail</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tumbuh.map((t) => (
                                                <tr
                                                    key={t.id}
                                                    onClick={() => setSelectedTumbuhItem(t)}
                                                    className="cursor-pointer"
                                                >
                                                    <td>
                                                        <code className="text-xs font-semibold text-[#203880]">
                                                            {t.kode}
                                                        </code>
                                                    </td>
                                                    <td className="text-xs text-[#64748b]">
                                                        {formatDateTime(t.created_at)}
                                                    </td>
                                                    <td>
                                                        <span className="bs-badge bs-badge-info mb-1">
                                                            {t.bidang_minat}
                                                        </span>
                                                        <div className="text-xs font-medium">
                                                            {t.topik_pendampingan}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <StatusBadge status={t.status} />
                                                    </td>
                                                    <td className="text-xs text-[#475569] max-w-xs">
                                                        {t.catatan_admin || 'Menunggu penjadwalan mentor'}
                                                    </td>
                                                    <td>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedTumbuhItem(t);
                                                            }}
                                                            className="bs-btn bs-btn-sm bs-btn-outline-primary"
                                                        >
                                                            <Eye className="w-3.5 h-3.5" />
                                                            Detail
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 3. Produk & Jasa Ruang Pasar Saya */}
                    <div className="bs-card">
                        <div className="bs-card-header">
                            <span className="inline-flex items-center gap-2">
                                <Store className="w-4 h-4 text-[#f8a000]" />
                                Perkembangan Pendaftaran Produk &amp; Jasa (Ruang Pasar)
                            </span>
                            <Link to="/ruang-pasar" className="bs-btn bs-btn-sm bs-btn-primary">
                                + Daftarkan Produk
                            </Link>
                        </div>
                        <div className="bs-card-body">
                            {pasar.length === 0 ? (
                                <div className="text-xs text-[#64748b] py-3">
                                    Anda belum mendaftarkan produk atau jasa ke Ruang Pasar.
                                </div>
                            ) : (
                                <div className="bs-table-responsive">
                                    <table className="bs-table">
                                        <thead>
                                            <tr>
                                                <th>Kode</th>
                                                <th>Produk / Jasa</th>
                                                <th>Kategori</th>
                                                <th>Harga</th>
                                                <th>Status Moderasi</th>
                                                <th>Catatan Moderator</th>
                                                <th>Detail</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pasar.map((p) => (
                                                <tr
                                                    key={p.id}
                                                    onClick={() => setSelectedPasarItem(p)}
                                                    className="cursor-pointer"
                                                >
                                                    <td>
                                                        <code className="text-xs font-semibold text-[#203880]">
                                                            {p.kode}
                                                        </code>
                                                    </td>
                                                    <td className="font-semibold text-[#203880]">
                                                        {p.nama_produk}
                                                    </td>
                                                    <td>
                                                        <span className="bs-badge bs-badge-info">
                                                            {p.kategori}
                                                        </span>
                                                    </td>
                                                    <td className="font-semibold text-[#008a75]">
                                                        {p.harga || '-'}
                                                    </td>
                                                    <td>
                                                        <StatusBadge status={p.status_publikasi} />
                                                    </td>
                                                    <td className="text-xs text-[#475569] max-w-xs">
                                                        {p.catatan_admin || '-'}
                                                    </td>
                                                    <td>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedPasarItem(p);
                                                            }}
                                                            className="bs-btn bs-btn-sm bs-btn-outline-primary"
                                                        >
                                                            <Eye className="w-3.5 h-3.5" />
                                                            Detail
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: ISI PERKEMBANGAN USAHA */}
            {activeTab === 'perkembangan' && (
                <div className="bs-row items-start">
                    <div className="col-span-12 lg:col-span-5">
                        <div className="bs-card">
                            <div className="bs-card-header">
                                <span className="inline-flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-[#0068b0]" />
                                    Formulir Laporan Perkembangan Usaha / Karier
                                </span>
                            </div>
                            <div className="bs-card-body">
                                <form onSubmit={handleSubmitMonitoring} className="space-y-3.5">
                                    <div>
                                        <label className="bs-form-label">Terkait Pengajuan (Opsional)</label>
                                        <select
                                            value={monForm.ref_kode}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                const matched = allSubmissionRefs.find((r) => r.kode === val);
                                                setMonForm((prev) => ({
                                                    ...prev,
                                                    ref_kode: val,
                                                    modul: matched ? matched.modul : prev.modul,
                                                }));
                                            }}
                                            className="bs-form-select"
                                        >
                                            <option value="">-- Pilih Kode Pengajuan Terkait --</option>
                                            {allSubmissionRefs.map((ref) => (
                                                <option key={ref.kode} value={ref.kode}>
                                                    {ref.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="bs-row">
                                        <div className="col-span-6">
                                            <label className="bs-form-label">Modul Layanan *</label>
                                            <select
                                                value={monForm.modul}
                                                onChange={(e) =>
                                                    setMonForm((p) => ({ ...p, modul: e.target.value }))
                                                }
                                                className="bs-form-select"
                                            >
                                                <option value="Modal">Ruang Modal</option>
                                                <option value="Tumbuh">Ruang Tumbuh</option>
                                                <option value="Pasar">Ruang Pasar</option>
                                            </select>
                                        </div>
                                        <div className="col-span-6">
                                            <label className="bs-form-label">Tanggal Laporan *</label>
                                            <input
                                                type="date"
                                                required
                                                value={monForm.tanggal_pantau}
                                                onChange={(e) =>
                                                    setMonForm((p) => ({
                                                        ...p,
                                                        tanggal_pantau: e.target.value,
                                                    }))
                                                }
                                                className="bs-form-control"
                                            />
                                        </div>
                                    </div>

                                    <div className="bs-row">
                                        <div className="col-span-12 sm:col-span-6">
                                            <label className="bs-form-label">Tahap Periode Monitoring *</label>
                                            <select
                                                value={monForm.tahap_pantau}
                                                onChange={(e) =>
                                                    setMonForm((p) => ({
                                                        ...p,
                                                        tahap_pantau: e.target.value,
                                                    }))
                                                }
                                                className="bs-form-select"
                                            >
                                                <option value="Bulan 1-2 (Implementasi)">
                                                    Bulan 1-2 (Implementasi)
                                                </option>
                                                <option value="Bulan 3-4 (Produktivitas & Pemasaran)">
                                                    Bulan 3-4 (Produktivitas &amp; Pemasaran)
                                                </option>
                                                <option value="Bulan 5-6 (Evaluasi & Keberlanjutan)">
                                                    Bulan 5-6 (Evaluasi &amp; Keberlanjutan)
                                                </option>
                                            </select>
                                        </div>
                                        <div className="col-span-12 sm:col-span-6">
                                            <label className="bs-form-label">Pemanfaatan Alat / Bantuan *</label>
                                            <select
                                                value={monForm.pemanfaatan_bantuan}
                                                onChange={(e) =>
                                                    setMonForm((p) => ({
                                                        ...p,
                                                        pemanfaatan_bantuan: e.target.value,
                                                    }))
                                                }
                                                className="bs-form-select"
                                            >
                                                <option value="Digunakan sesuai tujuan">
                                                    Digunakan sesuai tujuan
                                                </option>
                                                <option value="Digunakan sebagian">Digunakan sebagian</option>
                                                <option value="Belum optimal / kendala teknis">
                                                    Belum optimal / kendala teknis
                                                </option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="bs-form-label">Status Perkembangan Usaha / Kerja *</label>
                                        <select
                                            value={monForm.status_produktif}
                                            onChange={(e) =>
                                                setMonForm((p) => ({
                                                    ...p,
                                                    status_produktif: e.target.value,
                                                }))
                                            }
                                            className="bs-form-select"
                                        >
                                            <option value="Usaha aktif berkembang">Usaha aktif berkembang</option>
                                            <option value="Pesanan meningkat dari Etalase">
                                                Pesanan meningkat dari Etalase
                                            </option>
                                            <option value="Bekerja & usaha sampingan aktif">
                                                Bekerja &amp; usaha sampingan aktif
                                            </option>
                                            <option value="Tahap persiapan produksi awal">
                                                Tahap persiapan produksi awal
                                            </option>
                                            <option value="Butuh pendampingan lanjutan">
                                                Butuh pendampingan lanjutan
                                            </option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="bs-form-label">
                                            Pendapatan / Omzet Bulanan Saat Ini (Rp) *
                                        </label>
                                        <CurrencyInput
                                            name="pendapatan_omzet"
                                            value={monForm.pendapatan_omzet}
                                            onChange={(e) =>
                                                setMonForm((prev) => ({
                                                    ...prev,
                                                    pendapatan_omzet: e.target.value,
                                                    pendapatan_nominal: e.target.rawDigits || '',
                                                }))
                                            }
                                            placeholder="4.500.000"
                                            mode="rupiah"
                                            suffix="/ bulan"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="bs-form-label">
                                            Catatan Perkembangan Usaha / Pemanfaatan Bantuan *
                                        </label>
                                        <textarea
                                            rows="3"
                                            required
                                            value={monForm.catatan}
                                            onChange={(e) =>
                                                setMonForm((p) => ({ ...p, catatan: e.target.value }))
                                            }
                                            placeholder="Ceritakan perkembangan omzet, jumlah pesanan, pemanfaatan alat bantuan, atau kendala usaha Anda..."
                                            className="bs-form-control"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={submittingMon}
                                        className="bs-btn bs-btn-primary w-full"
                                    >
                                        <Send className="w-4 h-4" />
                                        {submittingMon ? 'Menyimpan Laporan...' : 'Kirim Laporan Perkembangan'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                    <div className="col-span-12 lg:col-span-7">
                        <div className="bs-card">
                            <div className="bs-card-header">
                                <span>Riwayat Laporan Perkembangan Usaha Saya</span>
                                <span className="bs-badge bs-badge-primary">{monitorings.length} Laporan</span>
                            </div>
                            <div className="bs-card-body">
                                {monitorings.length === 0 ? (
                                    <div className="text-xs text-[#64748b] py-4 text-center">
                                        Belum ada catatan perkembangan usaha. Silakan isi formulir di samping untuk
                                        melaporkan perkembangan usaha Anda.
                                    </div>
                                ) : (
                                    <div className="bs-table-responsive">
                                        <table className="bs-table">
                                            <thead>
                                                <tr>
                                                    <th>Kode</th>
                                                    <th>Tanggal</th>
                                                    <th>Modul &amp; Ref</th>
                                                    <th>Status Produktif</th>
                                                    <th>Omzet</th>
                                                    <th>Catatan</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {monitorings.map((mon) => (
                                                    <tr
                                                        key={mon.id}
                                                        onClick={() => setSelectedMonitoringItem(mon)}
                                                        className="cursor-pointer"
                                                    >
                                                        <td>
                                                            <code className="text-xs font-semibold text-[#203880]">
                                                                {mon.kode}
                                                            </code>
                                                        </td>
                                                        <td className="text-xs">{mon.tanggal_pantau}</td>
                                                        <td className="text-xs">
                                                            <span className="bs-badge bs-badge-info mr-1">
                                                                {mon.modul}
                                                            </span>
                                                            {mon.ref_kode || '-'}
                                                        </td>
                                                        <td>
                                                            <span className="bs-badge bs-badge-success">
                                                                {mon.status_produktif}
                                                            </span>
                                                        </td>
                                                        <td className="font-semibold text-[#008a75] text-xs">
                                                            {mon.pendapatan_omzet ||
                                                                formatRupiah(mon.pendapatan_nominal)}
                                                        </td>
                                                        <td className="text-xs text-[#475569] max-w-[180px] truncate">
                                                            {mon.catatan}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 3: ISI TESTIMONI ALUMNI */}
            {activeTab === 'testimoni' && (
                <div className="bs-row items-start">
                    <div className="col-span-12 lg:col-span-5">
                        <div className="bs-card">
                            <div className="bs-card-header">
                                <span className="inline-flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-[#f8a000]" />
                                    Tulis Testimoni Penerima Manfaat
                                </span>
                            </div>
                            <div className="bs-card-body">
                                <form onSubmit={handleSubmitTestimonial} className="space-y-3.5">
                                    <div>
                                        <label className="bs-form-label">Program yang Diikuti *</label>
                                        <select
                                            value={testiForm.program}
                                            onChange={(e) =>
                                                setTestiForm((p) => ({ ...p, program: e.target.value }))
                                            }
                                            className="bs-form-select"
                                        >
                                            <option value="Penerima Ruang Modal">Penerima Ruang Modal</option>
                                            <option value="Alumni Ruang Tumbuh">Alumni Ruang Tumbuh</option>
                                            <option value="Alumni Ruang Pasar">Alumni Ruang Pasar</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="bs-form-label">Nama Usaha / Pekerjaan Anda *</label>
                                        <input
                                            type="text"
                                            required
                                            value={testiForm.usaha}
                                            onChange={(e) =>
                                                setTestiForm((p) => ({ ...p, usaha: e.target.value }))
                                            }
                                            placeholder="Contoh: Dapur Rina — Bakery & Kue Kering"
                                            className="bs-form-control"
                                        />
                                    </div>

                                    <div>
                                        <label className="bs-form-label">
                                            Highlight Capaian / Dampak Utama *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={testiForm.capaian}
                                            onChange={(e) =>
                                                setTestiForm((p) => ({ ...p, capaian: e.target.value }))
                                            }
                                            placeholder="Contoh: Omzet Rp4.800.000 / bulan atau NIB & Halal Terbit"
                                            className="bs-form-control"
                                        />
                                    </div>

                                    <div>
                                        <label className="bs-form-label">Kisah &amp; Testimoni Anda *</label>
                                        <textarea
                                            rows="4"
                                            required
                                            value={testiForm.kutipan}
                                            onChange={(e) =>
                                                setTestiForm((p) => ({ ...p, kutipan: e.target.value }))
                                            }
                                            placeholder="Ceritakan pengalaman Anda mendapatkan fasilitasi Ruang Modal atau pendampingan Ruang Tumbuh dari SMA Double Track..."
                                            className="bs-form-control"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={submittingTesti}
                                        className="bs-btn bs-btn-primary w-full"
                                    >
                                        <Send className="w-4 h-4" />
                                        {submittingTesti ? 'Mengirim Testimoni...' : 'Publikasikan Testimoni'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                    <div className="col-span-12 lg:col-span-7">
                        <div className="bs-card">
                            <div className="bs-card-header">
                                <span>Testimoni yang Saya Bagikan</span>
                                <span className="bs-badge bs-badge-primary">{testimonials.length} Testimoni</span>
                            </div>
                            <div className="bs-card-body space-y-3">
                                {testimonials.length === 0 ? (
                                    <div className="text-xs text-[#64748b] py-4 text-center">
                                        Anda belum membagikan testimoni. Testimoni yang Anda kirimkan akan tampil pada
                                        slider kisah sukses di halaman utama.
                                    </div>
                                ) : (
                                    testimonials.map((item) => (
                                        <div
                                            key={item.id}
                                            className="p-4 rounded-md border border-[#dbe3f0] bg-[#fbfcff] space-y-2.5"
                                        >
                                            <div className="flex items-center justify-between gap-2 flex-wrap">
                                                <span className="bs-badge bs-badge-info">{item.program}</span>
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#fff4db] text-[#9a5b00] text-xs font-bold">
                                                    <Award className="w-3.5 h-3.5 text-[#f8a000]" />
                                                    {item.capaian}
                                                </span>
                                            </div>
                                            <div className="relative pl-6">
                                                <Quote className="w-4 h-4 text-[#0068b0]/40 absolute left-0 top-0.5" />
                                                <p className="text-xs sm:text-sm text-[#1e293b] italic leading-relaxed">
                                                    &ldquo;{item.kutipan}&rdquo;
                                                </p>
                                            </div>
                                            <div className="text-xs text-[#64748b] pt-2 border-t border-[#eef2f9] flex items-center justify-between">
                                                <span>
                                                    <strong className="text-[#203880]">{item.usaha}</strong> •{' '}
                                                    {item.sekolah} ({item.angkatan})
                                                </span>
                                                <span>{formatDateTime(item.created_at)}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Detail Modals */}
            {selectedModalItem && (
                <ModalApplicationDetailModal
                    item={selectedModalItem}
                    allItems={modal}
                    onClose={() => setSelectedModalItem(null)}
                    onSelectOther={(other) => setSelectedModalItem(other)}
                    isAdmin={false}
                />
            )}

            {selectedTumbuhItem && (
                <TumbuhRequestDetailModal
                    item={selectedTumbuhItem}
                    allItems={tumbuh}
                    onClose={() => setSelectedTumbuhItem(null)}
                    onSelectOther={(other) => setSelectedTumbuhItem(other)}
                    isAdmin={false}
                />
            )}

            {selectedPasarItem && (
                <PasarProductDetailModal
                    item={selectedPasarItem}
                    allItems={pasar}
                    onClose={() => setSelectedPasarItem(null)}
                    onSelectOther={(other) => setSelectedPasarItem(other)}
                    isAdmin={false}
                />
            )}

            {selectedMonitoringItem && (
                <MonitoringDetailModal
                    item={selectedMonitoringItem}
                    allItems={monitorings}
                    onClose={() => setSelectedMonitoringItem(null)}
                    onSelectOther={(other) => setSelectedMonitoringItem(other)}
                />
            )}
        </div>
    );
}
