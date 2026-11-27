import React, { useMemo, useState, useEffect } from 'react';
import {
    AlertCircle,
    AlertTriangle,
    Briefcase,
    Calendar,
    Check,
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
    ShieldCheck,
    UploadCloud,
    User,
    X,
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api/axios';
import StatusBadge from './StatusBadge';
import DocumentPreviewModal from './DocumentPreviewModal';
import { formatDateTime, formatRupiah } from '../utils/format';
import { exportBastPdf } from '../utils/reportExporter';

export default function ModalApplicationDetailModal({
    item,
    allItems = [],
    onClose,
    onSelectOther = null,
    onProcess = null,
    onUpdated = null,
    isAdmin = false,
}) {
    if (!item) return null;

    const [currentItem, setCurrentItem] = useState(item);
    useEffect(() => {
        setCurrentItem(item);
    }, [item]);

    // State untuk form edit / upload ulang dokumen lampiran
    const [isEditingLampiran, setIsEditingLampiran] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [catatanRevisi, setCatatanRevisi] = useState('');
    const [emailConfirm, setEmailConfirm] = useState(item.email || '');
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);

    // Build chronological timeline history (fallback to synthesized entry if histories not loaded)
    const timeline = useMemo(() => {
        if (Array.isArray(currentItem.histories) && currentItem.histories.length > 0) {
            return currentItem.histories;
        }
        const entries = [
            {
                id: 'init',
                status_seleksi: 'Menunggu Seleksi',
                catatan: 'Pengajuan Ruang Modal dikirim oleh pemohon.',
                actor_type: 'pemohon',
                actor_name: currentItem.nama,
                created_at: currentItem.created_at,
            },
        ];
        if (currentItem.status_seleksi !== 'Menunggu Seleksi' || currentItem.catatan_admin) {
            entries.push({
                id: 'review',
                status_seleksi: currentItem.status_seleksi,
                catatan: currentItem.catatan_admin || `Status diperbarui menjadi ${currentItem.status_seleksi}.`,
                actor_type: 'admin',
                actor_name: currentItem.reviewer?.name || 'Admin Pengelola',
                created_at: currentItem.updated_at || currentItem.created_at,
            });
        }
        return entries;
    }, [currentItem]);

    // Find all submissions from the same applicant (matched by email, whatsapp, or exact name)
    const applicantSubmissions = useMemo(() => {
        const normEmail = (currentItem.email || '').trim().toLowerCase();
        const normWa = (currentItem.whatsapp || '').replace(/\D/g, '');
        const normNama = (currentItem.nama || '').trim().toLowerCase();

        return allItems.filter((other) => {
            if (normEmail && (other.email || '').trim().toLowerCase() === normEmail) return true;
            if (normWa && (other.whatsapp || '').replace(/\D/g, '') === normWa) return true;
            if (normNama && (other.nama || '').trim().toLowerCase() === normNama) return true;
            return other.id === currentItem.id;
        });
    }, [currentItem, allItems]);

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        setUploadError(null);
        if (!file) {
            setSelectedFile(null);
            return;
        }
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
        if (!validTypes.includes(file.type)) {
            setUploadError('Format berkas harus JPG, PNG, WEBP, atau PDF.');
            setSelectedFile(null);
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setUploadError('Ukuran berkas maksimal 5 MB.');
            setSelectedFile(null);
            return;
        }
        setSelectedFile(file);
    };

    const handleUploadLampiran = async (e) => {
        e.preventDefault();
        if (!selectedFile) {
            setUploadError('Pilih berkas lampiran terlebih dahulu.');
            return;
        }

        const isAuth = Boolean(localStorage.getItem('dt_jwt_token'));
        if (!isAuth && !emailConfirm) {
            setUploadError('Masukkan email yang digunakan saat pengajuan untuk verifikasi.');
            return;
        }

        setUploading(true);
        setUploadError(null);

        const formData = new FormData();
        formData.append('dokumen_lampiran', selectedFile);
        if (catatanRevisi.trim()) {
            formData.append('catatan', catatanRevisi.trim());
        }
        if (!isAuth && emailConfirm.trim()) {
            formData.append('email', emailConfirm.trim());
        }

        try {
            const { data } = await api.post(`/public/modal/${currentItem.id}/lampiran`, formData);
            toast.success(data.message || 'Dokumen lampiran berhasil diperbarui!');
            if (data.data) {
                setCurrentItem(data.data);
                if (onUpdated) {
                    onUpdated(data.data);
                }
            } else if (data.dokumen_lampiran) {
                const updated = { ...currentItem, dokumen_lampiran: data.dokumen_lampiran };
                setCurrentItem(updated);
                if (onUpdated) {
                    onUpdated(updated);
                }
            }
            setIsEditingLampiran(false);
            setSelectedFile(null);
            setCatatanRevisi('');
        } catch (err) {
            const msg =
                err.response?.data?.message ||
                err.response?.data?.errors?.dokumen_lampiran?.[0] ||
                'Gagal memperbarui dokumen lampiran. Silakan coba lagi.';
            setUploadError(msg);
            toast.error(msg);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="bs-modal-backdrop" onClick={onClose}>
            <div
                className="bs-modal-dialog max-w-3xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="bs-modal-header">
                    <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="font-bold text-sm sm:text-base text-[#203880]">
                            Detail Pengajuan Ruang Modal
                        </h3>
                        <code className="px-2 py-0.5 rounded bg-[#e7f1ff] text-[#203880] text-xs font-bold border border-[#b6d4fe]">
                            {currentItem.kode}
                        </code>
                        <StatusBadge status={currentItem.status_seleksi} />
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-[#6c757d] hover:text-[#212529] p-1"
                        aria-label="Tutup"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="bs-modal-body space-y-4 text-sm">
                    {/* Alert Banner jika Perlu Perbaikan */}
                    {currentItem.status_seleksi === 'Perlu Perbaikan' && (
                        <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 flex items-start gap-3 text-xs shadow-xs">
                            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                            <div className="flex-1 space-y-1.5">
                                <div className="font-bold text-amber-950 text-sm">
                                    Pengajuan Memerlukan Perbaikan Berkas / Proposal RAB
                                </div>
                                <p className="leading-relaxed text-amber-900">
                                    {currentItem.catatan_admin ||
                                        'Tim verifikator meminta revisi pada berkas lampiran atau rencana anggaran. Silakan perbarui berkas lampiran proposal/RAB Anda di bawah ini.'}
                                </p>
                                {!isEditingLampiran && (
                                    <button
                                        type="button"
                                        onClick={() => setIsEditingLampiran(true)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors mt-1 shadow-xs"
                                    >
                                        <UploadCloud className="w-4 h-4" />
                                        Unggah Dokumen Perbaikan Sekarang
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                    {/* Meta Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 rounded bg-[#f8f9fa] border border-[#dee2e6] text-xs text-[#6c757d]">
                        <span className="inline-flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-[#0068b0]" />
                            Diajukan: <strong className="text-[#212529]">{formatDateTime(currentItem.created_at)}</strong>
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-[#198754]" />
                            Pembaruan Terakhir:{' '}
                            <strong className="text-[#212529]">
                                {formatDateTime(currentItem.updated_at || currentItem.created_at)}
                            </strong>
                        </span>
                        {currentItem.reviewer?.name && (
                            <span className="inline-flex items-center gap-1.5">
                                <ShieldCheck className="w-3.5 h-3.5 text-[#203880]" />
                                Peninjau: <strong className="text-[#212529]">{currentItem.reviewer.name}</strong>
                            </span>
                        )}
                    </div>

                    {/* Grid: Profil Pemohon & Ringkasan Bantuan */}
                    <div className="bs-row">
                        <div className="col-span-12 md:col-span-6">
                            <div className="border border-[#dee2e6] rounded-md p-3.5 h-full space-y-2.5 bg-white">
                                <div className="font-semibold text-xs uppercase tracking-wider text-[#203880] flex items-center gap-1.5 border-b border-[#e9ecef] pb-2">
                                    <User className="w-3.5 h-3.5 text-[#0068b0]" />
                                    Data Alumni Pemohon
                                </div>
                                <div className="space-y-1.5 text-xs">
                                    <div className="flex justify-between gap-2">
                                        <span className="text-[#6c757d]">Nama Lengkap</span>
                                        <span className="font-semibold text-[#212529] text-right">{currentItem.nama}</span>
                                    </div>
                                    <div className="flex justify-between gap-2">
                                        <span className="text-[#6c757d]">Asal Sekolah</span>
                                        <span className="font-medium text-[#212529] text-right">
                                            {currentItem.sekolah} ({currentItem.tahun_lulus})
                                        </span>
                                    </div>
                                    <div className="flex justify-between gap-2">
                                        <span className="text-[#6c757d]">Kompetensi DT</span>
                                        <span className="font-medium text-[#212529] text-right">
                                            {currentItem.kompetensi}
                                        </span>
                                    </div>
                                    <div className="flex justify-between gap-2">
                                        <span className="text-[#6c757d]">Status Aktivitas</span>
                                        <span className="font-medium text-[#212529] text-right">
                                            {currentItem.status_aktivitas || '-'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between gap-2">
                                        <span className="text-[#6c757d] inline-flex items-center gap-1">
                                            <Mail className="w-3 h-3" /> Email
                                        </span>
                                        <span className="font-medium text-[#212529] text-right">
                                            {currentItem.email || '-'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between gap-2">
                                        <span className="text-[#6c757d] inline-flex items-center gap-1">
                                            <Phone className="w-3 h-3" /> WhatsApp
                                        </span>
                                        <span className="font-medium text-[#212529] text-right">
                                            {currentItem.whatsapp || '-'}
                                        </span>
                                    </div>
                                    {currentItem.guru_pendamping && (
                                        <div className="flex justify-between gap-2">
                                            <span className="text-[#6c757d]">Guru Pendamping</span>
                                            <span className="font-semibold text-[#0068b0] text-right">
                                                {currentItem.guru_pendamping}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center gap-2">
                                        <span className="text-[#6c757d]">Komitmen 6 Bulan</span>
                                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#198754]">
                                            <CheckCircle2 className="w-3.5 h-3.5" /> Bersedia Didampingi
                                        </span>
                                    </div>

                                    {/* Dokumen Lampiran & Fitur Edit / Upload Ulang */}
                                    <div className="pt-2 border-t border-[#e9ecef] space-y-2">
                                        <div className="flex justify-between items-center flex-wrap gap-2">
                                            <span className="text-[#6c757d] font-medium">Dokumen Lampiran (Proposal/RAB):</span>
                                            <div className="flex items-center gap-1.5">
                                                {currentItem.dokumen_lampiran ? (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPreviewModal(true)}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#0068b0] text-white font-bold text-xs hover:bg-[#203880] transition-colors shadow-xs"
                                                            title="Pratinjau berkas dokumen (Pop-up)"
                                                        >
                                                            <Eye className="w-3 h-3" />
                                                            Pratinjau
                                                        </button>
                                                        <a
                                                            href={currentItem.dokumen_lampiran}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#e7f1ff] text-[#0068b0] font-bold text-xs hover:bg-[#d0e3ff] transition-colors"
                                                            title="Buka berkas di jendela baru"
                                                        >
                                                            Tab Baru <ExternalLink className="w-3 h-3" />
                                                        </a>
                                                    </>
                                                ) : (
                                                    <span className="text-[11px] text-[#856404] bg-[#fff3cd] px-2 py-0.5 rounded font-medium">
                                                        Tidak Ada Berkas
                                                    </span>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => setIsEditingLampiran(!isEditingLampiran)}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#334155] font-semibold text-xs border border-[#cbd5e1] transition-colors"
                                                    title="Perbarui berkas lampiran proposal/RAB"
                                                >
                                                    <FileUp className="w-3 h-3 text-[#0068b0]" />
                                                    {currentItem.dokumen_lampiran ? 'Ganti / Edit' : 'Unggah Berkas'}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Form Edit Lampiran Inline */}
                                        {isEditingLampiran && (
                                            <form
                                                onSubmit={handleUploadLampiran}
                                                className="p-3 rounded-md bg-[#f8fafc] border border-[#cbd5e1] space-y-2.5 mt-2 text-xs"
                                            >
                                                <div className="font-semibold text-[#203880] flex items-center justify-between border-b border-[#e2e8f0] pb-1.5">
                                                    <span className="flex items-center gap-1.5">
                                                        <UploadCloud className="w-3.5 h-3.5 text-[#0068b0]" />
                                                        Unggah Dokumen Lampiran Baru
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setIsEditingLampiran(false);
                                                            setSelectedFile(null);
                                                            setUploadError(null);
                                                        }}
                                                        className="text-[#64748b] hover:text-[#0f172a] text-xs"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>

                                                <div>
                                                    <label className="block text-[#475569] font-medium mb-1">
                                                        Pilih Berkas Pengganti (PDF, JPG, PNG, WEBP — maks. 5MB):
                                                    </label>
                                                    <input
                                                        type="file"
                                                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                                                        onChange={handleFileChange}
                                                        disabled={uploading}
                                                        className="w-full text-xs text-slate-700 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-[#0068b0] file:text-white hover:file:bg-[#203880] cursor-pointer border border-[#cbd5e1] rounded p-1 bg-white"
                                                    />
                                                    {selectedFile && (
                                                        <div className="text-[11px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
                                                            <Check className="w-3 h-3" /> Berkas dipilih: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)
                                                        </div>
                                                    )}
                                                </div>

                                                {!Boolean(localStorage.getItem('dt_jwt_token')) && (
                                                    <div>
                                                        <label className="block text-[#475569] font-medium mb-1">
                                                            Konfirmasi Email Pemohon:
                                                        </label>
                                                        <input
                                                            type="email"
                                                            value={emailConfirm}
                                                            onChange={(e) => setEmailConfirm(e.target.value)}
                                                            placeholder="Masukkan email pemohon saat mendaftar"
                                                            disabled={uploading}
                                                            className="w-full px-2.5 py-1.5 rounded border border-[#cbd5e1] bg-white text-xs text-[#1e293b] focus:outline-none focus:border-[#0068b0]"
                                                        />
                                                    </div>
                                                )}

                                                <div>
                                                    <label className="block text-[#475569] font-medium mb-1">
                                                        Catatan Revisi / Keterangan (Opsional):
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={catatanRevisi}
                                                        onChange={(e) => setCatatanRevisi(e.target.value)}
                                                        placeholder="Contoh: Perbaikan rincian spesifikasi alat dan RAB"
                                                        disabled={uploading}
                                                        className="w-full px-2.5 py-1.5 rounded border border-[#cbd5e1] bg-white text-xs text-[#1e293b] focus:outline-none focus:border-[#0068b0]"
                                                    />
                                                </div>

                                                {uploadError && (
                                                    <div className="p-2 rounded bg-rose-50 border border-rose-200 text-rose-700 text-[11px] flex items-center gap-1.5">
                                                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                                        <span>{uploadError}</span>
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#e2e8f0]">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setIsEditingLampiran(false);
                                                            setSelectedFile(null);
                                                            setUploadError(null);
                                                        }}
                                                        disabled={uploading}
                                                        className="px-2.5 py-1 rounded border border-[#cbd5e1] text-[#475569] hover:bg-[#f1f5f9] text-xs font-medium"
                                                    >
                                                        Batal
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        disabled={uploading || !selectedFile}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#0068b0] hover:bg-[#203880] text-white text-xs font-semibold disabled:opacity-50 transition-colors shadow-xs"
                                                    >
                                                        {uploading ? (
                                                            <>
                                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                                Mengunggah...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <UploadCloud className="w-3.5 h-3.5" />
                                                                Simpan & Perbarui Berkas
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </form>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-span-12 md:col-span-6">
                            <div className="border border-[#dee2e6] rounded-md p-3.5 h-full space-y-2.5 bg-white">
                                <div className="font-semibold text-xs uppercase tracking-wider text-[#203880] flex items-center gap-1.5 border-b border-[#e9ecef] pb-2">
                                    <Briefcase className="w-3.5 h-3.5 text-[#198754]" />
                                    Informasi Bantuan, Skor & BAST
                                </div>
                                <div className="space-y-1.5 text-xs">
                                    <div className="flex justify-between items-center gap-2">
                                        <span className="text-[#6c757d]">Jalur Pengajuan</span>
                                        <span className="bs-badge bs-badge-info">{currentItem.jalur}</span>
                                    </div>
                                    <div className="flex justify-between gap-2">
                                        <span className="text-[#6c757d]">Jenis Bantuan</span>
                                        <span className="font-semibold text-[#212529] text-right">
                                            {currentItem.jenis_bantuan}
                                        </span>
                                    </div>
                                    <div className="flex justify-between gap-2">
                                        <span className="text-[#6c757d]">Estimasi Pengajuan</span>
                                        <span className="font-bold text-[#198754] text-right">
                                            {formatRupiah(currentItem.estimasi_biaya)}
                                        </span>
                                    </div>
                                    {currentItem.nominal_disetujui != null && (
                                        <div className="flex justify-between gap-2">
                                            <span className="text-[#6c757d]">Nominal Disetujui</span>
                                            <span className="font-bold text-[#203880] text-right">
                                                {formatRupiah(currentItem.nominal_disetujui)}
                                            </span>
                                        </div>
                                    )}
                                    {currentItem.skor_total != null && (
                                        <div className="flex justify-between items-center gap-2">
                                            <span className="text-[#6c757d]">Skor Rubrik Seleksi</span>
                                            <span className="bs-badge bs-badge-success">
                                                {currentItem.skor_total} / 100
                                            </span>
                                        </div>
                                    )}
                                    {currentItem.nomor_bast && (
                                        <div className="flex justify-between gap-2">
                                            <span className="text-[#6c757d]">Nomor BAST</span>
                                            <code className="font-bold text-[#008a75]">
                                                {currentItem.nomor_bast} ({currentItem.tanggal_penyaluran || '-'})
                                            </code>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center gap-2">
                                        <span className="text-[#6c757d]">Status Seleksi</span>
                                        <StatusBadge status={currentItem.status_seleksi} />
                                    </div>
                                    <div className="pt-1 border-t border-[#f1f5f9]">
                                        <div className="text-[#6c757d] mb-1">Catatan Pengelola / Admin:</div>
                                        <div className="p-2 rounded bg-[#f8f9fa] border border-[#e9ecef] text-[#212529] leading-relaxed">
                                            {currentItem.catatan_admin || 'Belum ada catatan evaluasi dari pengelola.'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Rincian Rubrik Penilaian 5 Indikator (jika sudah dinilai) */}
                    {currentItem.skor_total != null && (
                        <div className="border border-[#dee2e6] rounded-md p-3.5 space-y-2.5 bg-white">
                            <div className="flex items-center justify-between border-b border-[#e9ecef] pb-2">
                                <span className="font-semibold text-xs uppercase tracking-wider text-[#203880]">
                                    Hasil Rubrik Penilaian Seleksi (5 Indikator Blueprint)
                                </span>
                                <span className="bs-badge bs-badge-primary">
                                    Nilai Akhir: {currentItem.skor_total} / 100
                                </span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs text-center">
                                <div className="p-2 rounded bg-[#f8fafd] border border-[#dbe3f0]">
                                    <div className="text-[11px] text-[#64748b]">Kompetensi (20%)</div>
                                    <div className="font-bold text-sm text-[#203880]">
                                        {currentItem.skor_kompetensi ?? '-'}
                                    </div>
                                </div>
                                <div className="p-2 rounded bg-[#f8fafd] border border-[#dbe3f0]">
                                    <div className="text-[11px] text-[#64748b]">Rencana (25%)</div>
                                    <div className="font-bold text-sm text-[#203880]">
                                        {currentItem.skor_rencana ?? '-'}
                                    </div>
                                </div>
                                <div className="p-2 rounded bg-[#f8fafd] border border-[#dbe3f0]">
                                    <div className="text-[11px] text-[#64748b]">Ketepatan Alat (25%)</div>
                                    <div className="font-bold text-sm text-[#203880]">
                                        {currentItem.skor_kebutuhan ?? '-'}
                                    </div>
                                </div>
                                <div className="p-2 rounded bg-[#f8fafd] border border-[#dbe3f0]">
                                    <div className="text-[11px] text-[#64748b]">Dampak Ekonomi (20%)</div>
                                    <div className="font-bold text-sm text-[#203880]">
                                        {currentItem.skor_dampak ?? '-'}
                                    </div>
                                </div>
                                <div className="p-2 rounded bg-[#f8fafd] border border-[#dbe3f0]">
                                    <div className="text-[11px] text-[#64748b]">Komitmen (10%)</div>
                                    <div className="font-bold text-sm text-[#203880]">
                                        {currentItem.skor_komitmen ?? '-'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Rincian Kebutuhan & Rencana Pemanfaatan */}
                    <div className="border border-[#dee2e6] rounded-md p-3.5 space-y-3 bg-white">
                        <div className="font-semibold text-xs uppercase tracking-wider text-[#203880] flex items-center gap-1.5 border-b border-[#e9ecef] pb-2">
                            <FileText className="w-3.5 h-3.5 text-[#0068b0]" />
                            Rincian Kebutuhan & Rencana Pemanfaatan
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                            <div className="p-3 rounded bg-[#f8f9fa] border border-[#e9ecef] space-y-1">
                                <div className="font-semibold text-[#203880]">
                                    Rincian Kebutuhan Alat / Modal
                                </div>
                                <p className="text-[#495057] leading-relaxed whitespace-pre-line">
                                    {currentItem.rincian_kebutuhan}
                                </p>
                            </div>
                            <div className="p-3 rounded bg-[#f8f9fa] border border-[#e9ecef] space-y-1">
                                <div className="font-semibold text-[#203880]">
                                    Rencana Pemanfaatan & Target Penghasilan
                                </div>
                                <p className="text-[#495057] leading-relaxed whitespace-pre-line">
                                    {currentItem.rencana_deskripsi}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Timeline Riwayat Status Pengajuan */}
                    <div className="border border-[#dee2e6] rounded-md p-3.5 space-y-3 bg-white">
                        <div className="flex items-center justify-between border-b border-[#e9ecef] pb-2">
                            <span className="font-semibold text-xs uppercase tracking-wider text-[#203880] flex items-center gap-1.5">
                                <History className="w-3.5 h-3.5 text-[#0068b0]" />
                                Riwayat Aktivitas & Status Pengajuan
                            </span>
                            <span className="bs-badge bs-badge-secondary">{timeline.length} Aktivitas</span>
                        </div>

                        <div className="relative pl-5 space-y-3 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#dee2e6]">
                            {timeline.map((log, idx) => (
                                <div
                                    key={log.id || idx}
                                    className="relative p-3 rounded border border-[#e9ecef] bg-[#fcfcfd] text-xs space-y-1"
                                >
                                    <span
                                        className={`absolute -left-[19px] top-3.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                                            log.actor_type === 'admin' ? 'bg-[#198754]' : 'bg-[#0068b0]'
                                        }`}
                                    />
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <StatusBadge status={log.status_seleksi} />
                                            <span className="font-semibold text-[#203880]">
                                                {log.actor_name}
                                            </span>
                                            <span className="px-1.5 py-0.2 rounded bg-[#e9ecef] text-[10px] font-medium text-[#495057]">
                                                {log.actor_type === 'admin' ? 'Pengelola / Admin' : 'Pemohon'}
                                            </span>
                                        </div>
                                        <span className="text-[11px] text-[#6c757d]">
                                            {formatDateTime(log.created_at)}
                                        </span>
                                    </div>
                                    {log.catatan && (
                                        <p className="text-[#495057] leading-relaxed pt-0.5">{log.catatan}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Riwayat Semua Pengajuan milik Pemohon yang Sama */}
                    {applicantSubmissions.length > 0 && (
                        <div className="border border-[#dee2e6] rounded-md p-3.5 space-y-2.5 bg-white">
                            <div className="flex items-center justify-between border-b border-[#e9ecef] pb-2">
                                <span className="font-semibold text-xs uppercase tracking-wider text-[#203880] flex items-center gap-1.5">
                                    <GraduationCap className="w-3.5 h-3.5 text-[#198754]" />
                                    Riwayat Pengajuan oleh {currentItem.nama}
                                </span>
                                <span className="bs-badge bs-badge-info">
                                    {applicantSubmissions.length} Pengajuan
                                </span>
                            </div>

                            <div className="bs-table-responsive">
                                <table className="bs-table text-xs">
                                    <thead>
                                        <tr>
                                            <th>Kode</th>
                                            <th>Tanggal</th>
                                            <th>Jalur & Bantuan</th>
                                            <th>Estimasi</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {applicantSubmissions.map((sub) => {
                                            const isCurrent = sub.id === currentItem.id;
                                            return (
                                                <tr
                                                    key={sub.id}
                                                    onClick={() =>
                                                        !isCurrent && onSelectOther ? onSelectOther(sub) : undefined
                                                    }
                                                    className={
                                                        isCurrent
                                                            ? 'bg-[#e7f1ff]/60 font-medium'
                                                            : onSelectOther
                                                              ? 'cursor-pointer hover:bg-[#f1f5f9]'
                                                              : ''
                                                    }
                                                >
                                                    <td>
                                                        <code className="font-semibold text-[#203880]">
                                                            {sub.kode}
                                                        </code>
                                                        {isCurrent && (
                                                            <span className="ml-1.5 text-[10px] text-[#0068b0] font-semibold">
                                                                (Sedang dibuka)
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td>{formatDateTime(sub.created_at)}</td>
                                                    <td>
                                                        {sub.jalur} — {sub.jenis_bantuan}
                                                    </td>
                                                    <td className="font-semibold">
                                                        {formatRupiah(sub.estimasi_biaya)}
                                                    </td>
                                                    <td>
                                                        <StatusBadge status={sub.status_seleksi} />
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

                {/* Modal Footer */}
                <div className="bs-modal-footer">
                    {['Disetujui', 'Disalurkan'].includes(currentItem.status_seleksi) && (
                        <button
                            type="button"
                            onClick={() => exportBastPdf(currentItem, formatRupiah)}
                            className="bs-btn bs-btn-sm bs-btn-success"
                        >
                            <FileCheck className="w-3.5 h-3.5" />
                            Cetak BAST (PDF)
                        </button>
                    )}
                    {isAdmin && onProcess && (
                        <button
                            type="button"
                            onClick={() => onProcess(currentItem)}
                            className="bs-btn bs-btn-sm bs-btn-primary"
                        >
                            <Edit3 className="w-3.5 h-3.5" />
                            Proses Seleksi & BAST
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={onClose}
                        className="bs-btn bs-btn-sm bs-btn-outline-secondary"
                    >
                        Tutup
                    </button>
                </div>
            </div>

            <DocumentPreviewModal
                isOpen={showPreviewModal}
                onClose={() => setShowPreviewModal(false)}
                fileUrl={currentItem?.dokumen_lampiran}
                title={`Dokumen Lampiran Proposal - ${currentItem?.kode || ''}`}
            />
        </div>
    );
}
