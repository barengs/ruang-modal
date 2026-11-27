import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    AlertCircle,
    ArrowLeft,
    Award,
    Briefcase,
    Calendar,
    CheckCircle2,
    Clock,
    DollarSign,
    Download,
    Edit3,
    ExternalLink,
    FileCheck,
    FileText,
    GraduationCap,
    History,
    Mail,
    Phone,
    Printer,
    ShieldCheck,
    Trash2,
    User,
    X,
} from 'lucide-react';
import {
    clearAdminNotice,
    deleteModalItem,
    fetchModalItem,
    fetchModalList,
    updateModalItem,
} from '../../store/slices/adminSlice';
import { hasPermission } from '../../store/slices/authSlice';
import StatusBadge from '../../components/StatusBadge';
import CurrencyInput from '../../components/CurrencyInput';
import { formatDateTime, formatRupiah } from '../../utils/format';
import { exportBastPdf, exportToPdfReport } from '../../utils/reportExporter';

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

export default function AdminModalDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { modal, flash } = useSelector((state) => state.admin);
    const { user } = useSelector((state) => state.auth);

    const [loading, setLoading] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
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

    // Find the application item in Redux store or fetch it
    const item = useMemo(
        () => modal.find((m) => String(m.id) === String(id)) || null,
        [modal, id]
    );

    useEffect(() => {
        if (!item) {
            setLoading(true);
            dispatch(fetchModalItem(id))
                .unwrap()
                .catch(() => {
                    // Fallback to fetchModalList if fetchModalItem fails
                    dispatch(fetchModalList());
                })
                .finally(() => setLoading(false));
        }
        return () => dispatch(clearAdminNotice());
    }, [dispatch, id, item]);

    // Chronological timeline
    const timeline = useMemo(() => {
        if (!item) return [];
        if (Array.isArray(item.histories) && item.histories.length > 0) {
            return item.histories;
        }
        const entries = [
            {
                id: 'init',
                status_seleksi: 'Menunggu Seleksi',
                catatan: 'Pengajuan Ruang Modal dikirim oleh pemohon.',
                actor_type: 'pemohon',
                actor_name: item.nama,
                created_at: item.created_at,
            },
        ];
        if (item.status_seleksi !== 'Menunggu Seleksi' || item.catatan_admin) {
            entries.push({
                id: 'review',
                status_seleksi: item.status_seleksi,
                catatan: item.catatan_admin || `Status diperbarui menjadi ${item.status_seleksi}.`,
                actor_type: 'admin',
                actor_name: item.reviewer?.name || 'Admin Pengelola',
                created_at: item.updated_at || item.created_at,
            });
        }
        return entries;
    }, [item]);

    // Submissions from the same applicant
    const applicantSubmissions = useMemo(() => {
        if (!item || !Array.isArray(modal)) return [];
        const normEmail = (item.email || '').trim().toLowerCase();
        const normWa = (item.whatsapp || '').replace(/\D/g, '');
        const normNama = (item.nama || '').trim().toLowerCase();

        return modal.filter((other) => {
            if (normEmail && (other.email || '').trim().toLowerCase() === normEmail) return true;
            if (normWa && (other.whatsapp || '').replace(/\D/g, '') === normWa) return true;
            if (normNama && (other.nama || '').trim().toLowerCase() === normNama) return true;
            return other.id === item.id;
        });
    }, [item, modal]);

    const calculatedSkorTotal = useMemo(() => {
        const total = RUBRIK_INDIKATOR.reduce((acc, ind) => {
            const val = Number(reviewForm[ind.key] || 0);
            return acc + val * ind.weight;
        }, 0);
        return Math.round(total * 100) / 100;
    }, [reviewForm]);

    const openReview = () => {
        if (!item) return;
        const suffix = (item.kode || '').replace(/[^A-Z0-9]/gi, '').slice(-6);
        const defaultBast = item.nomor_bast || `BAST/DT-RM/${new Date().getFullYear()}/${suffix}`;
        setReviewForm({
            status_seleksi: item.status_seleksi || 'Disetujui',
            catatan_admin: item.catatan_admin || '',
            skor_kompetensi: item.skor_kompetensi ?? 85,
            skor_rencana: item.skor_rencana ?? 85,
            skor_kebutuhan: item.skor_kebutuhan ?? 85,
            skor_dampak: item.skor_dampak ?? 85,
            skor_komitmen: item.skor_komitmen ?? 90,
            nominal_disetujui: item.nominal_disetujui ?? item.estimasi_biaya ?? 0,
            rincian_bantuan_disalurkan: item.rincian_bantuan_disalurkan || item.rincian_kebutuhan || '',
            nomor_bast: defaultBast,
            tanggal_penyaluran: item.tanggal_penyaluran || new Date().toISOString().slice(0, 10),
        });
        setShowReviewModal(true);
    };

    const handleSaveReview = async (e) => {
        e.preventDefault();
        if (!item) return;
        const res = await dispatch(
            updateModalItem({
                id: item.id,
                payload: {
                    ...reviewForm,
                    skor_kompetensi: Number(reviewForm.skor_kompetensi || 0),
                    skor_rencana: Number(reviewForm.skor_rencana || 0),
                    skor_kebutuhan: Number(reviewForm.skor_kebutuhan || 0),
                    skor_dampak: Number(reviewForm.skor_dampak || 0),
                    skor_komitmen: Number(reviewForm.skor_komitmen || 0),
                    nominal_disetujui: reviewForm.nominal_disetujui
                        ? Number(reviewForm.nominal_disetujui)
                        : Number(item.estimasi_biaya || 0),
                },
            })
        );
        setShowReviewModal(false);
        if (updateModalItem.fulfilled.match(res)) {
            toast.success(res.payload?.message || 'Proses seleksi berhasil disimpan.');
        } else {
            toast.error(res.payload || 'Gagal menyimpan hasil seleksi.');
        }
    };

    const handleDelete = async () => {
        if (!item) return;
        if (!window.confirm(`Hapus pengajuan ${item.kode} milik ${item.nama}?`)) return;
        const res = await dispatch(deleteModalItem(item.id));
        if (deleteModalItem.fulfilled.match(res)) {
            toast.success(`Pengajuan ${item.kode} berhasil dihapus.`);
            navigate('/admin/modal');
        } else {
            toast.error(res.payload || 'Gagal menghapus pengajuan.');
        }
    };

    const handlePrintSinglePdf = () => {
        if (!item) return;
        exportToPdfReport({
            title: `DETAIL PENGAJUAN RUANG MODAL — ${item.kode}`,
            subtitle: `Data pengajuan bantuan modal usaha alumni: ${item.nama} (${item.sekolah})`,
            filename: `Pengajuan-${item.kode}`,
            columns: [
                { header: 'No', width: 35, accessor: (_, i) => i + 1 },
                { header: 'Kode', width: 90, accessor: (r) => r.kode },
                { header: 'Nama Pemohon', width: 110, accessor: (r) => r.nama },
                { header: 'Sekolah & Kompetensi', width: 130, accessor: (r) => `${r.sekolah} (${r.kompetensi})` },
                { header: 'Jenis Bantuan', width: 90, accessor: (r) => r.jenis_bantuan },
                { header: 'Estimasi Biaya', width: 85, accessor: (r) => formatRupiah(r.estimasi_biaya) },
                { header: 'Disetujui', width: 85, accessor: (r) => formatRupiah(r.nominal_disetujui || r.estimasi_biaya) },
                { header: 'Skor Total', width: 60, accessor: (r) => (r.skor_total != null ? `${r.skor_total}/100` : '-') },
                { header: 'Status', width: 80, accessor: (r) => r.status_seleksi },
            ],
            data: [item],
        });
    };

    const isEligibleBast = item && ['Disetujui', 'Disalurkan'].includes(item.status_seleksi);
    const isImageLampiran = item?.dokumen_lampiran && /\.(jpg|jpeg|png|webp)$/i.test(item.dokumen_lampiran);
    const isPdfLampiran = item?.dokumen_lampiran && /\.pdf$/i.test(item.dokumen_lampiran);

    if (loading && !item) {
        return (
            <div className="bs-card p-12 text-center text-[#64748b]">
                <div className="w-8 h-8 border-3 border-[#203880] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm font-medium">Memuat detail pengajuan Ruang Modal...</p>
            </div>
        );
    }

    if (!item) {
        return (
            <div className="bs-card p-8 text-center space-y-3">
                <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
                <h2 className="text-base font-bold text-[#203880]">Pengajuan Tidak Ditemukan</h2>
                <p className="text-xs text-[#64748b]">
                    Data pengajuan dengan ID #{id} tidak ditemukan atau telah dihapus.
                </p>
                <div>
                    <Link to="/admin/modal" className="bs-btn bs-btn-sm bs-btn-primary">
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Kembali ke Ruang Modal
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Top Navigation Bar / Breadcrumb */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-lg border border-[#dbe3f0] shadow-xs">
                <div className="flex items-center gap-2">
                    <Link
                        to="/admin/modal"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0068b0] hover:text-[#203880] px-2.5 py-1.5 rounded hover:bg-[#eef4ff] transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Daftar Ruang Modal
                    </Link>
                    <span className="text-slate-300">/</span>
                    <span className="text-xs font-medium text-[#64748b]">Detail Pengajuan</span>
                    <span className="text-slate-300">/</span>
                    <code className="text-xs font-bold text-[#203880] bg-[#eef4ff] px-2 py-0.5 rounded border border-[#dbe3f0]">
                        {item.kode}
                    </code>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    {isEligibleBast && (
                        <button
                            type="button"
                            onClick={() => exportBastPdf(item, formatRupiah)}
                            className="bs-btn bs-btn-sm bs-btn-success"
                            title="Unduh Berita Acara Serah Terima (BAST)"
                        >
                            <FileCheck className="w-3.5 h-3.5" />
                            Cetak BAST (PDF)
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={handlePrintSinglePdf}
                        className="bs-btn bs-btn-sm bs-btn-outline-primary"
                        title="Cetak Ringkasan Pengajuan"
                    >
                        <Printer className="w-3.5 h-3.5" />
                        Print Laporan
                    </button>
                    {canUpdate && (
                        <button
                            type="button"
                            onClick={openReview}
                            className="bs-btn bs-btn-sm bs-btn-primary"
                        >
                            <Edit3 className="w-3.5 h-3.5" />
                            Proses Seleksi & Rubrik
                        </button>
                    )}
                    {canDelete && (
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="bs-btn bs-btn-sm bs-btn-outline-danger"
                            title="Hapus Pengajuan"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </div>

            {flash && (
                <div className="bs-alert bs-alert-success">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{flash}</span>
                </div>
            )}

            {/* Header Hero Card */}
            <div className="bs-card border-l-4 border-l-[#203880]">
                <div className="bs-card-body p-4 sm:p-5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2.5 flex-wrap">
                                <h1 className="text-lg sm:text-xl font-bold text-[#203880]">{item.nama}</h1>
                                <code className="px-2 py-0.5 rounded bg-[#e7f1ff] text-[#203880] text-xs font-bold border border-[#b6d4fe]">
                                    {item.kode}
                                </code>
                                <StatusBadge status={item.status_seleksi} />
                            </div>
                            <p className="text-xs text-[#64748b] flex flex-wrap items-center gap-2">
                                <span className="font-medium text-[#334155]">{item.sekolah}</span>
                                <span>•</span>
                                <span>Tahun Lulus {item.tahun_lulus}</span>
                                <span>•</span>
                                <span className="font-semibold text-[#0068b0]">{item.kompetensi}</span>
                                <span>•</span>
                                <span className="bs-badge bs-badge-info">Jalur {item.jalur}</span>
                            </p>
                        </div>

                        {/* Top Meta Details */}
                        <div className="flex flex-wrap items-center gap-2 text-xs text-[#64748b]">
                            <div className="px-3 py-1.5 bg-[#f8fafd] rounded border border-[#dbe3f0] flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-[#0068b0]" />
                                <span>
                                    Diajukan: <strong>{formatDateTime(item.created_at)}</strong>
                                </span>
                            </div>
                            {item.reviewer?.name && (
                                <div className="px-3 py-1.5 bg-[#f8fafd] rounded border border-[#dbe3f0] flex items-center gap-1.5">
                                    <ShieldCheck className="w-3.5 h-3.5 text-[#198754]" />
                                    <span>
                                        Peninjau: <strong>{item.reviewer.name}</strong>
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* KPI Quick Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 mt-4 border-t border-[#eef2f9]">
                        <div className="p-3 bg-[#f8fafd] rounded-lg border border-[#dbe3f0]">
                            <div className="text-[11px] font-medium text-[#64748b]">Estimasi Bantuan</div>
                            <div className="text-sm sm:text-base font-extrabold text-[#008a75] mt-0.5">
                                {formatRupiah(item.estimasi_biaya)}
                            </div>
                            <div className="text-[10px] text-[#64748b]">{item.jenis_bantuan}</div>
                        </div>

                        <div className="p-3 bg-[#f8fafd] rounded-lg border border-[#dbe3f0]">
                            <div className="text-[11px] font-medium text-[#64748b]">Nominal Disetujui</div>
                            <div className="text-sm sm:text-base font-extrabold text-[#203880] mt-0.5">
                                {item.nominal_disetujui != null ? formatRupiah(item.nominal_disetujui) : '-'}
                            </div>
                            <div className="text-[10px] text-[#64748b]">
                                {item.nominal_disetujui != null ? 'Telah diverifikasi' : 'Menunggu seleksi'}
                            </div>
                        </div>

                        <div className="p-3 bg-[#f8fafd] rounded-lg border border-[#dbe3f0]">
                            <div className="text-[11px] font-medium text-[#64748b]">Skor Rubrik 5 Indikator</div>
                            <div className="text-sm sm:text-base font-extrabold text-[#203880] mt-0.5 flex items-center gap-1">
                                <Award className="w-4 h-4 text-[#f8a000]" />
                                {item.skor_total != null ? `${item.skor_total} / 100` : 'Belum dinilai'}
                            </div>
                            <div className="text-[10px] text-[#64748b]">
                                {item.skor_total != null
                                    ? item.skor_total >= 75
                                        ? 'Memenuhi syarat'
                                        : 'Di bawah batas'
                                    : 'Standar kelayakan 75+'}
                            </div>
                        </div>

                        <div className="p-3 bg-[#f8fafd] rounded-lg border border-[#dbe3f0]">
                            <div className="text-[11px] font-medium text-[#64748b]">Nomor BAST</div>
                            <div className="text-xs sm:text-sm font-mono font-bold text-[#203880] mt-0.5 truncate">
                                {item.nomor_bast || '-'}
                            </div>
                            <div className="text-[10px] text-[#64748b]">
                                {item.tanggal_penyaluran ? `Salur: ${item.tanggal_penyaluran}` : 'Belum disalurkan'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Layout: Left 8 cols, Right 4 cols */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                {/* Left Column */}
                <div className="lg:col-span-8 space-y-4">
                    {/* CARD 1: DOKUMEN LAMPIRAN PROPOSAL & RAB (PROMINENT) */}
                    <div className="bs-card border-2 border-[#0068b0]/30 shadow-xs">
                        <div className="bs-card-header bg-[#f0f6ff] border-b border-[#dbe3f0] flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-[#0068b0]" />
                                <h2 className="text-sm font-bold text-[#203880]">
                                    Dokumen Lampiran Proposal & RAB
                                </h2>
                            </div>
                            {item.dokumen_lampiran ? (
                                <span className="bs-badge bs-badge-success flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> Berkas Terlampir
                                </span>
                            ) : (
                                <span className="bs-badge bs-badge-warning">Tidak Ada Berkas</span>
                            )}
                        </div>
                        <div className="bs-card-body p-4">
                            {item.dokumen_lampiran ? (
                                <div className="space-y-3">
                                    <div className="p-3.5 rounded-lg border border-[#b6d4fe] bg-[#f8fafd] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-[#e7f1ff] border border-[#b6d4fe] flex items-center justify-center shrink-0">
                                                {isPdfLampiran ? (
                                                    <FileText className="w-5 h-5 text-red-600" />
                                                ) : isImageLampiran ? (
                                                    <FileText className="w-5 h-5 text-emerald-600" />
                                                ) : (
                                                    <FileText className="w-5 h-5 text-[#0068b0]" />
                                                )}
                                            </div>
                                            <div className="space-y-0.5 min-w-0">
                                                <div className="font-semibold text-xs text-[#203880] truncate max-w-sm">
                                                    {item.dokumen_lampiran.split('/').pop()}
                                                </div>
                                                <p className="text-[11px] text-[#64748b]">
                                                    Format:{' '}
                                                    <span className="uppercase font-bold text-[#334155]">
                                                        {item.dokumen_lampiran.split('.').pop()}
                                                    </span>{' '}
                                                    • Berkas proposal/RAB pengajuan bantuan modal alumni
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            <a
                                                href={item.dokumen_lampiran}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="bs-btn bs-btn-sm bs-btn-primary flex items-center gap-1.5"
                                            >
                                                <ExternalLink className="w-3.5 h-3.5" />
                                                Buka Berkas (Tab Baru)
                                            </a>
                                            <a
                                                href={item.dokumen_lampiran}
                                                download
                                                className="bs-btn bs-btn-sm bs-btn-outline-secondary flex items-center gap-1.5"
                                                title="Unduh Berkas Lampiran"
                                            >
                                                <Download className="w-3.5 h-3.5" />
                                                Unduh
                                            </a>
                                        </div>
                                    </div>

                                    {/* Preview if Image */}
                                    {isImageLampiran && (
                                        <div className="rounded-lg border border-[#dbe3f0] overflow-hidden bg-slate-50 p-2 text-center">
                                            <div className="text-[11px] text-[#64748b] mb-1 font-medium">
                                                Pratinjau Gambar Lampiran:
                                            </div>
                                            <img
                                                src={item.dokumen_lampiran}
                                                alt="Lampiran Proposal Modal"
                                                className="max-h-80 w-auto mx-auto object-contain rounded border border-[#e2e8f0]"
                                            />
                                        </div>
                                    )}

                                    {/* Embed if PDF */}
                                    {isPdfLampiran && (
                                        <div className="rounded-lg border border-[#dbe3f0] overflow-hidden bg-slate-50 p-2">
                                            <div className="flex items-center justify-between text-[11px] text-[#64748b] mb-1.5 font-medium px-1">
                                                <span>Pratinjau Dokumen PDF:</span>
                                                <a
                                                    href={item.dokumen_lampiran}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-[#0068b0] hover:underline flex items-center gap-1"
                                                >
                                                    Perbesar Tampilan <ExternalLink className="w-3 h-3" />
                                                </a>
                                            </div>
                                            <iframe
                                                src={item.dokumen_lampiran}
                                                title="Pratinjau PDF Dokumen Lampiran"
                                                className="w-full h-96 rounded border border-[#e2e8f0]"
                                            />
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="p-4 rounded-lg bg-[#fff8e6] border border-[#ffe082] text-xs text-[#8a5b00] flex items-start gap-2.5">
                                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#f8a000]" />
                                    <div>
                                        <div className="font-bold">Pemohon Tidak Menyertakan Dokumen Lampiran</div>
                                        <p className="mt-0.5 text-[11px] leading-relaxed">
                                            Pemohon alumni belum mengunggah file proposal atau RAB terperinci pada
                                            pengajuan ini. Anda dapat meminta pemohon untuk mengirimkan dokumen
                                            pendukung melalui status "Perlu Perbaikan" atau menghubungi via WhatsApp.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* CARD 2: Rincian Kebutuhan & Rencana Kerja / Usaha */}
                    <div className="bs-card">
                        <div className="bs-card-header">
                            <h2 className="text-sm font-bold text-[#203880] flex items-center gap-1.5">
                                <Briefcase className="w-4 h-4 text-[#0068b0]" />
                                Rincian Kebutuhan Bantuan & Rencana Pemanfaatan
                            </h2>
                        </div>
                        <div className="bs-card-body p-4 space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                <div className="p-3.5 rounded-lg bg-[#f8fafd] border border-[#dbe3f0] space-y-1.5">
                                    <div className="font-bold text-[#203880] flex items-center gap-1.5">
                                        <DollarSign className="w-3.5 h-3.5 text-[#008a75]" />
                                        Rincian Peralatan / Kebutuhan Modal:
                                    </div>
                                    <p className="text-[#334155] leading-relaxed whitespace-pre-line font-normal">
                                        {item.rincian_kebutuhan}
                                    </p>
                                </div>

                                <div className="p-3.5 rounded-lg bg-[#f8fafd] border border-[#dbe3f0] space-y-1.5">
                                    <div className="font-bold text-[#203880] flex items-center gap-1.5">
                                        <GraduationCap className="w-3.5 h-3.5 text-[#0068b0]" />
                                        Rencana Pemanfaatan & Target Omzet:
                                    </div>
                                    <p className="text-[#334155] leading-relaxed whitespace-pre-line font-normal">
                                        {item.rencana_deskripsi}
                                    </p>
                                </div>
                            </div>

                            {item.guru_pendamping && (
                                <div className="p-3 rounded-lg bg-[#f1f5f9] border border-[#e2e8f0] text-xs flex items-center justify-between gap-2">
                                    <span className="text-[#64748b]">Guru Pendamping Sekolah SMA DT:</span>
                                    <strong className="text-[#203880] font-semibold">
                                        {item.guru_pendamping}
                                    </strong>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* CARD 3: Hasil Rubrik Penilaian 5 Indikator */}
                    {item.skor_total != null && (
                        <div className="bs-card">
                            <div className="bs-card-header flex items-center justify-between">
                                <h2 className="text-sm font-bold text-[#203880] flex items-center gap-1.5">
                                    <Award className="w-4 h-4 text-[#f8a000]" />
                                    Hasil Rubrik Penilaian Seleksi (5 Indikator Blueprint)
                                </h2>
                                <span className="bs-badge bs-badge-primary">
                                    Nilai Akhir: {item.skor_total} / 100
                                </span>
                            </div>
                            <div className="bs-card-body p-4">
                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs text-center">
                                    <div className="p-2.5 rounded-lg bg-[#f8fafd] border border-[#dbe3f0]">
                                        <div className="text-[11px] text-[#64748b]">Kompetensi (20%)</div>
                                        <div className="font-bold text-base text-[#203880] mt-1">
                                            {item.skor_kompetensi ?? '-'}
                                        </div>
                                    </div>
                                    <div className="p-2.5 rounded-lg bg-[#f8fafd] border border-[#dbe3f0]">
                                        <div className="text-[11px] text-[#64748b]">Rencana (25%)</div>
                                        <div className="font-bold text-base text-[#203880] mt-1">
                                            {item.skor_rencana ?? '-'}
                                        </div>
                                    </div>
                                    <div className="p-2.5 rounded-lg bg-[#f8fafd] border border-[#dbe3f0]">
                                        <div className="text-[11px] text-[#64748b]">Ketepatan Alat (25%)</div>
                                        <div className="font-bold text-base text-[#203880] mt-1">
                                            {item.skor_kebutuhan ?? '-'}
                                        </div>
                                    </div>
                                    <div className="p-2.5 rounded-lg bg-[#f8fafd] border border-[#dbe3f0]">
                                        <div className="text-[11px] text-[#64748b]">Dampak Ekonomi (20%)</div>
                                        <div className="font-bold text-base text-[#203880] mt-1">
                                            {item.skor_dampak ?? '-'}
                                        </div>
                                    </div>
                                    <div className="p-2.5 rounded-lg bg-[#f8fafd] border border-[#dbe3f0]">
                                        <div className="text-[11px] text-[#64748b]">Komitmen (10%)</div>
                                        <div className="font-bold text-base text-[#203880] mt-1">
                                            {item.skor_komitmen ?? '-'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* CARD 4: Catatan Evaluasi Admin */}
                    <div className="bs-card">
                        <div className="bs-card-header">
                            <h2 className="text-sm font-bold text-[#203880]">
                                Catatan Evaluasi & Rekomendasi Verifikator
                            </h2>
                        </div>
                        <div className="bs-card-body p-4 text-xs">
                            <div className="p-3 rounded-lg bg-[#f8fafd] border border-[#dbe3f0] text-[#334155] leading-relaxed">
                                {item.catatan_admin || 'Belum ada catatan evaluasi dari tim pengelola.'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-4 space-y-4">
                    {/* CARD 1: Data Pemohon Alumni */}
                    <div className="bs-card">
                        <div className="bs-card-header">
                            <h2 className="text-sm font-bold text-[#203880] flex items-center gap-1.5">
                                <User className="w-4 h-4 text-[#0068b0]" />
                                Data Alumni Pemohon
                            </h2>
                        </div>
                        <div className="bs-card-body p-4 space-y-2.5 text-xs">
                            <div className="flex justify-between items-center gap-2 pb-2 border-b border-[#f1f5f9]">
                                <span className="text-[#64748b]">Nama Lengkap</span>
                                <span className="font-bold text-[#203880] text-right">{item.nama}</span>
                            </div>
                            <div className="flex justify-between gap-2 pb-2 border-b border-[#f1f5f9]">
                                <span className="text-[#64748b]">Asal Sekolah</span>
                                <span className="font-medium text-[#334155] text-right">
                                    {item.sekolah} ({item.tahun_lulus})
                                </span>
                            </div>
                            <div className="flex justify-between gap-2 pb-2 border-b border-[#f1f5f9]">
                                <span className="text-[#64748b]">Kompetensi DT</span>
                                <span className="font-semibold text-[#0068b0] text-right">
                                    {item.kompetensi}
                                </span>
                            </div>
                            <div className="flex justify-between gap-2 pb-2 border-b border-[#f1f5f9]">
                                <span className="text-[#64748b]">Status Aktivitas</span>
                                <span className="font-medium text-[#334155] text-right">
                                    {item.status_aktivitas || '-'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center gap-2 pb-2 border-b border-[#f1f5f9]">
                                <span className="text-[#64748b] flex items-center gap-1">
                                    <Mail className="w-3.5 h-3.5" /> Email
                                </span>
                                <span className="font-medium text-[#334155] text-right">
                                    {item.email || '-'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center gap-2 pb-2 border-b border-[#f1f5f9]">
                                <span className="text-[#64748b] flex items-center gap-1">
                                    <Phone className="w-3.5 h-3.5" /> WhatsApp
                                </span>
                                {item.whatsapp ? (
                                    <a
                                        href={`https://wa.me/${item.whatsapp.replace(/\D/g, '')}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="font-semibold text-[#198754] hover:underline text-right"
                                    >
                                        {item.whatsapp}
                                    </a>
                                ) : (
                                    <span className="font-medium text-[#334155]">-</span>
                                )}
                            </div>
                            <div className="flex justify-between items-center gap-2">
                                <span className="text-[#64748b]">Komitmen Binaan</span>
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#198754]">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Bersedia Didampingi
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* CARD 2: Detail Penyaluran BAST */}
                    <div className="bs-card">
                        <div className="bs-card-header">
                            <h2 className="text-sm font-bold text-[#203880] flex items-center gap-1.5">
                                <FileCheck className="w-4 h-4 text-[#198754]" />
                                Informasi Penyaluran & BAST
                            </h2>
                        </div>
                        <div className="bs-card-body p-4 space-y-2.5 text-xs">
                            <div className="flex justify-between items-center gap-2 pb-2 border-b border-[#f1f5f9]">
                                <span className="text-[#64748b]">Status Terakhir</span>
                                <StatusBadge status={item.status_seleksi} />
                            </div>
                            <div className="flex justify-between items-center gap-2 pb-2 border-b border-[#f1f5f9]">
                                <span className="text-[#64748b]">Nomor BAST</span>
                                <code className="font-bold text-[#008a75] text-right">
                                    {item.nomor_bast || '-'}
                                </code>
                            </div>
                            <div className="flex justify-between items-center gap-2 pb-2 border-b border-[#f1f5f9]">
                                <span className="text-[#64748b]">Tanggal Penyaluran</span>
                                <span className="font-medium text-[#334155]">
                                    {item.tanggal_penyaluran || '-'}
                                </span>
                            </div>
                            {item.rincian_bantuan_disalurkan && (
                                <div className="pt-1">
                                    <span className="text-[#64748b] block mb-1">Rincian Bantuan Disalurkan:</span>
                                    <div className="p-2.5 rounded bg-[#f8fafd] border border-[#dbe3f0] text-[#334155]">
                                        {item.rincian_bantuan_disalurkan}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* CARD 3: Timeline Riwayat Status */}
                    <div className="bs-card">
                        <div className="bs-card-header flex items-center justify-between">
                            <h2 className="text-sm font-bold text-[#203880] flex items-center gap-1.5">
                                <History className="w-4 h-4 text-[#0068b0]" />
                                Riwayat Status Pengajuan
                            </h2>
                            <span className="bs-badge bs-badge-secondary">{timeline.length} Log</span>
                        </div>
                        <div className="bs-card-body p-4">
                            <div className="relative pl-5 space-y-3 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#dee2e6]">
                                {timeline.map((log, idx) => (
                                    <div
                                        key={log.id || idx}
                                        className="relative p-2.5 rounded border border-[#e9ecef] bg-[#fcfcfd] text-xs space-y-1"
                                    >
                                        <span
                                            className={`absolute -left-[19px] top-3 w-2.5 h-2.5 rounded-full border-2 border-white ${
                                                log.actor_type === 'admin' ? 'bg-[#198754]' : 'bg-[#0068b0]'
                                            }`}
                                        />
                                        <div className="flex items-center justify-between gap-1 flex-wrap">
                                            <StatusBadge status={log.status_seleksi} />
                                            <span className="text-[10px] text-[#64748b]">
                                                {formatDateTime(log.created_at)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[11px] text-[#334155]">
                                            <span className="font-semibold text-[#203880]">{log.actor_name}</span>
                                            <span className="text-[10px] text-[#64748b]">
                                                ({log.actor_type === 'admin' ? 'Pengelola' : 'Pemohon'})
                                            </span>
                                        </div>
                                        {log.catatan && (
                                            <p className="text-[#64748b] text-[11px] leading-relaxed pt-0.5">
                                                {log.catatan}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* CARD 4: Riwayat Pengajuan Lain oleh Pemohon yang Sama */}
                    {applicantSubmissions.length > 1 && (
                        <div className="bs-card">
                            <div className="bs-card-header flex items-center justify-between">
                                <h2 className="text-sm font-bold text-[#203880] flex items-center gap-1.5">
                                    <GraduationCap className="w-4 h-4 text-[#198754]" />
                                    Pengajuan Lain ({applicantSubmissions.length})
                                </h2>
                            </div>
                            <div className="bs-card-body p-3 space-y-2">
                                {applicantSubmissions.map((sub) => {
                                    const isCurrent = sub.id === item.id;
                                    return (
                                        <div
                                            key={sub.id}
                                            onClick={() => (!isCurrent ? navigate(`/admin/modal/${sub.id}`) : null)}
                                            className={`p-2.5 rounded border text-xs transition-colors ${
                                                isCurrent
                                                    ? 'bg-[#e7f1ff]/60 border-[#b6d4fe]'
                                                    : 'bg-white border-[#e2e8f0] hover:bg-[#f8fafd] cursor-pointer'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <code className="font-bold text-[#203880]">{sub.kode}</code>
                                                <StatusBadge status={sub.status_seleksi} />
                                            </div>
                                            <div className="text-[11px] text-[#64748b] mt-1 flex justify-between">
                                                <span>{sub.jenis_bantuan}</span>
                                                <span className="font-semibold text-[#334155]">
                                                    {formatRupiah(sub.estimasi_biaya)}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Rubrik Seleksi & Penetapan BAST (with prominent Dokumen Lampiran preview) */}
            {showReviewModal && (
                <div className="bs-modal-backdrop" onClick={() => setShowReviewModal(false)}>
                    <div className="bs-modal-dialog max-w-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="bs-modal-header">
                            <div>
                                <h3 className="font-bold text-sm text-[#203880]">
                                    Rubrik Seleksi & Penetapan BAST — {item.kode}
                                </h3>
                                <p className="text-[11px] text-[#64748b]">
                                    Pemohon: {item.nama} ({item.sekolah} • {item.kompetensi})
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowReviewModal(false)}
                                className="text-[#6c757d] hover:text-[#212529]"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveReview}>
                            <div className="bs-modal-body space-y-4 text-xs">
                                {/* Ringkasan Proposal & DOKUMEN LAMPIRAN PREVIEW */}
                                <div className="p-3 bg-[#f8fafd] rounded-lg border border-[#dbe3f0] space-y-2">
                                    <div className="flex flex-wrap justify-between gap-2">
                                        <span>
                                            <strong>Jalur & Jenis:</strong> Ruang Modal {item.jalur} —{' '}
                                            {item.jenis_bantuan}
                                        </span>
                                        <span>
                                            <strong>Estimasi Pengajuan:</strong>{' '}
                                            <span className="text-[#008a75] font-bold">
                                                {formatRupiah(item.estimasi_biaya)}
                                            </span>
                                        </span>
                                    </div>
                                    <div>
                                        <strong>Rincian Kebutuhan:</strong> {item.rincian_kebutuhan}
                                    </div>
                                    <div>
                                        <strong>Rencana & Target:</strong> {item.rencana_deskripsi}
                                    </div>

                                    {/* DOKUMEN LAMPIRAN IN REVIEW MODAL */}
                                    <div className="p-2.5 rounded bg-white border border-[#b6d4fe] flex items-center justify-between gap-2 mt-1">
                                        <div className="flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-[#0068b0] shrink-0" />
                                            <div>
                                                <div className="font-bold text-[#203880]">
                                                    Dokumen Lampiran Proposal / RAB:
                                                </div>
                                                <div className="text-[11px] text-[#64748b]">
                                                    {item.dokumen_lampiran
                                                        ? item.dokumen_lampiran.split('/').pop()
                                                        : 'Pemohon tidak menyertakan berkas'}
                                                </div>
                                            </div>
                                        </div>
                                        {item.dokumen_lampiran && (
                                            <a
                                                href={item.dokumen_lampiran}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="bs-btn bs-btn-sm bs-btn-outline-primary shrink-0 flex items-center gap-1"
                                            >
                                                <ExternalLink className="w-3.5 h-3.5" />
                                                Buka Berkas
                                            </a>
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

                                {/* Bagian 2: Keputusan Seleksi & BAST */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="bs-form-label font-bold">Keputusan Seleksi</label>
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
                                            <option value="Menunggu Seleksi">Menunggu Seleksi</option>
                                            <option value="Disetujui">Disetujui (Lolos Seleksi)</option>
                                            <option value="Disalurkan">Disalurkan (Sudah Serah Terima)</option>
                                            <option value="Perlu Perbaikan">Perlu Perbaikan Proposal</option>
                                            <option value="Ditolak">Ditolak</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="bs-form-label font-bold">Nominal Bantuan Disetujui</label>
                                        <CurrencyInput
                                            value={reviewForm.nominal_disetujui}
                                            onChange={(val) =>
                                                setReviewForm((p) => ({ ...p, nominal_disetujui: val }))
                                            }
                                            placeholder="Contoh: 2.500.000"
                                            className="bs-form-control"
                                        />
                                    </div>

                                    {['Disetujui', 'Disalurkan'].includes(reviewForm.status_seleksi) && (
                                        <>
                                            <div>
                                                <label className="bs-form-label font-bold">
                                                    Nomor BAST (Berita Acara)
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
                                                    placeholder="BAST/DT-RM/2026/0001"
                                                    className="bs-form-control"
                                                />
                                            </div>

                                            <div>
                                                <label className="bs-form-label font-bold">
                                                    Tanggal Penyaluran BAST
                                                </label>
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
                                                <label className="bs-form-label font-bold">
                                                    Rincian Barang/Bantuan yang Disalurkan (Tercantum di BAST)
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
                                        <label className="bs-form-label font-bold">
                                            Catatan Verifikasi / Evaluasi Admin
                                        </label>
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
                                    onClick={() => setShowReviewModal(false)}
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
