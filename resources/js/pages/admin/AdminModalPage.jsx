import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    Award,
    CheckCircle2,
    Edit3,
    ExternalLink,
    Eye,
    FileCheck,
    FileSpreadsheet,
    FileText,
    Printer,
    Trash2,
    X,
} from 'lucide-react';
import {
    clearAdminNotice,
    deleteModalItem,
    fetchModalList,
    updateModalItem,
} from '../../store/slices/adminSlice';
import { hasPermission } from '../../store/slices/authSlice';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import CurrencyInput from '../../components/CurrencyInput';
import { formatDateTime, formatRupiah } from '../../utils/format';
import { exportBastPdf, exportToExcelFile, exportToPdfReport } from '../../utils/reportExporter';

const STATUS_OPTIONS = ['Menunggu Seleksi', 'Disetujui', 'Disalurkan', 'Perlu Perbaikan', 'Ditolak'];

const RUBRIK_INDIKATOR = [
    {
        key: 'skor_kompetensi',
        label: '1. Kesesuaian Kompetensi DT dengan Kebutuhan',
        weight: 0.2,
        weightLabel: '20%',
    },
    {
        key: 'skor_rencana',
        label: '2. Kejelasan Rencana Kerja / Usaha',
        weight: 0.25,
        weightLabel: '25%',
    },
    {
        key: 'skor_kebutuhan',
        label: '3. Urgensi & Ketepatan Kebutuhan Bantuan Alat/Modal',
        weight: 0.25,
        weightLabel: '25%',
    },
    {
        key: 'skor_dampak',
        label: '4. Potensi Dampak Ekonomi & Penghasilan',
        weight: 0.2,
        weightLabel: '20%',
    },
    {
        key: 'skor_komitmen',
        label: '5. Kesiapan & Komitmen Pendampingan/Pelaporan',
        weight: 0.1,
        weightLabel: '10%',
    },
];

export default function AdminModalPage() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { modal, flash } = useSelector((state) => state.admin);
    const { user } = useSelector((state) => state.auth);
    const [selected, setSelected] = useState(null);
    const [reviewForm, setReviewForm] = useState({
        status_seleksi: 'Disetujui',
        catatan_admin: '',
        skor_kompetensi: 85,
        skor_rencana: 85,
        skor_kebutuhan: 85,
        skor_dampak: 85,
        skor_komitmen: 90,
        nominal_disetujui: '',
        rincian_bantuan_disalurkan: '',
        nomor_bast: '',
        tanggal_penyaluran: new Date().toISOString().slice(0, 10),
    });

    const canUpdate = hasPermission(user, 'modal.update');
    const canDelete = hasPermission(user, 'modal.delete');

    useEffect(() => {
        dispatch(fetchModalList());
        return () => dispatch(clearAdminNotice());
    }, [dispatch]);

    const calculatedSkorTotal = useMemo(() => {
        const total = RUBRIK_INDIKATOR.reduce((acc, ind) => {
            const val = Number(reviewForm[ind.key] || 0);
            return acc + val * ind.weight;
        }, 0);
        return Math.round(total * 100) / 100;
    }, [reviewForm]);

    const openReview = (row) => {
        setSelected(row);
        const suffix = (row.kode || '').replace(/[^A-Z0-9]/gi, '').slice(-6);
        const defaultBast = row.nomor_bast || `BAST/DT-RM/${new Date().getFullYear()}/${suffix}`;
        setReviewForm({
            status_seleksi: row.status_seleksi || 'Disetujui',
            catatan_admin: row.catatan_admin || '',
            skor_kompetensi: row.skor_kompetensi ?? 85,
            skor_rencana: row.skor_rencana ?? 85,
            skor_kebutuhan: row.skor_kebutuhan ?? 85,
            skor_dampak: row.skor_dampak ?? 85,
            skor_komitmen: row.skor_komitmen ?? 90,
            nominal_disetujui: row.nominal_disetujui ?? row.estimasi_biaya ?? 0,
            rincian_bantuan_disalurkan: row.rincian_bantuan_disalurkan || row.rincian_kebutuhan || '',
            nomor_bast: defaultBast,
            tanggal_penyaluran: row.tanggal_penyaluran || new Date().toISOString().slice(0, 10),
        });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!selected) return;
        const targetId = selected.id;
        const res = await dispatch(
            updateModalItem({
                id: targetId,
                payload: {
                    ...reviewForm,
                    skor_kompetensi: Number(reviewForm.skor_kompetensi || 0),
                    skor_rencana: Number(reviewForm.skor_rencana || 0),
                    skor_kebutuhan: Number(reviewForm.skor_kebutuhan || 0),
                    skor_dampak: Number(reviewForm.skor_dampak || 0),
                    skor_komitmen: Number(reviewForm.skor_komitmen || 0),
                    nominal_disetujui: reviewForm.nominal_disetujui
                        ? Number(reviewForm.nominal_disetujui)
                        : Number(selected.estimasi_biaya || 0),
                },
            })
        );
        setSelected(null);
        if (updateModalItem.fulfilled.match(res)) {
            toast.success(res.payload?.message || 'Proses seleksi berhasil disimpan.');
        } else {
            toast.error(res.payload || 'Gagal menyimpan hasil seleksi.');
        }
    };

    const handleDelete = async (row) => {
        if (!window.confirm(`Hapus pengajuan ${row.kode} milik ${row.nama}?`)) return;
        const res = await dispatch(deleteModalItem(row.id));
        if (deleteModalItem.fulfilled.match(res)) {
            toast.success(`Pengajuan ${row.kode} berhasil dihapus.`);
        } else {
            toast.error(res.payload || 'Gagal menghapus pengajuan.');
        }
    };

    const handlePrintPdf = () => {
        const totalBiaya = modal.reduce((acc, r) => acc + (Number(r.estimasi_biaya) || 0), 0);
        const disetujuiCount = modal.filter((r) =>
            ['Disetujui', 'Disalurkan'].includes(r.status_seleksi)
        ).length;
        const disalurkanCount = modal.filter((r) => r.status_seleksi === 'Disalurkan').length;

        exportToPdfReport({
            title: 'Laporan Pengajuan & Penyaluran Ruang Modal — SMA Double Track',
            subtitle:
                'Rekapitulasi Pengajuan, Skor Rubrik Seleksi & BAST Penyaluran Fasilitasi Alumni SMA Double Track',
            filename: `Laporan-Ruang-Modal-${new Date().toISOString().slice(0, 10)}`,
            summary: [
                { label: 'Total Pengajuan', value: `${modal.length} Pengajuan` },
                { label: 'Disetujui / Layak', value: `${disetujuiCount} Pengajuan` },
                { label: 'Telah Disalurkan (BAST)', value: `${disalurkanCount} Alumni` },
                { label: 'Total Estimasi Biaya', value: formatRupiah(totalBiaya) },
            ],
            columns: [
                { header: 'Kode', width: 90, accessor: (r) => r.kode },
                {
                    header: 'Alumni & Sekolah',
                    width: 115,
                    accessor: (r) => `${r.nama} (${r.sekolah} - ${r.tahun_lulus})`,
                },
                {
                    header: 'Jalur & Kompetensi',
                    width: 105,
                    accessor: (r) => `${r.jalur} - ${r.kompetensi}`,
                },
                { header: 'Jenis Bantuan', width: 95, accessor: (r) => r.jenis_bantuan },
                {
                    header: 'Rincian Kebutuhan',
                    width: 140,
                    accessor: (r) => r.rincian_bantuan_disalurkan || r.rincian_kebutuhan,
                },
                {
                    header: 'Nilai / Estimasi',
                    width: 85,
                    accessor: (r) => formatRupiah(r.nominal_disetujui || r.estimasi_biaya),
                },
                {
                    header: 'Skor Rubrik',
                    width: 65,
                    accessor: (r) => (r.skor_total != null ? `${r.skor_total}/100` : '-'),
                },
                {
                    header: 'Status & BAST',
                    width: 95,
                    accessor: (r) =>
                        r.nomor_bast ? `${r.status_seleksi} (${r.nomor_bast})` : r.status_seleksi,
                },
            ],
            data: modal,
        });
    };

    const handleExportExcel = () => {
        exportToExcelFile({
            title: 'LAPORAN PENGAJUAN & PENYALURAN RUANG MODAL — RUANG ALUMNI SMA DOUBLE TRACK',
            sheetName: 'Ruang Modal',
            filename: `Data-Ruang-Modal-${new Date().toISOString().slice(0, 10)}`,
            columns: [
                { header: 'No', width: 45, accessor: (_, i) => i + 1 },
                { header: 'Kode Pengajuan', width: 130, accessor: (r) => r.kode },
                { header: 'Tanggal Pengajuan', width: 125, accessor: (r) => formatDateTime(r.created_at) },
                { header: 'Nama Alumni', width: 140, accessor: (r) => r.nama },
                { header: 'Email', width: 150, accessor: (r) => r.email },
                { header: 'WhatsApp', width: 110, accessor: (r) => r.whatsapp },
                { header: 'Asal Sekolah', width: 140, accessor: (r) => r.sekolah },
                { header: 'Tahun Lulus', width: 80, accessor: (r) => r.tahun_lulus },
                { header: 'Guru Pendamping', width: 140, accessor: (r) => r.guru_pendamping || '-' },
                { header: 'Kompetensi DT', width: 140, accessor: (r) => r.kompetensi },
                { header: 'Jalur', width: 80, accessor: (r) => r.jalur },
                { header: 'Status Aktivitas', width: 120, accessor: (r) => r.status_aktivitas },
                { header: 'Jenis Bantuan', width: 140, accessor: (r) => r.jenis_bantuan },
                { header: 'Estimasi Biaya (Rp)', width: 120, accessor: (r) => Number(r.estimasi_biaya) || 0 },
                {
                    header: 'Nominal Disetujui (Rp)',
                    width: 120,
                    accessor: (r) => Number(r.nominal_disetujui || r.estimasi_biaya || 0),
                },
                {
                    header: 'Skor Akhir Rubrik',
                    width: 95,
                    accessor: (r) => (r.skor_total != null ? Number(r.skor_total) : '-'),
                },
                { header: 'Status Seleksi', width: 120, accessor: (r) => r.status_seleksi },
                { header: 'Nomor BAST', width: 140, accessor: (r) => r.nomor_bast || '-' },
                { header: 'Tanggal Penyaluran', width: 110, accessor: (r) => r.tanggal_penyaluran || '-' },
                { header: 'Rincian Kebutuhan', width: 220, accessor: (r) => r.rincian_kebutuhan },
                { header: 'Rencana Pemanfaatan', width: 220, accessor: (r) => r.rencana_deskripsi },
                { header: 'Catatan Admin', width: 180, accessor: (r) => r.catatan_admin || '-' },
            ],
            data: modal,
        });
    };

    const columns = useMemo(
        () => [
            {
                accessorKey: 'kode',
                header: 'Kode',
                cell: ({ row, getValue }) => (
                    <div>
                        <code className="text-xs font-semibold text-[#203880]">{getValue()}</code>
                        <div className="text-[11px] text-[#6c757d]">
                            {formatDateTime(row.original.created_at)}
                        </div>
                        {row.original.nomor_bast && (
                            <div className="text-[10px] font-semibold text-[#008a75] mt-0.5">
                                {row.original.nomor_bast}
                            </div>
                        )}
                    </div>
                ),
            },
            {
                accessorKey: 'nama',
                header: 'Alumni & Sekolah',
                cell: ({ row }) => (
                    <div>
                        <div className="font-semibold text-[#212529]">{row.original.nama}</div>
                        <div className="text-xs text-[#6c757d]">
                            {row.original.sekolah} ({row.original.tahun_lulus})
                        </div>
                        {row.original.guru_pendamping && (
                            <div className="text-[11px] text-[#0068b0]">
                                Pendamping: {row.original.guru_pendamping}
                            </div>
                        )}
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
                header: 'Nilai & Skor',
                cell: ({ row, getValue }) => (
                    <div>
                        <div className="font-semibold text-[#203880]">
                            {formatRupiah(row.original.nominal_disetujui || getValue())}
                        </div>
                        {row.original.skor_total != null ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#008a75]">
                                <Award className="w-3 h-3" /> Skor: {row.original.skor_total}/100
                            </span>
                        ) : (
                            <span className="text-[11px] text-[#6c757d]">Belum dinilai</span>
                        )}
                    </div>
                ),
            },
            {
                accessorKey: 'status_seleksi',
                header: 'Status',
                cell: ({ getValue }) => <StatusBadge status={getValue()} />,
            },
            {
                id: 'actions',
                header: 'Aksi',
                enableSorting: false,
                cell: ({ row }) => {
                    const isEligibleBast = ['Disetujui', 'Disalurkan'].includes(row.original.status_seleksi);
                    return (
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <button
                                type="button"
                                onClick={() => navigate(`/admin/modal/${row.original.id}`)}
                                className="bs-btn bs-btn-sm bs-btn-outline-primary"
                                title="Lihat Detail Halaman & Riwayat"
                            >
                                <Eye className="w-3.5 h-3.5" />
                                Detail
                            </button>
                            {canUpdate && (
                                <button
                                    type="button"
                                    onClick={() => openReview(row.original)}
                                    className="bs-btn bs-btn-sm bs-btn-primary"
                                    title="Rubrik Penilaian & Penyaluran BAST"
                                >
                                    <Edit3 className="w-3.5 h-3.5" />
                                    Proses
                                </button>
                            )}
                            {isEligibleBast && (
                                <button
                                    type="button"
                                    onClick={() => exportBastPdf(row.original, formatRupiah)}
                                    className="bs-btn bs-btn-sm bs-btn-success"
                                    title="Cetak Berita Acara Serah Terima (BAST)"
                                >
                                    <FileCheck className="w-3.5 h-3.5" />
                                    BAST
                                </button>
                            )}
                            {canDelete && (
                                <button
                                    type="button"
                                    onClick={() => handleDelete(row.original)}
                                    className="bs-btn bs-btn-sm bs-btn-outline-danger"
                                    title="Hapus"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    );
                },
            },
        ],
        [canUpdate, canDelete]
    );

    return (
        <div className="space-y-4">
            <div className="bs-card">
                <div className="bs-card-header flex-col sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-base font-bold text-[#203880]">
                            Manajemen Pengajuan, Seleksi & Penyaluran Ruang Modal
                        </h1>
                        <p className="text-xs font-normal text-[#6c757d]">
                            Dilengkapi Rubrik Penilaian 5 Indikator (Bobot 100%) dan Cetak Berita Acara Serah Terima
                            (BAST) sesuai Blueprint Ruang Modal SMA Double Track.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <button
                            type="button"
                            onClick={handlePrintPdf}
                            className="bs-btn bs-btn-sm bs-btn-outline-primary"
                            title="Cetak / Unduh Laporan PDF"
                        >
                            <Printer className="w-3.5 h-3.5" />
                            Print Laporan (PDF)
                        </button>
                        <button
                            type="button"
                            onClick={handleExportExcel}
                            className="bs-btn bs-btn-sm bs-btn-success"
                            title="Export Data ke Excel (.xlsx)"
                        >
                            <FileSpreadsheet className="w-3.5 h-3.5" />
                            Export Excel
                        </button>
                        <span className="bs-badge bs-badge-primary">{modal.length} Data</span>
                    </div>
                </div>

                <div className="bs-card-body space-y-3">
                    {flash && (
                        <div className="bs-alert bs-alert-success">
                            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                            <span>{flash}</span>
                        </div>
                    )}

                    <DataTable
                        data={modal}
                        columns={columns}
                        searchPlaceholder="Cari kode, nama alumni, sekolah, kompetensi, nomor BAST..."
                        filterColumn="status_seleksi"
                        filterOptions={STATUS_OPTIONS}
                        onRowClick={(row) => navigate(`/admin/modal/${row.id}`)}
                    />
                </div>
            </div>

            {/* Modal Rubrik Seleksi 5 Indikator & Penyaluran BAST */}
            {selected && (
                <div className="bs-modal-backdrop" onClick={() => setSelected(null)}>
                    <div className="bs-modal-dialog max-w-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="bs-modal-header">
                            <div>
                                <h3 className="font-bold text-sm text-[#203880]">
                                    Rubrik Seleksi & Penetapan BAST — {selected.kode}
                                </h3>
                                <p className="text-[11px] text-[#64748b]">
                                    Pemohon: {selected.nama} ({selected.sekolah} • {selected.kompetensi})
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelected(null)}
                                className="text-[#6c757d] hover:text-[#212529]"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSave}>
                            <div className="bs-modal-body space-y-4 text-xs">
                                {/* Ringkasan Proposal */}
                                <div className="p-3 bg-[#f8fafd] rounded border border-[#dbe3f0] space-y-1">
                                    <div className="flex flex-wrap justify-between gap-2">
                                        <span>
                                            <strong>Jalur & Jenis:</strong> Ruang Modal {selected.jalur} —{' '}
                                            {selected.jenis_bantuan}
                                        </span>
                                        <span>
                                            <strong>Estimasi Pengajuan:</strong>{' '}
                                            <span className="text-[#008a75] font-bold">
                                                {formatRupiah(selected.estimasi_biaya)}
                                            </span>
                                        </span>
                                    </div>
                                    <div>
                                        <strong>Rincian Kebutuhan:</strong> {selected.rincian_kebutuhan}
                                    </div>
                                    <div>
                                        <strong>Rencana & Target:</strong> {selected.rencana_deskripsi}
                                    </div>
                                    {selected.guru_pendamping && (
                                        <div>
                                            <strong>Guru Pendamping Sekolah:</strong> {selected.guru_pendamping}
                                        </div>
                                    )}

                                    {/* DOKUMEN LAMPIRAN DI PROSES SELEKSI */}
                                    <div className="p-2.5 rounded bg-white border border-[#b6d4fe] flex items-center justify-between gap-2 mt-2">
                                        <div className="flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-[#0068b0] shrink-0" />
                                            <div>
                                                <div className="font-bold text-[#203880]">
                                                    Dokumen Lampiran Proposal / RAB:
                                                </div>
                                                <div className="text-[11px] text-[#64748b]">
                                                    {selected.dokumen_lampiran
                                                        ? selected.dokumen_lampiran.split('/').pop()
                                                        : 'Pemohon tidak menyertakan berkas lampiran'}
                                                </div>
                                            </div>
                                        </div>
                                        {selected.dokumen_lampiran ? (
                                            <a
                                                href={selected.dokumen_lampiran}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="bs-btn bs-btn-sm bs-btn-outline-primary shrink-0 flex items-center gap-1"
                                            >
                                                <ExternalLink className="w-3.5 h-3.5" />
                                                Buka Berkas
                                            </a>
                                        ) : (
                                            <span className="text-[11px] text-amber-600 font-medium">
                                                (Tidak ada berkas)
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Bagian 1: Rubrik Penilaian 5 Indikator */}
                                <div className="p-3.5 rounded border border-[#dbe3f0] bg-white space-y-3">
                                    <div className="flex items-center justify-between border-b border-[#eef2f9] pb-2">
                                        <span className="font-bold text-[#203880] flex items-center gap-1.5">
                                            <Award className="w-4 h-4 text-[#f8a000]" />
                                            Rubrik Penilaian Seleksi (5 Indikator Blueprint)
                                        </span>
                                        <span
                                            className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                                                calculatedSkorTotal >= 75
                                                    ? 'bg-[#d1e7dd] text-[#0f5132]'
                                                    : 'bg-[#fff3cd] text-[#664d03]'
                                            }`}
                                        >
                                            Skor Akhir: {calculatedSkorTotal} / 100
                                        </span>
                                    </div>

                                    <div className="space-y-2.5">
                                        {RUBRIK_INDIKATOR.map((ind) => (
                                            <div
                                                key={ind.key}
                                                className="grid grid-cols-12 items-center gap-2"
                                            >
                                                <div className="col-span-7 sm:col-span-8">
                                                    <span className="font-medium text-[#1e293b]">
                                                        {ind.label}
                                                    </span>
                                                    <span className="ml-1.5 px-1.5 py-0.2 rounded bg-[#e6f2ff] text-[#00528c] text-[10px] font-bold">
                                                        Bobot {ind.weightLabel}
                                                    </span>
                                                </div>
                                                <div className="col-span-3 sm:col-span-2">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="100"
                                                        value={reviewForm[ind.key]}
                                                        onChange={(e) =>
                                                            setReviewForm((p) => ({
                                                                ...p,
                                                                [ind.key]: e.target.value,
                                                            }))
                                                        }
                                                        className="bs-form-control py-1 text-center font-bold"
                                                    />
                                                </div>
                                                <div className="col-span-2 text-right font-semibold text-[#203880]">
                                                    +{(Number(reviewForm[ind.key] || 0) * ind.weight).toFixed(1)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Bagian 2: Status Seleksi & Penyaluran BAST */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="bs-form-label">Status Seleksi & Penyaluran *</label>
                                        <select
                                            value={reviewForm.status_seleksi}
                                            onChange={(e) =>
                                                setReviewForm((p) => ({
                                                    ...p,
                                                    status_seleksi: e.target.value,
                                                }))
                                            }
                                            className="bs-form-select"
                                        >
                                            {STATUS_OPTIONS.map((opt) => (
                                                <option key={opt} value={opt}>
                                                    {opt}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="bs-form-label">Nominal Bantuan Disetujui (Rp)</label>
                                        <CurrencyInput
                                            name="nominal_disetujui"
                                            value={reviewForm.nominal_disetujui}
                                            onChange={(e) =>
                                                setReviewForm((p) => ({
                                                    ...p,
                                                    nominal_disetujui: e.target.value,
                                                }))
                                            }
                                            mode="numeric"
                                            placeholder="3.500.000"
                                        />
                                    </div>

                                    {['Disetujui', 'Disalurkan'].includes(reviewForm.status_seleksi) && (
                                        <>
                                            <div>
                                                <label className="bs-form-label">
                                                    Nomor Berita Acara Serah Terima (BAST)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={reviewForm.nomor_bast}
                                                    onChange={(e) =>
                                                        setReviewForm((p) => ({
                                                            ...p,
                                                            nomor_bast: e.target.value,
                                                        }))
                                                    }
                                                    placeholder="BAST/DT-RM/2026/..."
                                                    className="bs-form-control"
                                                />
                                            </div>

                                            <div>
                                                <label className="bs-form-label">Tanggal Penyaluran / BAST</label>
                                                <input
                                                    type="date"
                                                    value={reviewForm.tanggal_penyaluran}
                                                    onChange={(e) =>
                                                        setReviewForm((p) => ({
                                                            ...p,
                                                            tanggal_penyaluran: e.target.value,
                                                        }))
                                                    }
                                                    className="bs-form-control"
                                                />
                                            </div>

                                            <div className="sm:col-span-2">
                                                <label className="bs-form-label">
                                                    Rincian Barang / Alat / Modal yang Disetujui & Disalurkan
                                                </label>
                                                <textarea
                                                    rows="2"
                                                    value={reviewForm.rincian_bantuan_disalurkan}
                                                    onChange={(e) =>
                                                        setReviewForm((p) => ({
                                                            ...p,
                                                            rincian_bantuan_disalurkan: e.target.value,
                                                        }))
                                                    }
                                                    className="bs-form-control"
                                                />
                                            </div>
                                        </>
                                    )}

                                    <div className="sm:col-span-2">
                                        <label className="bs-form-label">Catatan Verifikasi / Evaluasi Admin</label>
                                        <textarea
                                            rows="2"
                                            value={reviewForm.catatan_admin}
                                            onChange={(e) =>
                                                setReviewForm((p) => ({
                                                    ...p,
                                                    catatan_admin: e.target.value,
                                                }))
                                            }
                                            placeholder="Catatan hasil verifikasi proposal, rekomendasi sekolah, atau jadwal penyaluran..."
                                            className="bs-form-control"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bs-modal-footer">
                                <button
                                    type="button"
                                    onClick={() => setSelected(null)}
                                    className="bs-btn bs-btn-sm bs-btn-outline-secondary"
                                >
                                    Batal
                                </button>
                                <button type="submit" className="bs-btn bs-btn-sm bs-btn-primary">
                                    Simpan Seleksi & Penyaluran
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
