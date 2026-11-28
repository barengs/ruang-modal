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
    Download,
    Edit3,
    ExternalLink,
    Eye,
    FileCheck,
    FileText,
    FileUp,
    GraduationCap,
    History,
    Loader2,
    Mail,
    Phone,
    Printer,
    ShieldCheck,
    Trash2,
    UploadCloud,
    User,
    X,
} from 'lucide-react';
import api from '../../api/axios';
import {
    clearAdminNotice,
    deleteModalItem,
    fetchModalItem,
    fetchModalList,
    updateModalItem,
} from '../../store/slices/adminSlice';
import { hasPermission } from '../../store/slices/authSlice';
import StatusBadge from '../../components/StatusBadge';
import ConfirmModal from '../../components/ConfirmModal';
import DocumentPreviewModal from '../../components/DocumentPreviewModal';
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
    const [imgLoadFailed, setImgLoadFailed] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [selectedPreviewDoc, setSelectedPreviewDoc] = useState(null);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [showUploadLampiranModal, setShowUploadLampiranModal] = useState(false);
    const [adminLampiranFiles, setAdminLampiranFiles] = useState([]);
    const [adminUploadAction, setAdminUploadAction] = useState('append');
    const [adminLampiranCatatan, setAdminLampiranCatatan] = useState('');
    const [adminUploading, setAdminUploading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteLampiranTarget, setDeleteLampiranTarget] = useState({ isOpen: false, item: null, index: null });
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
                    dispatch(fetchModalList());
                })
                .finally(() => setLoading(false));
        }
        return () => dispatch(clearAdminNotice());
    }, [dispatch, id, item]);

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

    const handleDelete = () => {
        if (!item) return;
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = async () => {
        if (!item) return;
        setShowDeleteConfirm(false);
        const res = await dispatch(deleteModalItem(item.id));
        if (deleteModalItem.fulfilled.match(res)) {
            toast.success(`Pengajuan ${item.kode} berhasil dihapus.`);
            navigate('/admin/modal');
        } else {
            toast.error(res.payload || 'Gagal menghapus pengajuan.');
        }
    };

    const handleAdminUploadLampiran = async (e) => {
        e.preventDefault();
        if (!adminLampiranFiles || adminLampiranFiles.length === 0) {
            toast.error('Pilih minimal satu berkas dokumen lampiran.');
            return;
        }
        setAdminUploading(true);
        const formData = new FormData();
        adminLampiranFiles.forEach((file) => {
            formData.append('dokumen_lampiran[]', file);
        });
        formData.append('action', adminUploadAction);
        if (adminLampiranCatatan.trim()) {
            formData.append('catatan', adminLampiranCatatan.trim());
        }
        try {
            const { data } = await api.post(`/admin/modal/${item.id}/lampiran`, formData);
            toast.success(data.message || 'Dokumen lampiran berhasil disimpan.');
            setShowUploadLampiranModal(false);
            setAdminLampiranFiles([]);
            setAdminLampiranCatatan('');
            setImgLoadFailed(false);
            dispatch(fetchModalItem(item.id));
        } catch (err) {
            toast.error(
                err.response?.data?.message ||
                err.response?.data?.errors?.['dokumen_lampiran.0']?.[0] ||
                err.response?.data?.errors?.dokumen_lampiran?.[0] ||
                'Gagal memperbarui dokumen lampiran.'
            );
        } finally {
            setAdminUploading(false);
        }
    };

    const handleConfirmDeleteLampiran = async () => {
        if (!item) return;
        try {
            const payload = {};
            if (deleteLampiranTarget.item?.id) {
                payload.document_id = deleteLampiranTarget.item.id;
            } else if (deleteLampiranTarget.item?.url) {
                payload.url = deleteLampiranTarget.item.url;
            } else if (deleteLampiranTarget.index !== null) {
                payload.index = deleteLampiranTarget.index;
            }
            const { data } = await api.delete(`/admin/modal/${item.id}/lampiran`, {
                data: payload,
            });
            toast.success(data.message || 'Dokumen lampiran berhasil dihapus.');
            setDeleteLampiranTarget({ isOpen: false, item: null, index: null });
            dispatch(fetchModalItem(item.id));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Gagal menghapus dokumen lampiran.');
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
    const lampiranList = useMemo(() => {
        if (!item) return [];
        if (Array.isArray(item.lampiran_list) && item.lampiran_list.length > 0) {
            return item.lampiran_list;
        }
        if (item.dokumen_lampiran) {
            return [{
                url: item.dokumen_lampiran,
                name: item.dokumen_lampiran.split('/').pop(),
                type: item.dokumen_lampiran.split('.').pop()?.toLowerCase() || 'file',
                uploaded_at: item.created_at ? formatDateTime(item.created_at) : 'Tersimpan di server',
            }];
        }
        return [];
    }, [item]);

    if (loading && !item) {
        return (
            <div className="bg-white border border-[#dbe3f0] rounded-lg p-12 text-center text-[#64748b]">
                <div className="w-8 h-8 border-3 border-[#203880] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm font-medium">Memuat detail pengajuan Ruang Modal...</p>
            </div>
        );
    }

    if (!item) {
        return (
            <div className="bg-white border border-[#dbe3f0] rounded-lg p-8 text-center space-y-3">
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
            {/* Navigasi & Tombol Aksi Atas */}
            <div className="bg-white p-3.5 rounded-lg border border-[#dbe3f0] flex flex-wrap items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2">
                    <Link
                        to="/admin/modal"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0068b0] hover:text-[#203880] px-2 py-1 rounded hover:bg-[#eef4ff] transition-colors"
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

            {/* LEMBAR DETAIL DOKUMEN: Penyajian Bersih Berbentuk Tabel & Kotak Terstruktur */}
            <div className="bg-white border border-[#dbe3f0] rounded-lg shadow-xs overflow-hidden">
                {/* Header Dokumen */}
                <div className="bg-[#f8fafd] border-b border-[#dbe3f0] px-5 py-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <h1 className="text-base sm:text-lg font-bold text-[#203880]">
                                Lembar Pengajuan Fasilitasi Ruang Modal
                            </h1>
                            <code className="px-2.5 py-0.5 rounded bg-[#e7f1ff] text-[#203880] text-xs font-bold border border-[#b6d4fe]">
                                {item.kode}
                            </code>
                            <StatusBadge status={item.status_seleksi} />
                        </div>
                        <p className="text-xs text-[#64748b] mt-1">
                            Diajukan pada: <strong>{formatDateTime(item.created_at)}</strong>
                            {item.reviewer?.name && (
                                <span className="ml-3">
                                    • Ditinjau oleh: <strong className="text-[#203880]">{item.reviewer.name}</strong>
                                </span>
                            )}
                        </p>
                    </div>

                    <div className="text-right">
                        <span className="text-[11px] text-[#64748b] block">Estimasi Nilai Pengajuan</span>
                        <span className="text-base sm:text-lg font-extrabold text-[#008a75]">
                            {formatRupiah(item.estimasi_biaya)}
                        </span>
                    </div>
                </div>

                {/* TABEL 1: DATA IDENTITAS PEMOHON ALUMNI */}
                <div className="border-b border-[#dbe3f0]">
                    <div className="bg-[#f1f5f9] px-5 py-2.5 border-b border-[#e2e8f0] flex items-center gap-2">
                        <User className="w-4 h-4 text-[#0068b0]" />
                        <h2 className="text-xs font-bold text-[#203880] uppercase tracking-wider">
                            I. Data Identitas Pemohon Alumni
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left border-collapse">
                            <tbody>
                                <tr className="border-b border-[#f1f5f9]">
                                    <th className="w-1/4 sm:w-1/5 py-2.5 px-5 font-semibold text-[#475569] bg-[#fcfcfd]">
                                        Nama Lengkap
                                    </th>
                                    <td className="w-1/4 sm:w-3/10 py-2.5 px-5 font-bold text-[#203880]">
                                        {item.nama}
                                    </td>
                                    <th className="w-1/4 sm:w-1/5 py-2.5 px-5 font-semibold text-[#475569] bg-[#fcfcfd]">
                                        Asal Sekolah
                                    </th>
                                    <td className="w-1/4 sm:w-3/10 py-2.5 px-5 text-[#1e293b]">
                                        {item.sekolah} (Lulusan {item.tahun_lulus})
                                    </td>
                                </tr>
                                <tr className="border-b border-[#f1f5f9]">
                                    <th className="py-2.5 px-5 font-semibold text-[#475569] bg-[#fcfcfd]">
                                        Kompetensi DT
                                    </th>
                                    <td className="py-2.5 px-5 font-semibold text-[#0068b0]">
                                        {item.kompetensi}
                                    </td>
                                    <th className="py-2.5 px-5 font-semibold text-[#475569] bg-[#fcfcfd]">
                                        Status Aktivitas
                                    </th>
                                    <td className="py-2.5 px-5 text-[#1e293b]">
                                        {item.status_aktivitas || '-'}
                                    </td>
                                </tr>
                                <tr className="border-b border-[#f1f5f9]">
                                    <th className="py-2.5 px-5 font-semibold text-[#475569] bg-[#fcfcfd]">
                                        No. WhatsApp
                                    </th>
                                    <td className="py-2.5 px-5">
                                        {item.whatsapp ? (
                                            <a
                                                href={`https://wa.me/${item.whatsapp.replace(/\D/g, '')}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="font-semibold text-[#198754] hover:underline inline-flex items-center gap-1"
                                            >
                                                <Phone className="w-3 h-3" /> {item.whatsapp}
                                            </a>
                                        ) : (
                                            '-'
                                        )}
                                    </td>
                                    <th className="py-2.5 px-5 font-semibold text-[#475569] bg-[#fcfcfd]">
                                        Alamat Email
                                    </th>
                                    <td className="py-2.5 px-5 text-[#1e293b]">
                                        {item.email || '-'}
                                    </td>
                                </tr>
                                <tr>
                                    <th className="py-2.5 px-5 font-semibold text-[#475569] bg-[#fcfcfd]">
                                        Guru Pendamping DT
                                    </th>
                                    <td className="py-2.5 px-5 text-[#1e293b]">
                                        {item.guru_pendamping || '-'}
                                    </td>
                                    <th className="py-2.5 px-5 font-semibold text-[#475569] bg-[#fcfcfd]">
                                        Komitmen Binaan
                                    </th>
                                    <td className="py-2.5 px-5 text-emerald-700 font-semibold inline-flex items-center gap-1.5">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        Bersedia Didampingi & Dimonitor Berkala
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* TABEL 2: DATA FASILITASI & PENYALURAN MODAL */}
                <div className="border-b border-[#dbe3f0]">
                    <div className="bg-[#f1f5f9] px-5 py-2.5 border-b border-[#e2e8f0] flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-[#198754]" />
                        <h2 className="text-xs font-bold text-[#203880] uppercase tracking-wider">
                            II. Data Fasilitasi & Penyaluran Ruang Modal
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left border-collapse">
                            <tbody>
                                <tr className="border-b border-[#f1f5f9]">
                                    <th className="w-1/4 sm:w-1/5 py-2.5 px-5 font-semibold text-[#475569] bg-[#fcfcfd]">
                                        Jalur Pengajuan
                                    </th>
                                    <td className="w-1/4 sm:w-3/10 py-2.5 px-5">
                                        <span className="bs-badge bs-badge-info">Jalur {item.jalur}</span>
                                    </td>
                                    <th className="w-1/4 sm:w-1/5 py-2.5 px-5 font-semibold text-[#475569] bg-[#fcfcfd]">
                                        Jenis Bantuan
                                    </th>
                                    <td className="w-1/4 sm:w-3/10 py-2.5 px-5 font-semibold text-[#203880]">
                                        {item.jenis_bantuan}
                                    </td>
                                </tr>
                                <tr className="border-b border-[#f1f5f9]">
                                    <th className="py-2.5 px-5 font-semibold text-[#475569] bg-[#fcfcfd]">
                                        Estimasi Pengajuan
                                    </th>
                                    <td className="py-2.5 px-5 font-bold text-[#008a75]">
                                        {formatRupiah(item.estimasi_biaya)}
                                    </td>
                                    <th className="py-2.5 px-5 font-semibold text-[#475569] bg-[#fcfcfd]">
                                        Nominal Disetujui
                                    </th>
                                    <td className="py-2.5 px-5 font-bold text-[#203880]">
                                        {item.nominal_disetujui != null ? (
                                            formatRupiah(item.nominal_disetujui)
                                        ) : (
                                            <span className="text-[#94a3b8] font-normal italic">Belum ditetapkan</span>
                                        )}
                                    </td>
                                </tr>
                                <tr className="border-b border-[#f1f5f9]">
                                    <th className="py-2.5 px-5 font-semibold text-[#475569] bg-[#fcfcfd]">
                                        Status Seleksi
                                    </th>
                                    <td className="py-2.5 px-5">
                                        <StatusBadge status={item.status_seleksi} />
                                    </td>
                                    <th className="py-2.5 px-5 font-semibold text-[#475569] bg-[#fcfcfd]">
                                        Skor Akhir Rubrik
                                    </th>
                                    <td className="py-2.5 px-5">
                                        {item.skor_total != null ? (
                                            <span className="font-bold text-[#203880]">
                                                {item.skor_total} / 100{' '}
                                                <span className="text-[11px] font-normal text-[#64748b]">
                                                    ({item.skor_total >= 75 ? 'Memenuhi Syarat' : 'Perlu Evaluasi'})
                                                </span>
                                            </span>
                                        ) : (
                                            <span className="text-[#94a3b8] italic">Belum dinilai</span>
                                        )}
                                    </td>
                                </tr>
                                <tr>
                                    <th className="py-2.5 px-5 font-semibold text-[#475569] bg-[#fcfcfd]">
                                        Nomor BAST
                                    </th>
                                    <td className="py-2.5 px-5">
                                        {item.nomor_bast ? (
                                            <code className="font-bold text-[#008a75]">{item.nomor_bast}</code>
                                        ) : (
                                            <span className="text-[#94a3b8] italic">Belum terbit</span>
                                        )}
                                    </td>
                                    <th className="py-2.5 px-5 font-semibold text-[#475569] bg-[#fcfcfd]">
                                        Tanggal Penyaluran
                                    </th>
                                    <td className="py-2.5 px-5 text-[#1e293b]">
                                        {item.tanggal_penyaluran || (
                                            <span className="text-[#94a3b8] italic">Belum disalurkan</span>
                                        )}
                                    </td>
                                </tr>
                                {item.rincian_bantuan_disalurkan && (
                                    <tr className="border-t border-[#f1f5f9]">
                                        <th className="py-2.5 px-5 font-semibold text-[#475569] bg-[#fcfcfd]">
                                            Rincian Bantuan BAST
                                        </th>
                                        <td colSpan="3" className="py-2.5 px-5 text-[#1e293b] whitespace-pre-line">
                                            {item.rincian_bantuan_disalurkan}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* TABEL 3: RINCIAN KEBUTUHAN & RENCANA PEMANFAATAN */}
                <div className="border-b border-[#dbe3f0]">
                    <div className="bg-[#f1f5f9] px-5 py-2.5 border-b border-[#e2e8f0] flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#0068b0]" />
                        <h2 className="text-xs font-bold text-[#203880] uppercase tracking-wider">
                            III. Rincian Kebutuhan Peralatan & Rencana Usaha
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left border-collapse">
                            <tbody>
                                <tr className="border-b border-[#f1f5f9]">
                                    <th className="w-1/4 sm:w-1/5 py-3 px-5 font-semibold text-[#475569] bg-[#fcfcfd] align-top">
                                        Rincian Peralatan / Kebutuhan Modal
                                    </th>
                                    <td className="py-3 px-5 text-[#1e293b] leading-relaxed whitespace-pre-line">
                                        {item.rincian_kebutuhan}
                                    </td>
                                </tr>
                                <tr className="border-b border-[#f1f5f9]">
                                    <th className="py-3 px-5 font-semibold text-[#475569] bg-[#fcfcfd] align-top">
                                        Rencana Pemanfaatan & Target Omzet
                                    </th>
                                    <td className="py-3 px-5 text-[#1e293b] leading-relaxed whitespace-pre-line">
                                        {item.rencana_deskripsi}
                                    </td>
                                </tr>
                                <tr>
                                    <th className="py-3 px-5 font-semibold text-[#475569] bg-[#fcfcfd] align-top">
                                        Catatan Evaluasi Verifikator
                                    </th>
                                    <td className="py-3 px-5 text-[#1e293b] leading-relaxed whitespace-pre-line">
                                        {item.catatan_admin || (
                                            <span className="text-[#94a3b8] italic">
                                                Belum ada catatan evaluasi dari tim pengelola.
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* TABEL 4: BERKAS DOKUMEN LAMPIRAN PROPOSAL & RAB */}
                <div className="border-b border-[#dbe3f0]">
                    <div className="bg-[#f1f5f9] px-5 py-2.5 border-b border-[#e2e8f0] flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                            <FileCheck className="w-4 h-4 text-[#0068b0]" />
                            <h2 className="text-xs font-bold text-[#203880] uppercase tracking-wider">
                                IV. Dokumen Lampiran Pengajuan (Proposal & RAB)
                            </h2>
                        </div>
                        <div className="flex items-center gap-2">
                            {lampiranList.length > 0 ? (
                                <span className="bs-badge bs-badge-success">{lampiranList.length} Berkas Terlampir</span>
                            ) : (
                                <span className="bs-badge bs-badge-warning">Tidak Ada Berkas</span>
                            )}
                            {canUpdate && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setAdminUploadAction('append');
                                        setAdminLampiranFiles([]);
                                        setShowUploadLampiranModal(true);
                                    }}
                                    className="bs-btn bs-btn-sm bs-btn-outline-primary inline-flex items-center gap-1.5"
                                    title="Tambah dokumen lampiran"
                                >
                                    <FileUp className="w-3.5 h-3.5" />
                                    + Tambah Dokumen Lampiran
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left border-collapse">
                            <thead>
                                <tr className="border-b border-[#e2e8f0] bg-[#f8fafd] text-[#475569]">
                                    <th className="py-2.5 px-5 font-semibold">Jenis Dokumen</th>
                                    <th className="py-2.5 px-5 font-semibold">Nama File</th>
                                    <th className="py-2.5 px-5 font-semibold">Format</th>
                                    <th className="py-2.5 px-5 font-semibold">Status Penyimpanan</th>
                                    <th className="py-2.5 px-5 font-semibold text-right">Aksi Dokumen</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lampiranList.length > 0 ? (
                                    lampiranList.map((doc, idx) => (
                                        <tr key={idx} className="border-b border-[#f1f5f9] hover:bg-[#fafcff] transition-colors">
                                            <td className="py-3 px-5 font-medium text-[#203880]">
                                                {idx === 0
                                                    ? 'Proposal Usaha & Rincian Anggaran Biaya (RAB Utama)'
                                                    : `Dokumen Pendukung #${idx + 1}`}
                                            </td>
                                            <td className="py-3 px-5 font-mono text-[#334155]">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedPreviewDoc(doc);
                                                        setShowPreviewModal(true);
                                                    }}
                                                    className="text-[#0068b0] hover:text-[#203880] hover:underline font-mono text-left font-medium inline-flex items-center gap-1.5 max-w-xs truncate"
                                                    title={`Pratinjau ${doc.name || 'Dokumen'}`}
                                                >
                                                    <FileText className="w-3.5 h-3.5 text-[#0068b0] shrink-0" />
                                                    <span className="truncate">{doc.name || doc.url?.split('/').pop()}</span>
                                                </button>
                                            </td>
                                            <td className="py-3 px-5 uppercase font-bold text-[#0068b0]">
                                                <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-[11px]">
                                                    {doc.type || doc.url?.split('.').pop() || 'FILE'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-5">
                                                <span className="text-emerald-700 font-medium text-xs">
                                                    {doc.uploaded_at || 'Tersimpan di server'}
                                                </span>
                                                {doc.size && (
                                                    <div className="text-[10px] text-slate-500">
                                                        {(doc.size / 1024).toFixed(0)} KB
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-3 px-5 text-right space-x-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedPreviewDoc(doc);
                                                        setShowPreviewModal(true);
                                                    }}
                                                    className="bs-btn bs-btn-sm bs-btn-primary inline-flex items-center gap-1.5 shadow-xs"
                                                    title="Buka pratinjau berkas dokumen dalam bentuk modal pop-up"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    Pratinjau Pop-up
                                                </button>
                                                <a
                                                    href={doc.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="bs-btn bs-btn-sm bs-btn-outline-secondary inline-flex items-center gap-1.5"
                                                    title="Buka berkas di jendela / tab baru"
                                                >
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                    Tab Baru
                                                </a>
                                                <a
                                                    href={doc.url}
                                                    download
                                                    className="bs-btn bs-btn-sm bs-btn-outline-secondary inline-flex items-center gap-1.5"
                                                    title="Unduh berkas dokumen"
                                                >
                                                    <Download className="w-3.5 h-3.5" />
                                                    Unduh
                                                </a>
                                                {canUpdate && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setDeleteLampiranTarget({
                                                                isOpen: true,
                                                                item: doc,
                                                                index: idx,
                                                            })
                                                        }
                                                        className="bs-btn bs-btn-sm bs-btn-outline-danger inline-flex items-center gap-1"
                                                        title="Hapus berkas ini"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="py-5 px-5 text-center text-[#94a3b8] italic">
                                            <div className="mb-2">
                                                Pemohon tidak menyertakan berkas lampiran proposal/RAB pada pengajuan ini.
                                            </div>
                                            {canUpdate && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setAdminUploadAction('append');
                                                        setAdminLampiranFiles([]);
                                                        setShowUploadLampiranModal(true);
                                                    }}
                                                    className="bs-btn bs-btn-sm bs-btn-primary inline-flex items-center gap-1.5 not-italic"
                                                >
                                                    <UploadCloud className="w-3.5 h-3.5" />
                                                    Unggah Berkas Lampiran Sekarang
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* TABEL 5: EVALUASI RUBRIK PENILAIAN 5 INDIKATOR (JIKA SUDAH DINILAI) */}
                {item.skor_total != null && (
                    <div className="border-b border-[#dbe3f0]">
                        <div className="bg-[#f1f5f9] px-5 py-2.5 border-b border-[#e2e8f0] flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Award className="w-4 h-4 text-[#f8a000]" />
                                <h2 className="text-xs font-bold text-[#203880] uppercase tracking-wider">
                                    V. Evaluasi Rubrik Penilaian Seleksi (5 Indikator Blueprint)
                                </h2>
                            </div>
                            <span className="bs-badge bs-badge-primary">
                                Nilai Akhir: {item.skor_total} / 100
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-[#e2e8f0] bg-[#f8fafd] text-[#475569]">
                                        <th className="w-12 py-2.5 px-5 font-semibold text-center">No</th>
                                        <th className="py-2.5 px-5 font-semibold">Indikator Penilaian Blueprint</th>
                                        <th className="w-24 py-2.5 px-5 font-semibold text-center">Bobot</th>
                                        <th className="w-28 py-2.5 px-5 font-semibold text-center">Skor (0-100)</th>
                                        <th className="w-36 py-2.5 px-5 font-semibold text-right">Kontribusi Skor</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-[#f1f5f9]">
                                        <td className="py-2.5 px-5 text-center text-[#64748b]">1</td>
                                        <td className="py-2.5 px-5 font-medium text-[#1e293b]">
                                            Kesesuaian Kompetensi DT dengan Kebutuhan
                                        </td>
                                        <td className="py-2.5 px-5 text-center text-[#475569]">20%</td>
                                        <td className="py-2.5 px-5 text-center font-bold text-[#203880]">
                                            {item.skor_kompetensi ?? '-'}
                                        </td>
                                        <td className="py-2.5 px-5 text-right font-semibold text-[#0068b0]">
                                            {item.skor_kompetensi != null
                                                ? (item.skor_kompetensi * 0.2).toFixed(1)
                                                : '-'}
                                        </td>
                                    </tr>
                                    <tr className="border-b border-[#f1f5f9]">
                                        <td className="py-2.5 px-5 text-center text-[#64748b]">2</td>
                                        <td className="py-2.5 px-5 font-medium text-[#1e293b]">
                                            Kejelasan Rencana Kerja / Usaha
                                        </td>
                                        <td className="py-2.5 px-5 text-center text-[#475569]">25%</td>
                                        <td className="py-2.5 px-5 text-center font-bold text-[#203880]">
                                            {item.skor_rencana ?? '-'}
                                        </td>
                                        <td className="py-2.5 px-5 text-right font-semibold text-[#0068b0]">
                                            {item.skor_rencana != null
                                                ? (item.skor_rencana * 0.25).toFixed(1)
                                                : '-'}
                                        </td>
                                    </tr>
                                    <tr className="border-b border-[#f1f5f9]">
                                        <td className="py-2.5 px-5 text-center text-[#64748b]">3</td>
                                        <td className="py-2.5 px-5 font-medium text-[#1e293b]">
                                            Urgensi & Ketepatan Kebutuhan Bantuan Alat/Modal
                                        </td>
                                        <td className="py-2.5 px-5 text-center text-[#475569]">25%</td>
                                        <td className="py-2.5 px-5 text-center font-bold text-[#203880]">
                                            {item.skor_kebutuhan ?? '-'}
                                        </td>
                                        <td className="py-2.5 px-5 text-right font-semibold text-[#0068b0]">
                                            {item.skor_kebutuhan != null
                                                ? (item.skor_kebutuhan * 0.25).toFixed(1)
                                                : '-'}
                                        </td>
                                    </tr>
                                    <tr className="border-b border-[#f1f5f9]">
                                        <td className="py-2.5 px-5 text-center text-[#64748b]">4</td>
                                        <td className="py-2.5 px-5 font-medium text-[#1e293b]">
                                            Potensi Dampak Ekonomi & Penghasilan
                                        </td>
                                        <td className="py-2.5 px-5 text-center text-[#475569]">20%</td>
                                        <td className="py-2.5 px-5 text-center font-bold text-[#203880]">
                                            {item.skor_dampak ?? '-'}
                                        </td>
                                        <td className="py-2.5 px-5 text-right font-semibold text-[#0068b0]">
                                            {item.skor_dampak != null
                                                ? (item.skor_dampak * 0.2).toFixed(1)
                                                : '-'}
                                        </td>
                                    </tr>
                                    <tr className="border-b border-[#f1f5f9]">
                                        <td className="py-2.5 px-5 text-center text-[#64748b]">5</td>
                                        <td className="py-2.5 px-5 font-medium text-[#1e293b]">
                                            Kesiapan & Komitmen Pendampingan/Pelaporan
                                        </td>
                                        <td className="py-2.5 px-5 text-center text-[#475569]">10%</td>
                                        <td className="py-2.5 px-5 text-center font-bold text-[#203880]">
                                            {item.skor_komitmen ?? '-'}
                                        </td>
                                        <td className="py-2.5 px-5 text-right font-semibold text-[#0068b0]">
                                            {item.skor_komitmen != null
                                                ? (item.skor_komitmen * 0.1).toFixed(1)
                                                : '-'}
                                        </td>
                                    </tr>
                                    <tr className="bg-[#f8fafd] font-bold text-[#203880]">
                                        <td colSpan="2" className="py-3 px-5 text-right uppercase tracking-wider">
                                            Total Skor Akhir
                                        </td>
                                        <td className="py-3 px-5 text-center">100%</td>
                                        <td className="py-3 px-5 text-center text-sm">{item.skor_total}</td>
                                        <td className="py-3 px-5 text-right text-sm text-[#008a75]">
                                            {item.skor_total} / 100
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* TABEL 6: RIWAYAT PERUBAHAN STATUS & LOG AKTIVITAS */}
                <div className="border-b border-[#dbe3f0]">
                    <div className="bg-[#f1f5f9] px-5 py-2.5 border-b border-[#e2e8f0] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <History className="w-4 h-4 text-[#0068b0]" />
                            <h2 className="text-xs font-bold text-[#203880] uppercase tracking-wider">
                                VI. Riwayat Status & Log Aktivitas
                            </h2>
                        </div>
                        <span className="bs-badge bs-badge-secondary">{timeline.length} Log</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left border-collapse">
                            <thead>
                                <tr className="border-b border-[#e2e8f0] bg-[#f8fafd] text-[#475569]">
                                    <th className="w-12 py-2.5 px-5 font-semibold text-center">No</th>
                                    <th className="w-40 py-2.5 px-5 font-semibold">Tanggal & Waktu</th>
                                    <th className="w-36 py-2.5 px-5 font-semibold">Status Seleksi</th>
                                    <th className="w-36 py-2.5 px-5 font-semibold">Oleh</th>
                                    <th className="w-28 py-2.5 px-5 font-semibold">Peran</th>
                                    <th className="py-2.5 px-5 font-semibold">Catatan / Keterangan</th>
                                </tr>
                            </thead>
                            <tbody>
                                {timeline.map((log, idx) => (
                                    <tr key={log.id || idx} className="border-b border-[#f1f5f9] hover:bg-[#fafafa]">
                                        <td className="py-2.5 px-5 text-center text-[#64748b]">{idx + 1}</td>
                                        <td className="py-2.5 px-5 text-[#334155] whitespace-nowrap">
                                            {formatDateTime(log.created_at)}
                                        </td>
                                        <td className="py-2.5 px-5">
                                            <StatusBadge status={log.status_seleksi} />
                                        </td>
                                        <td className="py-2.5 px-5 font-semibold text-[#203880]">
                                            {log.actor_name}
                                        </td>
                                        <td className="py-2.5 px-5">
                                            <span className="px-1.5 py-0.5 rounded bg-[#f1f5f9] text-[10px] font-medium text-[#475569] border border-[#e2e8f0]">
                                                {log.actor_type === 'admin' ? 'Pengelola / Admin' : 'Pemohon Alumni'}
                                            </span>
                                        </td>
                                        <td className="py-2.5 px-5 text-[#334155]">
                                            {log.catatan || '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* TABEL 7: RIWAYAT PENGAJUAN LAIN DARI PEMOHON YANG SAMA (JIKA ADA) */}
                {applicantSubmissions.length > 1 && (
                    <div>
                        <div className="bg-[#f1f5f9] px-5 py-2.5 border-b border-[#e2e8f0] flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <GraduationCap className="w-4 h-4 text-[#198754]" />
                                <h2 className="text-xs font-bold text-[#203880] uppercase tracking-wider">
                                    VII. Pengajuan Lain oleh Pemohon ({item.nama})
                                </h2>
                            </div>
                            <span className="bs-badge bs-badge-info">
                                Total: {applicantSubmissions.length} Pengajuan
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-[#e2e8f0] bg-[#f8fafd] text-[#475569]">
                                        <th className="py-2.5 px-5 font-semibold">Kode Pengajuan</th>
                                        <th className="py-2.5 px-5 font-semibold">Tanggal Diajukan</th>
                                        <th className="py-2.5 px-5 font-semibold">Jalur & Jenis Bantuan</th>
                                        <th className="py-2.5 px-5 font-semibold text-right">Estimasi Biaya</th>
                                        <th className="py-2.5 px-5 font-semibold">Status Seleksi</th>
                                        <th className="py-2.5 px-5 font-semibold text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {applicantSubmissions.map((sub) => {
                                        const isCurrent = sub.id === item.id;
                                        return (
                                            <tr
                                                key={sub.id}
                                                className={`border-b border-[#f1f5f9] ${
                                                    isCurrent ? 'bg-[#e7f1ff]/50 font-medium' : 'hover:bg-[#fafafa]'
                                                }`}
                                            >
                                                <td className="py-2.5 px-5">
                                                    <code className="font-bold text-[#203880]">{sub.kode}</code>
                                                    {isCurrent && (
                                                        <span className="ml-2 text-[10px] text-[#0068b0] font-bold">
                                                            (Sedang dibuka)
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-2.5 px-5 text-[#475569]">
                                                    {formatDateTime(sub.created_at)}
                                                </td>
                                                <td className="py-2.5 px-5 text-[#1e293b]">
                                                    {sub.jalur} — {sub.jenis_bantuan}
                                                </td>
                                                <td className="py-2.5 px-5 text-right font-semibold text-[#008a75]">
                                                    {formatRupiah(sub.estimasi_biaya)}
                                                </td>
                                                <td className="py-2.5 px-5">
                                                    <StatusBadge status={sub.status_seleksi} />
                                                </td>
                                                <td className="py-2.5 px-5 text-center">
                                                    {!isCurrent ? (
                                                        <Link
                                                            to={`/admin/modal/${sub.id}`}
                                                            className="bs-btn bs-btn-sm bs-btn-outline-primary"
                                                        >
                                                            Buka
                                                        </Link>
                                                    ) : (
                                                        <span className="text-[#94a3b8] text-[11px]">-</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* MODAL PROSES SELEKSI & RUBRIK */}
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
                                <div className="p-3 bg-[#f8fafd] rounded border border-[#dbe3f0] space-y-2">
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
                                                    {lampiranFilename || 'Pemohon tidak menyertakan berkas'}
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

            {/* Modal Unggah / Tambah Berkas Dokumen Lampiran */}
            {showUploadLampiranModal && (
                <div className="bs-modal-backdrop" onClick={() => setShowUploadLampiranModal(false)}>
                    <div
                        className="bs-modal-dialog max-w-lg"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <form onSubmit={handleAdminUploadLampiran}>
                            <div className="bs-modal-header">
                                <h3 className="font-bold text-sm text-[#203880] flex items-center gap-1.5">
                                    <FileUp className="w-4 h-4 text-[#0068b0]" />
                                    Unggah Dokumen Lampiran Pengajuan
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setShowUploadLampiranModal(false)}
                                    className="text-slate-400 hover:text-slate-600"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="bs-modal-body space-y-3.5 text-xs">
                                <div>
                                    <label className="bs-form-label font-bold">
                                        Mode Penyimpanan Lampiran
                                    </label>
                                    <div className="grid grid-cols-2 gap-2 mt-1">
                                        <button
                                            type="button"
                                            onClick={() => setAdminUploadAction('append')}
                                            className={`p-2.5 rounded border text-left transition-all ${
                                                adminUploadAction === 'append'
                                                    ? 'border-[#0068b0] bg-blue-50/50 text-[#203880] font-semibold'
                                                    : 'border-[#cbd5e1] bg-white text-[#475569]'
                                            }`}
                                        >
                                            <div className="text-xs font-bold">+ Tambah Lampiran Baru</div>
                                            <div className="text-[10px] text-slate-500 mt-0.5">
                                                Menambahkan berkas baru tanpa menghapus lampiran sebelumnya
                                            </div>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setAdminUploadAction('replace')}
                                            className={`p-2.5 rounded border text-left transition-all ${
                                                adminUploadAction === 'replace'
                                                    ? 'border-amber-600 bg-amber-50/50 text-amber-900 font-semibold'
                                                    : 'border-[#cbd5e1] bg-white text-[#475569]'
                                            }`}
                                        >
                                            <div className="text-xs font-bold">↺ Ganti Seluruh Lampiran</div>
                                            <div className="text-[10px] text-slate-500 mt-0.5">
                                                Mengganti semua lampiran lama dengan berkas yang baru dipilih
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="bs-form-label font-bold">
                                        Pilih Berkas Lampiran (Dapat memilih lebih dari 1 file — maks. 5MB per file) <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="file"
                                        multiple
                                        accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx"
                                        onChange={(e) => {
                                            const newFiles = Array.from(e.target.files || []);
                                            setAdminLampiranFiles((prev) => [...prev, ...newFiles]);
                                            e.target.value = '';
                                        }}
                                        disabled={adminUploading}
                                        className="w-full text-xs text-slate-700 file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-[#0068b0] file:text-white hover:file:bg-[#203880] cursor-pointer border border-[#cbd5e1] rounded p-1.5 bg-white"
                                    />
                                    <p className="text-[11px] text-slate-500 mt-1">
                                        Format berkas yang didukung: PDF, Gambar (JPG, PNG, WEBP), Word, Excel.
                                    </p>

                                    {adminLampiranFiles.length > 0 && (
                                        <div className="mt-2.5 border border-[#e2e8f0] rounded bg-[#f8fafc] p-2 space-y-1.5">
                                            <div className="text-[11px] font-bold text-[#203880] flex justify-between">
                                                <span>Berkas yang akan diunggah ({adminLampiranFiles.length}):</span>
                                                <button
                                                    type="button"
                                                    onClick={() => setAdminLampiranFiles([])}
                                                    className="text-rose-600 hover:underline text-[10px]"
                                                >
                                                    Hapus Semua
                                                </button>
                                            </div>
                                            <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                                                {adminLampiranFiles.map((file, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="flex items-center justify-between text-xs p-1.5 rounded bg-white border border-[#e2e8f0]"
                                                    >
                                                        <div className="flex items-center gap-1.5 truncate">
                                                            <FileText className="w-3.5 h-3.5 text-[#0068b0] shrink-0" />
                                                            <span className="truncate text-slate-800 font-medium">
                                                                {file.name}
                                                            </span>
                                                            <span className="text-[10px] text-slate-500 shrink-0">
                                                                ({(file.size / 1024).toFixed(0)} KB)
                                                            </span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setAdminLampiranFiles((prev) =>
                                                                    prev.filter((_, i) => i !== idx)
                                                                )
                                                            }
                                                            className="text-slate-400 hover:text-rose-600 p-0.5 ml-1 shrink-0"
                                                        >
                                                            <X className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="bs-form-label font-bold">
                                        Catatan / Keterangan Pembaruan (Opsional)
                                    </label>
                                    <input
                                        type="text"
                                        value={adminLampiranCatatan}
                                        onChange={(e) => setAdminLampiranCatatan(e.target.value)}
                                        placeholder="Contoh: Penambahan berkas proposal teknis dan sertifikasi usaha"
                                        disabled={adminUploading}
                                        className="bs-form-control text-xs"
                                    />
                                </div>
                            </div>

                            <div className="bs-modal-footer">
                                <button
                                    type="button"
                                    onClick={() => setShowUploadLampiranModal(false)}
                                    disabled={adminUploading}
                                    className="bs-btn bs-btn-sm bs-btn-outline-secondary"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={adminUploading || adminLampiranFiles.length === 0}
                                    className="bs-btn bs-btn-sm bs-btn-primary inline-flex items-center gap-1.5 disabled:opacity-50"
                                >
                                    {adminUploading ? (
                                        <>
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            Mengunggah...
                                        </>
                                    ) : (
                                        <>
                                            <UploadCloud className="w-3.5 h-3.5" />
                                            Simpan & Unggah {adminLampiranFiles.length > 0 ? `(${adminLampiranFiles.length}) Berkas` : ''}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleConfirmDelete}
                title="Hapus Pengajuan Ruang Modal"
                message={`Apakah Anda yakin ingin menghapus pengajuan ${item?.kode} milik ${item?.nama}? Semua data penilaian, riwayat status, dan dokumen pengajuan ini akan dihapus permanen.`}
                confirmText="Ya, Hapus"
                variant="danger"
            />

            <ConfirmModal
                isOpen={deleteLampiranTarget.isOpen}
                onClose={() => setDeleteLampiranTarget({ isOpen: false, item: null, index: null })}
                onConfirm={handleConfirmDeleteLampiran}
                title="Hapus Dokumen Lampiran"
                message={`Apakah Anda yakin ingin menghapus dokumen "${deleteLampiranTarget.item?.name || 'Lampiran'}"? Dokumen ini akan dihapus dari daftar lampiran pengajuan.`}
                confirmText="Ya, Hapus Dokumen"
                variant="danger"
            />

            <DocumentPreviewModal
                isOpen={showPreviewModal}
                onClose={() => {
                    setShowPreviewModal(false);
                    setSelectedPreviewDoc(null);
                }}
                fileUrl={selectedPreviewDoc?.url || item?.dokumen_lampiran}
                title={selectedPreviewDoc?.name || `Dokumen Lampiran - ${item?.kode || ''}`}
            />
        </div>
    );
}
