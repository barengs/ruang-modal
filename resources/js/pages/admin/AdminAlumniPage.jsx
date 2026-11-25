import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Briefcase,
    Building2,
    CheckCircle2,
    Edit3,
    Eye,
    FileSpreadsheet,
    GraduationCap,
    Phone,
    Printer,
    Trash2,
    UserPlus,
    X,
} from 'lucide-react';
import {
    clearAdminNotice,
    createAlumniItem,
    deleteAlumniItem,
    fetchAlumniList,
    fetchMasterOptionsList,
    updateAlumniItem,
} from '../../store/slices/adminSlice';
import DataTable from '../../components/DataTable';
import { formatDateTime } from '../../utils/format';
import { exportToExcelFile, exportToPdfReport } from '../../utils/reportExporter';

const emptyAlumniForm = {
    name: '',
    email: '',
    password: '',
    whatsapp: '',
    sekolah: '',
    tahun_lulus: '',
    kompetensi: '',
    nama_usaha: '',
};

export default function AdminAlumniPage() {
    const dispatch = useDispatch();
    const { alumni, masterOptions, flash, error } = useSelector((state) => state.admin);

    const [detailId, setDetailId] = useState(null);
    const [showFormModal, setShowFormModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState(emptyAlumniForm);

    useEffect(() => {
        dispatch(fetchAlumniList());
        dispatch(fetchMasterOptionsList());
        return () => dispatch(clearAdminNotice());
    }, [dispatch]);

    const selectedAlumni = useMemo(
        () => alumni.find((item) => item.id === detailId) || null,
        [alumni, detailId]
    );

    const openCreateModal = () => {
        setEditingId(null);
        setForm(emptyAlumniForm);
        setShowFormModal(true);
    };

    const openEditModal = (item) => {
        setEditingId(item.id);
        setForm({
            name: item.name || '',
            email: item.email || '',
            password: '',
            whatsapp: item.whatsapp || '',
            sekolah: item.sekolah || '',
            tahun_lulus: item.tahun_lulus || '',
            kompetensi: item.kompetensi || '',
            nama_usaha: item.nama_usaha || '',
        });
        setDetailId(null);
        setShowFormModal(true);
    };

    const handleSaveAlumni = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingId) {
                const payload = { ...form };
                if (!payload.password) delete payload.password;
                const res = await dispatch(updateAlumniItem({ id: editingId, payload }));
                if (updateAlumniItem.fulfilled.match(res)) {
                    setShowFormModal(false);
                    setForm(emptyAlumniForm);
                    setEditingId(null);
                }
            } else {
                const res = await dispatch(createAlumniItem(form));
                if (createAlumniItem.fulfilled.match(res)) {
                    setShowFormModal(false);
                    setForm(emptyAlumniForm);
                }
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteAlumni = async (item) => {
        if (!window.confirm(`Hapus akun alumni "${item.name}" (${item.email})?`)) return;
        if (detailId === item.id) setDetailId(null);
        await dispatch(deleteAlumniItem(item.id));
    };

    const reportColumns = [
        { header: 'Nama Alumni', value: (r) => r.name },
        { header: 'Email', value: (r) => r.email },
        { header: 'No. WhatsApp', value: (r) => r.whatsapp || '-' },
        { header: 'Asal Sekolah', value: (r) => r.sekolah || '-' },
        { header: 'Tahun Lulus', value: (r) => r.tahun_lulus || '-' },
        { header: 'Kompetensi Double Track', value: (r) => r.kompetensi || '-' },
        { header: 'Nama Usaha', value: (r) => r.nama_usaha || '-' },
        {
            header: 'Rekap Aktivitas',
            value: (r) =>
                `Modal: ${r.modal_count || 0} | Tumbuh: ${r.tumbuh_count || 0} | Pasar: ${r.pasar_count || 0} | Pantau: ${r.monitoring_count || 0}`,
        },
        { header: 'Terdaftar', value: (r) => formatDateTime(r.created_at) },
    ];

    const handlePrintPdf = () => {
        exportToPdfReport({
            title: 'Laporan Data Akun Alumni Wirausaha - SMA Double Track',
            subtitle:
                'Rekapitulasi akun terdaftar alumni beserta riwayat partisipasi Ruang Modal, Tumbuh & Pasar',
            filename: 'Laporan_Data_Alumni_Double_Track',
            columns: reportColumns,
            rows: alumni,
            summaryCards: [
                { label: 'Total Akun Alumni', value: `${alumni.length} Alumni` },
                {
                    label: 'Total Pengajuan Modal',
                    value: `${alumni.reduce((acc, r) => acc + Number(r.modal_count || 0), 0)} Proposal`,
                },
                {
                    label: 'Total Pengajuan Tumbuh',
                    value: `${alumni.reduce((acc, r) => acc + Number(r.tumbuh_count || 0), 0)} Ajuan`,
                },
                {
                    label: 'Total Produk Etalase Pasar',
                    value: `${alumni.reduce((acc, r) => acc + Number(r.pasar_count || 0), 0)} Usaha`,
                },
            ],
        });
    };

    const handleExportExcel = () => {
        exportToExcelFile({
            title: 'Data Akun Alumni Wirausaha - SMA Double Track',
            filename: 'Data_Alumni_Double_Track',
            sheetName: 'Data Alumni',
            columns: reportColumns,
            rows: alumni,
        });
    };

    const alumniColumns = useMemo(
        () => [
            {
                accessorKey: 'name',
                header: 'Nama & Kontak Alumni',
                cell: ({ row }) => (
                    <div>
                        <div className="font-semibold text-[#203880]">{row.original.name}</div>
                        <div className="text-xs text-[#64748b]">{row.original.email}</div>
                        {row.original.whatsapp && (
                            <div className="text-[11px] font-semibold text-[#008a75] mt-0.5">
                                WA: {row.original.whatsapp}
                            </div>
                        )}
                    </div>
                ),
            },
            {
                accessorKey: 'sekolah',
                header: 'Sekolah & Angkatan',
                cell: ({ row }) => (
                    <div>
                        <div className="font-semibold text-[#1e293b]">{row.original.sekolah || '-'}</div>
                        <div className="text-xs text-[#64748b]">
                            {row.original.tahun_lulus
                                ? `Lulusan ${row.original.tahun_lulus}`
                                : 'Tahun lulus belum diisi'}
                        </div>
                    </div>
                ),
            },
            {
                accessorKey: 'kompetensi',
                header: 'Kompetensi & Usaha',
                cell: ({ row }) => (
                    <div>
                        <div className="text-xs font-bold text-[#0068b0]">
                            {row.original.kompetensi || '-'}
                        </div>
                        <div className="text-xs text-[#475569] font-medium mt-0.5">
                            {row.original.nama_usaha || 'Belum ada nama usaha'}
                        </div>
                    </div>
                ),
            },
            {
                id: 'aktivitas',
                header: 'Rekap Pengajuan',
                enableSorting: false,
                cell: ({ row }) => (
                    <div className="flex flex-wrap gap-1">
                        <span className="bs-badge bs-badge-primary">
                            Modal: {row.original.modal_count || 0}
                        </span>
                        <span className="bs-badge bs-badge-success">
                            Tumbuh: {row.original.tumbuh_count || 0}
                        </span>
                        <span className="bs-badge bs-badge-warning">
                            Pasar: {row.original.pasar_count || 0}
                        </span>
                        <span className="bs-badge bs-badge-secondary">
                            Pantau: {row.original.monitoring_count || 0}
                        </span>
                    </div>
                ),
            },
            {
                accessorKey: 'created_at',
                header: 'Terdaftar',
                cell: ({ getValue }) => (
                    <span className="text-xs text-[#64748b]">{formatDateTime(getValue())}</span>
                ),
            },
            {
                id: 'actions',
                header: 'Aksi',
                enableSorting: false,
                cell: ({ row }) => (
                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            onClick={() => setDetailId(row.original.id)}
                            className="bs-btn bs-btn-sm bs-btn-outline-primary"
                            title="Lihat Detail Alumni"
                        >
                            <Eye className="w-3.5 h-3.5" />
                            Detail
                        </button>
                        <button
                            type="button"
                            onClick={() => openEditModal(row.original)}
                            className="bs-btn bs-btn-sm bs-btn-outline-secondary"
                            title="Edit Data Alumni"
                        >
                            <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                            type="button"
                            onClick={() => handleDeleteAlumni(row.original)}
                            className="bs-btn bs-btn-sm bs-btn-outline-danger"
                            title="Hapus Akun Alumni"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                ),
            },
        ],
        []
    );

    const sekolahOptions = useMemo(
        () => (Array.isArray(masterOptions) ? masterOptions.filter((m) => m.category === 'sekolah') : []),
        [masterOptions]
    );
    const kompetensiOptions = useMemo(
        () => (Array.isArray(masterOptions) ? masterOptions.filter((m) => m.category === 'kompetensi') : []),
        [masterOptions]
    );

    return (
        <div className="space-y-4">
            {flash && (
                <div className="bs-alert bs-alert-success">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{flash}</span>
                </div>
            )}

            {error && <div className="bs-alert bs-alert-danger">{error}</div>}

            <div className="bs-card">
                <div className="bs-card-header flex-wrap gap-3">
                    <div>
                        <h1 className="text-base font-bold text-[#203880]">Manajemen Data Alumni</h1>
                        <p className="text-xs font-normal text-[#64748b]">
                            Kelola akun alumni wirausaha SMA Double Track (terpisah dari akun user pengelola). Klik
                            baris untuk melihat rincian profil & rekap pengajuan alumni.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={handlePrintPdf}
                            disabled={alumni.length === 0}
                            className="bs-btn bs-btn-sm bs-btn-outline-primary"
                        >
                            <Printer className="w-3.5 h-3.5" />
                            Print Laporan (PDF)
                        </button>
                        <button
                            type="button"
                            onClick={handleExportExcel}
                            disabled={alumni.length === 0}
                            className="bs-btn bs-btn-sm bs-btn-success"
                        >
                            <FileSpreadsheet className="w-3.5 h-3.5" />
                            Export Excel
                        </button>
                        <button
                            type="button"
                            onClick={openCreateModal}
                            className="bs-btn bs-btn-sm bs-btn-primary"
                        >
                            <UserPlus className="w-4 h-4" />
                            Tambah Alumni
                        </button>
                    </div>
                </div>

                <div className="bs-card-body">
                    <DataTable
                        data={alumni}
                        columns={alumniColumns}
                        searchPlaceholder="Cari nama alumni, email, sekolah, kompetensi, atau nama usaha..."
                        onRowClick={(row) => setDetailId(row.id)}
                    />
                </div>
            </div>

            {/* Modal Detail Alumni */}
            {selectedAlumni && (
                <div className="bs-modal-backdrop" onClick={() => setDetailId(null)}>
                    <div className="bs-modal-dialog max-w-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="bs-modal-header">
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-sm text-[#203880]">Profil Akun Alumni</h3>
                                <span className="bs-badge bs-badge-success">Role: alumni</span>
                            </div>
                            <button type="button" onClick={() => setDetailId(null)}>
                                <X className="w-4 h-4 text-[#64748b]" />
                            </button>
                        </div>

                        <div className="bs-modal-body space-y-4 text-xs">
                            <div className="p-3.5 rounded border border-[#dbe3f0] bg-[#f8fafd] grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <span className="text-[#64748b] block">Nama Lengkap Alumni</span>
                                    <span className="font-bold text-sm text-[#203880]">
                                        {selectedAlumni.name}
                                    </span>
                                    <span className="block text-[#64748b]">{selectedAlumni.email}</span>
                                </div>
                                <div>
                                    <span className="text-[#64748b] flex items-center gap-1">
                                        <Phone className="w-3.5 h-3.5 text-[#008a75]" /> No. WhatsApp
                                    </span>
                                    <span className="font-bold text-[#008a75] block mt-0.5">
                                        {selectedAlumni.whatsapp || '-'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[#64748b] flex items-center gap-1">
                                        <Building2 className="w-3.5 h-3.5 text-[#0068b0]" /> Asal Sekolah
                                    </span>
                                    <span className="font-bold text-[#1e293b] block mt-0.5">
                                        {selectedAlumni.sekolah || '-'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[#64748b] flex items-center gap-1">
                                        <GraduationCap className="w-3.5 h-3.5 text-[#0068b0]" /> Tahun Lulus
                                    </span>
                                    <span className="font-bold text-[#1e293b] block mt-0.5">
                                        {selectedAlumni.tahun_lulus || '-'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[#64748b] flex items-center gap-1">
                                        <Briefcase className="w-3.5 h-3.5 text-[#0068b0]" /> Kompetensi Double Track
                                    </span>
                                    <span className="font-bold text-[#0068b0] block mt-0.5">
                                        {selectedAlumni.kompetensi || '-'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[#64748b] block">Nama Usaha / Rintisan</span>
                                    <span className="font-bold text-[#203880] block mt-0.5">
                                        {selectedAlumni.nama_usaha || 'Belum mencantumkan nama usaha'}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <div className="font-semibold text-[#203880] mb-2">
                                    Rekap Partisipasi Program Double Track
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                    <div className="p-3 rounded border border-[#203880]/20 bg-[#203880]/5 text-center">
                                        <div className="text-lg font-extrabold text-[#203880]">
                                            {selectedAlumni.modal_count || 0}
                                        </div>
                                        <div className="text-[11px] font-semibold text-[#475569]">
                                            Ruang Modal
                                        </div>
                                    </div>
                                    <div className="p-3 rounded border border-[#008a75]/20 bg-[#008a75]/5 text-center">
                                        <div className="text-lg font-extrabold text-[#008a75]">
                                            {selectedAlumni.tumbuh_count || 0}
                                        </div>
                                        <div className="text-[11px] font-semibold text-[#475569]">
                                            Ruang Tumbuh
                                        </div>
                                    </div>
                                    <div className="p-3 rounded border border-[#f8a000]/30 bg-[#f8a000]/10 text-center">
                                        <div className="text-lg font-extrabold text-amber-800">
                                            {selectedAlumni.pasar_count || 0}
                                        </div>
                                        <div className="text-[11px] font-semibold text-[#475569]">
                                            Ruang Pasar
                                        </div>
                                    </div>
                                    <div className="p-3 rounded border border-[#dbe3f0] bg-[#f8fafd] text-center">
                                        <div className="text-lg font-extrabold text-[#1e293b]">
                                            {selectedAlumni.monitoring_count || 0}
                                        </div>
                                        <div className="text-[11px] font-semibold text-[#475569]">
                                            Lap. Pantau
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Rincian Data Terkait */}
                            <div className="space-y-2.5 pt-1">
                                {(selectedAlumni.modal_applications || []).length > 0 && (
                                    <div className="p-3 rounded border border-[#dbe3f0] bg-white">
                                        <div className="font-bold text-[#203880] mb-1.5">
                                            Relasi Ruang Modal ({selectedAlumni.modal_applications.length})
                                        </div>
                                        <div className="space-y-1.5">
                                            {selectedAlumni.modal_applications.map((m) => (
                                                <div
                                                    key={m.id}
                                                    className="flex items-center justify-between gap-2 text-xs border-b border-[#eef2f9] last:border-0 pb-1 last:pb-0"
                                                >
                                                    <div>
                                                        <span className="font-mono font-semibold text-[#0068b0]">
                                                            {m.kode}
                                                        </span>{' '}
                                                        — {m.jenis_bantuan}
                                                    </div>
                                                    <span className="bs-badge bs-badge-info">{m.status_seleksi}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {(selectedAlumni.tumbuh_requests || []).length > 0 && (
                                    <div className="p-3 rounded border border-[#dbe3f0] bg-white">
                                        <div className="font-bold text-[#008a75] mb-1.5">
                                            Relasi Ruang Tumbuh ({selectedAlumni.tumbuh_requests.length})
                                        </div>
                                        <div className="space-y-1.5">
                                            {selectedAlumni.tumbuh_requests.map((t) => (
                                                <div
                                                    key={t.id}
                                                    className="flex items-center justify-between gap-2 text-xs border-b border-[#eef2f9] last:border-0 pb-1 last:pb-0"
                                                >
                                                    <div>
                                                        <span className="font-mono font-semibold text-[#008a75]">
                                                            {t.kode}
                                                        </span>{' '}
                                                        — {t.bidang_minat}
                                                    </div>
                                                    <span className="bs-badge bs-badge-success">{t.status}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {(selectedAlumni.pasar_products || []).length > 0 && (
                                    <div className="p-3 rounded border border-[#dbe3f0] bg-white">
                                        <div className="font-bold text-amber-800 mb-1.5">
                                            Relasi Ruang Pasar ({selectedAlumni.pasar_products.length})
                                        </div>
                                        <div className="space-y-1.5">
                                            {selectedAlumni.pasar_products.map((p) => (
                                                <div
                                                    key={p.id}
                                                    className="flex items-center justify-between gap-2 text-xs border-b border-[#eef2f9] last:border-0 pb-1 last:pb-0"
                                                >
                                                    <div>
                                                        <span className="font-mono font-semibold text-amber-800">
                                                            {p.kode}
                                                        </span>{' '}
                                                        — {p.nama_produk}
                                                    </div>
                                                    <span className="bs-badge bs-badge-warning">
                                                        {p.status_publikasi}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bs-modal-footer justify-between">
                            <span className="text-xs text-[#64748b]">
                                Terdaftar: {formatDateTime(selectedAlumni.created_at)}
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => openEditModal(selectedAlumni)}
                                    className="bs-btn bs-btn-sm bs-btn-primary"
                                >
                                    <Edit3 className="w-3.5 h-3.5" />
                                    Edit Profil Alumni
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setDetailId(null)}
                                    className="bs-btn bs-btn-sm bs-btn-outline-secondary"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Tambah / Edit Alumni */}
            {showFormModal && (
                <div className="bs-modal-backdrop" onClick={() => setShowFormModal(false)}>
                    <div className="bs-modal-dialog max-w-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="bs-modal-header">
                            <h3 className="font-bold text-sm text-[#203880]">
                                {editingId ? 'Edit Data Akun Alumni' : 'Tambah Akun Alumni Baru'}
                            </h3>
                            <button type="button" onClick={() => setShowFormModal(false)}>
                                <X className="w-4 h-4 text-[#64748b]" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveAlumni}>
                            <div className="bs-modal-body grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="sm:col-span-2">
                                    <label className="bs-form-label">Nama Lengkap Alumni *</label>
                                    <input
                                        type="text"
                                        required
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        placeholder="Contoh: Rina Sari Dewi"
                                        className="bs-form-control"
                                    />
                                </div>

                                <div>
                                    <label className="bs-form-label">Alamat Email *</label>
                                    <input
                                        type="email"
                                        required
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        placeholder="nama@alumni.sch.id"
                                        className="bs-form-control"
                                    />
                                </div>

                                <div>
                                    <label className="bs-form-label">No. WhatsApp Aktif</label>
                                    <input
                                        type="text"
                                        value={form.whatsapp}
                                        onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                                        placeholder="0812xxxxxxxx"
                                        className="bs-form-control"
                                    />
                                </div>

                                <div>
                                    <label className="bs-form-label">Asal Sekolah SMA</label>
                                    <input
                                        type="text"
                                        list="alumni-sekolah-list"
                                        value={form.sekolah}
                                        onChange={(e) => setForm({ ...form, sekolah: e.target.value })}
                                        placeholder="Contoh: SMAN 1 Lamongan"
                                        className="bs-form-control"
                                    />
                                    <datalist id="alumni-sekolah-list">
                                        {sekolahOptions.map((item) => (
                                            <option key={item.id || item} value={item.label || item} />
                                        ))}
                                    </datalist>
                                </div>

                                <div>
                                    <label className="bs-form-label">Tahun Lulus</label>
                                    <input
                                        type="number"
                                        min="2018"
                                        max="2030"
                                        value={form.tahun_lulus}
                                        onChange={(e) => setForm({ ...form, tahun_lulus: e.target.value })}
                                        placeholder="2024"
                                        className="bs-form-control"
                                    />
                                </div>

                                <div>
                                    <label className="bs-form-label">Bidang Kompetensi DT</label>
                                    <input
                                        type="text"
                                        list="alumni-kompetensi-list"
                                        value={form.kompetensi}
                                        onChange={(e) => setForm({ ...form, kompetensi: e.target.value })}
                                        placeholder="Contoh: Tata Boga"
                                        className="bs-form-control"
                                    />
                                    <datalist id="alumni-kompetensi-list">
                                        {kompetensiOptions.map((item) => (
                                            <option key={item.id || item} value={item.label || item} />
                                        ))}
                                    </datalist>
                                </div>

                                <div>
                                    <label className="bs-form-label">Nama Usaha</label>
                                    <input
                                        type="text"
                                        value={form.nama_usaha}
                                        onChange={(e) => setForm({ ...form, nama_usaha: e.target.value })}
                                        placeholder="Contoh: Dapur Rina Catering"
                                        className="bs-form-control"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="bs-form-label">
                                        {editingId
                                            ? 'Password Baru (Kosongkan jika tidak ingin mengubah)'
                                            : 'Password Akun *'}
                                    </label>
                                    <input
                                        type="password"
                                        required={!editingId}
                                        minLength={6}
                                        value={form.password}
                                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                                        placeholder="Minimal 6 karakter"
                                        className="bs-form-control"
                                    />
                                </div>
                            </div>

                            <div className="bs-modal-footer">
                                <button
                                    type="button"
                                    onClick={() => setShowFormModal(false)}
                                    className="bs-btn bs-btn-sm bs-btn-outline-secondary"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="bs-btn bs-btn-sm bs-btn-primary"
                                >
                                    {submitting
                                        ? 'Menyimpan...'
                                        : editingId
                                          ? 'Simpan Perubahan'
                                          : 'Simpan Alumni'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
