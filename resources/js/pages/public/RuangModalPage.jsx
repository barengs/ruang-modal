import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AlertCircle, CheckCircle2, Eye, History, Send } from 'lucide-react';
import {
    fetchPublicMasterOptions,
    fetchPublicModal,
    resetSubmitState,
    submitModalApplication,
} from '../../store/slices/publicSlice';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import CurrencyInput from '../../components/CurrencyInput';
import ModalApplicationDetailModal from '../../components/ModalApplicationDetailModal';
import { formatDateTime, formatRupiah } from '../../utils/format';

const MY_CODES_STORAGE_KEY = 'rm_my_submitted_codes';
const STATUS_OPTIONS = ['Menunggu Seleksi', 'Disetujui', 'Perlu Perbaikan', 'Ditolak'];

const INITIAL_FORM = {
    nama: '',
    email: '',
    whatsapp: '',
    sekolah: '',
    tahun_lulus: '',
    kompetensi: '',
    jalur: '',
    status_aktivitas: 'Belum bekerja',
    jenis_bantuan: '',
    estimasi_biaya: '',
    rincian_kebutuhan: '',
    rencana_deskripsi: '',
};

function loadMyCodes() {
    try {
        const raw = localStorage.getItem(MY_CODES_STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

export default function RuangModalPage() {
    const dispatch = useDispatch();
    const {
        masterOptions,
        modalApplications,
        loadingModalApplications,
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
        dispatch(fetchPublicModal());
        return () => dispatch(resetSubmitState());
    }, [dispatch]);

    const detailItem = useMemo(
        () => modalApplications.find((item) => item.id === detailId) || null,
        [modalApplications, detailId]
    );

    const displayedHistory = useMemo(() => {
        if (!onlyMine) return modalApplications;
        return modalApplications.filter((item) => myCodes.includes(item.kode));
    }, [modalApplications, onlyMine, myCodes]);

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            ...form,
            estimasi_biaya: form.estimasi_biaya ? Number(form.estimasi_biaya) : 0,
        };
        const res = await dispatch(submitModalApplication(payload));
        if (submitModalApplication.fulfilled.match(res)) {
            setForm(INITIAL_FORM);
            const newKode = res.payload?.kode;
            if (newKode) {
                const updated = [newKode, ...myCodes.filter((c) => c !== newKode)];
                setMyCodes(updated);
                try {
                    localStorage.setItem(MY_CODES_STORAGE_KEY, JSON.stringify(updated));
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
                header: 'Kode Pengajuan',
                cell: ({ row, getValue }) => {
                    const kode = getValue();
                    const isMine = myCodes.includes(kode);
                    return (
                        <div>
                            <div className="flex items-center gap-1.5">
                                <code className="text-xs font-semibold text-[#203880]">{kode}</code>
                                {isMine && (
                                    <span className="px-1.5 py-0.2 rounded bg-[#d1e7dd] text-[#0f5132] text-[10px] font-semibold">
                                        Milik Saya
                                    </span>
                                )}
                            </div>
                            <div className="text-[11px] text-[#6c757d]">
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
                        <div className="font-semibold text-[#212529]">{row.original.nama}</div>
                        <div className="text-xs text-[#6c757d]">
                            {row.original.sekolah} ({row.original.tahun_lulus})
                        </div>
                    </div>
                ),
            },
            {
                accessorKey: 'jalur',
                header: 'Jalur & Bantuan',
                cell: ({ row }) => (
                    <div>
                        <span className="bs-badge bs-badge-info mb-1">{row.original.jalur}</span>
                        <div className="text-xs font-medium">{row.original.jenis_bantuan}</div>
                        <div className="text-xs text-[#6c757d]">{row.original.kompetensi}</div>
                    </div>
                ),
            },
            {
                accessorKey: 'estimasi_biaya',
                header: 'Estimasi',
                cell: ({ getValue }) => <span className="font-semibold">{formatRupiah(getValue())}</span>,
            },
            {
                accessorKey: 'status_seleksi',
                header: 'Status Seleksi',
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
            {/* Form Pengajuan Ruang Modal */}
            <div className="bs-card">
                <div className="bs-card-header">
                    <div>
                        <h1 className="text-lg font-bold text-[#203880]">Pengajuan Ruang Modal</h1>
                        <p className="text-xs font-normal text-[#6c757d]">
                            Pilih jalur kerja atau usaha. Pengajuan akan diverifikasi oleh pengelola dan bukan jaminan
                            otomatis memperoleh bantuan.
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
                                        Nomor Pengajuan:{' '}
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
                                    placeholder="08xxxxxxxxxx"
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
                                    placeholder="Contoh: SMAN 1 Tuban"
                                    className="bs-form-control"
                                />
                            </div>
                            <div className="col-span-12 md:col-span-6">
                                <label className="bs-form-label">Tahun Lulus *</label>
                                <input
                                    name="tahun_lulus"
                                    value={form.tahun_lulus}
                                    onChange={handleChange}
                                    required
                                    placeholder="2025"
                                    className="bs-form-control"
                                />
                            </div>
                            <div className="col-span-12 md:col-span-6">
                                <label className="bs-form-label">Kompetensi Double Track *</label>
                                <select
                                    name="kompetensi"
                                    value={form.kompetensi}
                                    onChange={handleChange}
                                    required
                                    className="bs-form-select"
                                >
                                    <option value="">Pilih Kompetensi Double Track</option>
                                    {(masterOptions?.kompetensi_dt || []).map((opt) => (
                                        <option key={opt} value={opt}>
                                            {opt}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-span-12 md:col-span-6">
                                <label className="bs-form-label">Jalur Pengajuan *</label>
                                <select
                                    name="jalur"
                                    value={form.jalur}
                                    onChange={handleChange}
                                    required
                                    className="bs-form-select"
                                >
                                    <option value="">Pilih Jalur</option>
                                    {(masterOptions?.jalur_pengajuan || []).map((opt) => (
                                        <option key={opt} value={opt}>
                                            {opt}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-span-12 md:col-span-6">
                                <label className="bs-form-label">Status Aktivitas Saat Ini</label>
                                <select
                                    name="status_aktivitas"
                                    value={form.status_aktivitas}
                                    onChange={handleChange}
                                    className="bs-form-select"
                                >
                                    {(masterOptions?.status_aktivitas || []).map((opt) => (
                                        <option key={opt} value={opt}>
                                            {opt}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-span-12 md:col-span-6">
                                <label className="bs-form-label">Jenis Bantuan *</label>
                                <select
                                    name="jenis_bantuan"
                                    value={form.jenis_bantuan}
                                    onChange={handleChange}
                                    required
                                    className="bs-form-select"
                                >
                                    <option value="">Pilih Jenis Bantuan</option>
                                    {(masterOptions?.jenis_bantuan || []).map((opt) => (
                                        <option key={opt} value={opt}>
                                            {opt}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-span-12 md:col-span-6">
                                <label className="bs-form-label">Estimasi Kebutuhan (Rp)</label>
                                <CurrencyInput
                                    name="estimasi_biaya"
                                    value={form.estimasi_biaya}
                                    onChange={handleChange}
                                    placeholder="2.500.000"
                                    mode="numeric"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="bs-form-label">
                                Rincian Kebutuhan (nama alat/modal, jumlah, spesifikasi) *
                            </label>
                            <textarea
                                name="rincian_kebutuhan"
                                rows="3"
                                value={form.rincian_kebutuhan}
                                onChange={handleChange}
                                required
                                className="bs-form-control"
                            />
                        </div>

                        <div>
                            <label className="bs-form-label">Rencana Pemanfaatan dan Target Penghasilan *</label>
                            <textarea
                                name="rencana_deskripsi"
                                rows="3"
                                value={form.rencana_deskripsi}
                                onChange={handleChange}
                                required
                                className="bs-form-control"
                            />
                        </div>

                        <div className="pt-2">
                            <button type="submit" disabled={submitting} className="bs-btn bs-btn-primary">
                                <Send className="w-4 h-4" />
                                {submitting ? 'Mengirim Pengajuan...' : 'Kirim Pengajuan'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Tabel Riwayat Pengajuan Ruang Modal (Pemohon / Publik) */}
            <div className="bs-card">
                <div className="bs-card-header flex-col sm:flex-row sm:items-center">
                    <div>
                        <h2 className="text-base font-bold text-[#203880] flex items-center gap-2">
                            <History className="w-4 h-4 text-[#0068b0]" />
                            Riwayat & Status Pengajuan Ruang Modal
                        </h2>
                        <p className="text-xs font-normal text-[#6c757d]">
                            Klik baris data pada tabel untuk melihat detail lengkap dan timeline riwayat pengajuan.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {myCodes.length > 0 && (
                            <div className="inline-flex rounded border border-[#ced4da] overflow-hidden text-xs">
                                <button
                                    type="button"
                                    onClick={() => setOnlyMine(false)}
                                    className={`px-2.5 py-1 font-medium cursor-pointer ${
                                        !onlyMine
                                            ? 'bg-[#203880] text-white'
                                            : 'bg-white text-[#495057] hover:bg-[#f8f9fa]'
                                    }`}
                                >
                                    Semua ({modalApplications.length})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setOnlyMine(true)}
                                    className={`px-2.5 py-1 font-medium cursor-pointer ${
                                        onlyMine
                                            ? 'bg-[#203880] text-white'
                                            : 'bg-white text-[#495057] hover:bg-[#f8f9fa]'
                                    }`}
                                >
                                    Pengajuan Saya ({myCodes.length})
                                </button>
                            </div>
                        )}
                        <span className="bs-badge bs-badge-primary">{displayedHistory.length} Pengajuan</span>
                    </div>
                </div>

                <div className="bs-card-body">
                    {loadingModalApplications ? (
                        <div className="text-center py-6 text-sm text-[#6c757d]">
                            Memuat riwayat pengajuan...
                        </div>
                    ) : (
                        <DataTable
                            data={displayedHistory}
                            columns={columns}
                            searchPlaceholder="Cari kode pengajuan, nama pemohon, sekolah, kompetensi..."
                            filterColumn="status_seleksi"
                            filterOptions={STATUS_OPTIONS}
                            emptyText="Belum ada riwayat pengajuan yang ditemukan."
                            onRowClick={(row) => setDetailId(row.id)}
                        />
                    )}
                </div>
            </div>

            {/* Modal Detail & Riwayat Pengajuan */}
            {detailItem && (
                <ModalApplicationDetailModal
                    item={detailItem}
                    allItems={modalApplications}
                    onClose={() => setDetailId(null)}
                    onSelectOther={(other) => setDetailId(other.id)}
                    isAdmin={false}
                />
            )}
        </div>
    );
}
