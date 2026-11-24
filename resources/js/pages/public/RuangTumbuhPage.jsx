import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AlertCircle, CheckCircle2, Eye, History, Send } from 'lucide-react';
import {
    fetchPublicMasterOptions,
    fetchPublicTumbuh,
    resetSubmitState,
    submitTumbuhRequest,
} from '../../store/slices/publicSlice';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import TumbuhRequestDetailModal from '../../components/TumbuhRequestDetailModal';
import { formatDateTime } from '../../utils/format';

const MY_TUMBUH_STORAGE_KEY = 'rt_my_submitted_codes';
const STATUS_OPTIONS = ['Menunggu', 'Disetujui', 'Perlu Perbaikan', 'Selesai', 'Ditolak'];

const INITIAL_FORM = {
    nama: '',
    email: '',
    whatsapp: '',
    sekolah: '',
    bidang_minat: '',
    topik_pendampingan: '',
    kebutuhan_jadwal: '',
};

const BIDANG_OPTIONS = [
    'Persiapan kerja',
    'Pengembangan karier',
    'Pengembangan usaha',
    'Produksi dan kualitas',
    'Legalitas usaha',
    'Branding dan pemasaran',
    'Keuangan usaha',
    'Kemitraan dan akses pasar',
];

function loadMyCodes() {
    try {
        const raw = localStorage.getItem(MY_TUMBUH_STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

export default function RuangTumbuhPage() {
    const dispatch = useDispatch();
    const {
        masterOptions,
        tumbuhRequests,
        loadingTumbuhRequests,
        submitting,
        submitResult,
        submitError,
    } = useSelector((state) => state.publicData);
    const [form, setForm] = useState(INITIAL_FORM);
    const [detailId, setDetailId] = useState(null);
    const [onlyMine, setOnlyMine] = useState(false);
    const [myCodes, setMyCodes] = useState(() => loadMyCodes());

    useEffect(() => {
        dispatch(resetSubmitState());
        dispatch(fetchPublicMasterOptions());
        dispatch(fetchPublicTumbuh());
        return () => dispatch(resetSubmitState());
    }, [dispatch]);

    const detailItem = useMemo(
        () => tumbuhRequests.find((item) => item.id === detailId) || null,
        [tumbuhRequests, detailId]
    );

    const displayedHistory = useMemo(() => {
        if (!onlyMine) return tumbuhRequests;
        return tumbuhRequests.filter((item) => myCodes.includes(item.kode));
    }, [tumbuhRequests, onlyMine, myCodes]);

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await dispatch(submitTumbuhRequest(form));
        if (submitTumbuhRequest.fulfilled.match(res)) {
            setForm(INITIAL_FORM);
            const newKode = res.payload?.kode;
            if (newKode) {
                const updated = [newKode, ...myCodes.filter((c) => c !== newKode)];
                setMyCodes(updated);
                try {
                    localStorage.setItem(MY_TUMBUH_STORAGE_KEY, JSON.stringify(updated));
                } catch {
                    // ignore storage error
                }
            }
        }
    };

    const columns = useMemo(
        () => [
            {
                accessorKey: 'kode',
                header: 'Kode Permintaan',
                cell: ({ row, getValue }) => {
                    const kode = getValue();
                    const isMine = myCodes.includes(kode);
                    return (
                        <div>
                            <div className="flex items-center gap-1.5">
                                <code className="text-xs font-semibold text-[#203880]">{kode}</code>
                                {isMine && (
                                    <span className="px-1.5 py-0.2 rounded bg-[#e0f7f4] text-[#006e5d] text-[10px] font-semibold">
                                        Milik Saya
                                    </span>
                                )}
                            </div>
                            <div className="text-[11px] text-[#64748b]">
                                {formatDateTime(row.original.created_at)}
                            </div>
                        </div>
                    );
                },
            },
            {
                accessorKey: 'nama',
                header: 'Pemohon & Sekolah',
                cell: ({ row }) => (
                    <div>
                        <div className="font-semibold text-[#1e293b]">{row.original.nama}</div>
                        <div className="text-xs text-[#64748b]">{row.original.sekolah}</div>
                    </div>
                ),
            },
            {
                accessorKey: 'bidang_minat',
                header: 'Bidang & Topik Pendampingan',
                cell: ({ row }) => (
                    <div className="max-w-sm">
                        <span className="bs-badge bs-badge-info mb-1">{row.original.bidang_minat}</span>
                        <div className="text-xs font-medium text-[#1e293b]">{row.original.topik_pendampingan}</div>
                    </div>
                ),
            },
            {
                accessorKey: 'status',
                header: 'Status',
                cell: ({ getValue }) => <StatusBadge status={getValue()} />,
            },
            {
                id: 'actions',
                header: 'Detail',
                enableSorting: false,
                cell: ({ row }) => (
                    <button
                        type="button"
                        onClick={() => setDetailId(row.original.id)}
                        className="bs-btn bs-btn-sm bs-btn-outline-primary"
                    >
                        <Eye className="w-3.5 h-3.5" />
                        Lihat Detail
                    </button>
                ),
            },
        ],
        [myCodes]
    );

    return (
        <div className="space-y-6">
            <div className="bs-card">
                <div className="bs-card-header">
                    <div>
                        <h1 className="text-lg font-bold text-[#203880]">Ruang Tumbuh — Permintaan Pendampingan</h1>
                        <p className="text-xs font-normal text-[#64748b]">
                            Ajukan kebutuhan pendampingan atau mentoring untuk meningkatkan kesiapan kerja dan kapasitas
                            usaha.
                        </p>
                    </div>
                </div>

                <div className="bs-card-body">
                    {submitResult && (
                        <div className="bs-alert bs-alert-success mb-4 justify-between items-center flex-wrap">
                            <div className="flex items-start gap-2.5">
                                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                                <div>
                                    <div className="font-semibold">{submitResult.message}</div>
                                    <div className="text-xs mt-1">
                                        Nomor Permintaan:{' '}
                                        <code className="px-1.5 py-0.5 bg-white rounded font-bold">
                                            {submitResult.kode}
                                        </code>
                                    </div>
                                </div>
                            </div>
                            {submitResult.data && (
                                <button
                                    type="button"
                                    onClick={() => setDetailId(submitResult.data.id)}
                                    className="bs-btn bs-btn-sm bs-btn-success"
                                >
                                    <Eye className="w-3.5 h-3.5" />
                                    Lihat Detail & Riwayat
                                </button>
                            )}
                        </div>
                    )}

                    {submitError && (
                        <div className="bs-alert bs-alert-danger mb-4">
                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                            <span>{submitError}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="bs-row">
                            <div className="col-span-12 md:col-span-6">
                                <label className="bs-form-label">Nama Lengkap *</label>
                                <input
                                    name="nama"
                                    value={form.nama}
                                    onChange={handleChange}
                                    required
                                    className="bs-form-control"
                                />
                            </div>
                            <div className="col-span-12 md:col-span-6">
                                <label className="bs-form-label">Email *</label>
                                <input
                                    name="email"
                                    type="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                    className="bs-form-control"
                                />
                            </div>
                            <div className="col-span-12 md:col-span-6">
                                <label className="bs-form-label">Nomor WhatsApp *</label>
                                <input
                                    name="whatsapp"
                                    value={form.whatsapp}
                                    onChange={handleChange}
                                    required
                                    className="bs-form-control"
                                />
                            </div>
                            <div className="col-span-12 md:col-span-6">
                                <label className="bs-form-label">Asal Sekolah *</label>
                                <input
                                    name="sekolah"
                                    value={form.sekolah}
                                    onChange={handleChange}
                                    required
                                    className="bs-form-control"
                                />
                            </div>
                            <div className="col-span-12">
                                <label className="bs-form-label">Bidang Minat *</label>
                                <select
                                    name="bidang_minat"
                                    value={form.bidang_minat}
                                    onChange={handleChange}
                                    required
                                    className="bs-form-select"
                                >
                                    <option value="">Pilih Bidang Minat</option>
                                    {(masterOptions?.bidang_minat || BIDANG_OPTIONS).map((opt) => (
                                        <option key={opt} value={opt}>
                                            {opt}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="bs-form-label">Topik Pendampingan yang Dibutuhkan *</label>
                            <input
                                name="topik_pendampingan"
                                value={form.topik_pendampingan}
                                onChange={handleChange}
                                required
                                placeholder="Contoh: membuat portofolio fotografi dan mencari klien"
                                className="bs-form-control"
                            />
                        </div>

                        <div>
                            <label className="bs-form-label">Jelaskan Kebutuhan atau Jadwal yang Diharapkan *</label>
                            <textarea
                                name="kebutuhan_jadwal"
                                rows="3"
                                value={form.kebutuhan_jadwal}
                                onChange={handleChange}
                                required
                                className="bs-form-control"
                            />
                        </div>

                        <div className="pt-2">
                            <button type="submit" disabled={submitting} className="bs-btn bs-btn-primary">
                                <Send className="w-4 h-4" />
                                {submitting ? 'Mengirim Permintaan...' : 'Kirim Permintaan'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Tabel Riwayat Permintaan Ruang Tumbuh */}
            <div className="bs-card">
                <div className="bs-card-header flex-col sm:flex-row sm:items-center">
                    <div>
                        <h2 className="text-base font-bold text-[#203880] flex items-center gap-2">
                            <History className="w-4 h-4 text-[#0068b0]" />
                            Riwayat & Status Permintaan Ruang Tumbuh
                        </h2>
                        <p className="text-xs font-normal text-[#64748b]">
                            Klik baris data pada tabel untuk melihat detail lengkap dan riwayat pendampingan.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {myCodes.length > 0 && (
                            <div className="inline-flex rounded border border-[#cbd5e1] overflow-hidden text-xs">
                                <button
                                    type="button"
                                    onClick={() => setOnlyMine(false)}
                                    className={`px-2.5 py-1 font-medium cursor-pointer ${
                                        !onlyMine
                                            ? 'bg-[#203880] text-white'
                                            : 'bg-white text-[#475569] hover:bg-[#f8fafd]'
                                    }`}
                                >
                                    Semua ({tumbuhRequests.length})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setOnlyMine(true)}
                                    className={`px-2.5 py-1 font-medium cursor-pointer ${
                                        onlyMine
                                            ? 'bg-[#203880] text-white'
                                            : 'bg-white text-[#475569] hover:bg-[#f8fafd]'
                                    }`}
                                >
                                    Permintaan Saya ({myCodes.length})
                                </button>
                            </div>
                        )}
                        <span className="bs-badge bs-badge-primary">{displayedHistory.length} Permintaan</span>
                    </div>
                </div>

                <div className="bs-card-body">
                    {loadingTumbuhRequests ? (
                        <div className="text-center py-6 text-sm text-[#64748b]">
                            Memuat riwayat permintaan...
                        </div>
                    ) : (
                        <DataTable
                            data={displayedHistory}
                            columns={columns}
                            searchPlaceholder="Cari kode permintaan, nama pemohon, sekolah, topik..."
                            filterColumn="status"
                            filterOptions={STATUS_OPTIONS}
                            emptyText="Belum ada riwayat permintaan yang ditemukan."
                            onRowClick={(row) => setDetailId(row.id)}
                        />
                    )}
                </div>
            </div>

            {detailItem && (
                <TumbuhRequestDetailModal
                    item={detailItem}
                    allItems={tumbuhRequests}
                    onClose={() => setDetailId(null)}
                    onSelectOther={(other) => setDetailId(other.id)}
                    isAdmin={false}
                />
            )}
        </div>
    );
}
