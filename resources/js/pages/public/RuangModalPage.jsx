import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    Eye,
    FileText,
    History,
    Loader2,
    Send,
    UploadCloud,
    UserCheck,
    X,
} from 'lucide-react';
import { toast } from 'react-toastify';
import {
    fetchPublicMasterOptions,
    fetchPublicModal,
    resetSubmitState,
    submitModalApplication,
} from '../../store/slices/publicSlice';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import CurrencyInput from '../../components/CurrencyInput';
import AlumniAuthGate from '../../components/AlumniAuthGate';
import ModalApplicationDetailModal from '../../components/ModalApplicationDetailModal';
import { formatDateTime, formatRupiah } from '../../utils/format';
import { validateEmail, validateGraduationYear } from '../../utils/validation';

const MY_CODES_STORAGE_KEY = 'rm_my_submitted_codes';
const STATUS_OPTIONS = ['Menunggu Seleksi', 'Disetujui', 'Disalurkan', 'Perlu Perbaikan', 'Ditolak'];

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
    guru_pendamping: '',
    komitmen_pendampingan: true,
    dokumen_lampiran: null,
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
    const { user } = useSelector((state) => state.auth);
    const {
        masterOptions,
        modalApplications,
        loadingModalApplications,
        submitting,
        submitResult,
        submitError,
    } = useSelector((state) => state.publicData);
    const [form, setForm] = useState(INITIAL_FORM);
    const [currentStep, setCurrentStep] = useState(1);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [detailId, setDetailId] = useState(null);
    const [onlyMine, setOnlyMine] = useState(false);
    const [myCodes, setMyCodes] = useState(() => loadMyCodes());

    useEffect(() => {
        if (user) {
            setForm((prev) => ({
                ...prev,
                nama: prev.nama || user.name || '',
                email: prev.email || user.email || '',
                whatsapp: prev.whatsapp || user.whatsapp || '',
                sekolah: prev.sekolah || user.sekolah || '',
                tahun_lulus: prev.tahun_lulus || user.tahun_lulus || '',
                kompetensi: prev.kompetensi || user.kompetensi || '',
            }));
        }
    }, [user]);

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
        const { name, type, checked, files, value } = e.target;
        if (type === 'checkbox') {
            setForm((prev) => ({ ...prev, [name]: checked }));
        } else if (type === 'file') {
            setForm((prev) => ({ ...prev, [name]: files?.[0] || null }));
        } else {
            setForm((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleNextStep = (e) => {
        if (e) e.preventDefault();

        if (!form.nama.trim()) {
            toast.error('Nama lengkap wajib diisi.');
            return;
        }
        const emailCheck = validateEmail(form.email);
        if (!emailCheck.valid) {
            toast.error(emailCheck.message || 'Alamat email pemohon tidak valid.');
            return;
        }
        if (!form.whatsapp.trim()) {
            toast.error('Nomor WhatsApp wajib diisi.');
            return;
        }
        if (!form.sekolah.trim()) {
            toast.error('Asal sekolah wajib diisi.');
            return;
        }
        const yearCheck = validateGraduationYear(form.tahun_lulus);
        if (!yearCheck.valid) {
            toast.error(yearCheck.message || 'Tahun kelulusan tidak valid.');
            return;
        }
        if (!form.kompetensi) {
            toast.error('Pilih kompetensi Double Track.');
            return;
        }
        if (!form.jalur) {
            toast.error('Pilih jalur pengajuan.');
            return;
        }
        if (!form.jenis_bantuan) {
            toast.error('Pilih jenis bantuan yang dibutuhkan.');
            return;
        }
        if (!form.rincian_kebutuhan.trim()) {
            toast.error('Rincian kebutuhan alat/modal wajib diisi.');
            return;
        }
        if (!form.rencana_deskripsi.trim()) {
            toast.error('Rencana pemanfaatan dan target penghasilan wajib diisi.');
            return;
        }

        setCurrentStep(2);
        window.scrollTo({ top: 150, behavior: 'smooth' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.komitmen_pendampingan) {
            toast.error('Anda wajib menyetujui pernyataan komitmen alumni.');
            return;
        }

        const emailCheck = validateEmail(form.email);
        if (!emailCheck.valid) {
            toast.error(emailCheck.message || 'Alamat email pemohon tidak valid.');
            return;
        }

        const formData = new FormData();
        formData.append('nama', form.nama);
        formData.append('email', form.email);
        formData.append('whatsapp', form.whatsapp);
        formData.append('sekolah', form.sekolah);
        formData.append('tahun_lulus', form.tahun_lulus);
        formData.append('kompetensi', form.kompetensi);
        formData.append('jalur', form.jalur);
        formData.append('status_aktivitas', form.status_aktivitas);
        formData.append('jenis_bantuan', form.jenis_bantuan);
        formData.append('estimasi_biaya', form.estimasi_biaya ? Number(form.estimasi_biaya) : 0);
        formData.append('rincian_kebutuhan', form.rincian_kebutuhan);
        formData.append('rencana_deskripsi', form.rencana_deskripsi);
        formData.append('guru_pendamping', form.guru_pendamping || '');
        formData.append('komitmen_pendampingan', form.komitmen_pendampingan ? '1' : '0');

        if (uploadedFiles.length > 0) {
            uploadedFiles.forEach((file) => {
                formData.append('dokumen_lampiran[]', file);
            });
        } else if (form.dokumen_lampiran) {
            formData.append('dokumen_lampiran', form.dokumen_lampiran);
        }

        const res = await dispatch(submitModalApplication(formData));
        if (submitModalApplication.fulfilled.match(res)) {
            toast.success(res.payload?.message || 'Pengajuan Ruang Modal berhasil dikirim!');
            setForm(INITIAL_FORM);
            setUploadedFiles([]);
            setCurrentStep(1);
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
        } else {
            toast.error(res.payload || 'Gagal mengirim pengajuan Ruang Modal.');
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

                    {!user ? (
                        <AlumniAuthGate moduleName="Ruang Modal" />
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Stepper Wizard Indicator */}
                            <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-3 sm:p-4 mb-6">
                                <div className="flex items-center justify-between">
                                    <button
                                        type="button"
                                        onClick={() => setCurrentStep(1)}
                                        className={`flex items-center gap-2.5 text-left transition-colors ${
                                            currentStep === 1
                                                ? 'text-[#203880] font-bold'
                                                : 'text-[#64748b] hover:text-[#203880]'
                                        }`}
                                    >
                                        <span
                                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all shadow-xs shrink-0 ${
                                                currentStep === 1
                                                    ? 'bg-[#203880] text-white ring-4 ring-blue-100'
                                                    : 'bg-emerald-600 text-white'
                                            }`}
                                        >
                                            {currentStep === 2 ? <CheckCircle2 className="w-4 h-4" /> : '1'}
                                        </span>
                                        <div>
                                            <div className="text-xs sm:text-sm font-bold">Langkah 1</div>
                                            <div className="text-[11px] text-slate-500 hidden sm:block">
                                                Profil & Rencana Usaha
                                            </div>
                                        </div>
                                    </button>

                                    <div className="flex-1 mx-3 sm:mx-6 h-1 rounded bg-[#e2e8f0] overflow-hidden">
                                        <div
                                            className={`h-full bg-[#0068b0] transition-all duration-300 ${
                                                currentStep === 2 ? 'w-full' : 'w-0'
                                            }`}
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleNextStep}
                                        className={`flex items-center gap-2.5 text-left transition-colors ${
                                            currentStep === 2
                                                ? 'text-[#203880] font-bold'
                                                : 'text-[#64748b] hover:text-[#203880]'
                                        }`}
                                    >
                                        <span
                                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all shadow-xs shrink-0 ${
                                                currentStep === 2
                                                    ? 'bg-[#203880] text-white ring-4 ring-blue-100'
                                                    : 'bg-slate-200 text-slate-600'
                                            }`}
                                        >
                                            2
                                        </span>
                                        <div>
                                            <div className="text-xs sm:text-sm font-bold">Langkah 2</div>
                                            <div className="text-[11px] text-slate-500 hidden sm:block">
                                                Upload Dokumen Lampiran
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* LANGKAH 1: PROFIL & RENCANA USAHA */}
                            {currentStep === 1 && (
                                <div className="space-y-4">
                                    <div className="border-b border-[#e2e8f0] pb-2">
                                        <h3 className="text-sm font-bold text-[#203880] flex items-center gap-2">
                                            <UserCheck className="w-4 h-4 text-[#0068b0]" />
                                            Data Profil Pemohon & Rencana Kebutuhan Bantuan
                                        </h3>
                                        <p className="text-[11px] text-slate-500 mt-0.5">
                                            Lengkapi informasi identitas alumni dan deskripsi rencana pemanfaatan bantuan modal.
                                        </p>
                                    </div>

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
                                        <label className="bs-form-label">
                                            Rencana Pemanfaatan dan Target Penghasilan *
                                        </label>
                                        <textarea
                                            name="rencana_deskripsi"
                                            rows="3"
                                            value={form.rencana_deskripsi}
                                            onChange={handleChange}
                                            required
                                            className="bs-form-control"
                                        />
                                    </div>

                                    <div>
                                        <label className="bs-form-label">
                                            Guru / Fasilitator Pendamping Sekolah (Rekomendasi Sekolah)
                                        </label>
                                        <input
                                            name="guru_pendamping"
                                            value={form.guru_pendamping}
                                            onChange={handleChange}
                                            placeholder="Contoh: Drs. Hendro Wibowo, M.Pd."
                                            className="bs-form-control"
                                        />
                                    </div>

                                    <div className="pt-3 border-t border-[#e2e8f0] flex justify-end">
                                        <button
                                            type="button"
                                            onClick={handleNextStep}
                                            className="bs-btn bs-btn-primary inline-flex items-center gap-2 shadow-xs"
                                        >
                                            <span>Lanjut ke Upload Dokumen (Langkah 2)</span>
                                            <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* LANGKAH 2: UPLOAD DOKUMEN LAMPIRAN (MULTIPLE UPLOAD) */}
                            {currentStep === 2 && (
                                <div className="space-y-4">
                                    <div className="border-b border-[#e2e8f0] pb-2">
                                        <h3 className="text-sm font-bold text-[#203880] flex items-center gap-2">
                                            <UploadCloud className="w-4 h-4 text-[#0068b0]" />
                                            Dokumen Lampiran Proposal, RAB & Berkas Pendukung
                                        </h3>
                                        <p className="text-[11px] text-slate-500 mt-0.5">
                                            Unggah berkas proposal usaha, RAB, foto produk, atau berkas pendukung lainnya. Anda dapat mengunggah beberapa dokumen sekaligus.
                                        </p>
                                    </div>

                                    <div className="p-4 rounded-xl border-2 border-dashed border-[#93c5fd] bg-[#f8fafd] text-center space-y-3">
                                        <div className="w-12 h-12 mx-auto rounded-full bg-blue-100 flex items-center justify-center text-[#0068b0]">
                                            <UploadCloud className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <label className="cursor-pointer">
                                                <span className="bs-btn bs-btn-sm bs-btn-primary inline-flex items-center gap-1.5 shadow-xs">
                                                    <UploadCloud className="w-3.5 h-3.5" />
                                                    Pilih Berkas Dokumen (Multiple)
                                                </span>
                                                <input
                                                    type="file"
                                                    multiple
                                                    accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx"
                                                    onChange={(e) => {
                                                        const newFiles = Array.from(e.target.files || []);
                                                        setUploadedFiles((prev) => [...prev, ...newFiles]);
                                                        e.target.value = '';
                                                    }}
                                                    className="hidden"
                                                />
                                            </label>
                                            <p className="text-[11px] text-[#64748b] mt-2">
                                                Format didukung: <strong>PDF, Gambar (JPG, PNG, WEBP), Word (.doc/.docx), Excel (.xls/.xlsx)</strong>. Maksimal 5 MB per berkas.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Tabel Berkas yang Dipilih */}
                                    {uploadedFiles.length > 0 ? (
                                        <div className="border border-[#e2e8f0] rounded-lg overflow-hidden bg-white">
                                            <div className="bg-[#f1f5f9] px-4 py-2 flex items-center justify-between text-xs font-bold text-[#203880]">
                                                <span>Daftar Dokumen yang Dipilih ({uploadedFiles.length} Berkas)</span>
                                                <button
                                                    type="button"
                                                    onClick={() => setUploadedFiles([])}
                                                    className="text-rose-600 hover:underline text-[11px]"
                                                >
                                                    Hapus Semua
                                                </button>
                                            </div>
                                            <div className="divide-y divide-[#f1f5f9]">
                                                {uploadedFiles.map((file, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="px-4 py-2.5 flex items-center justify-between text-xs hover:bg-[#fafcff]"
                                                    >
                                                        <div className="flex items-center gap-2.5 min-w-0">
                                                            <span className="w-5 h-5 rounded bg-blue-50 text-[#0068b0] flex items-center justify-center font-bold text-[10px]">
                                                                {idx + 1}
                                                            </span>
                                                            <FileText className="w-4 h-4 text-[#0068b0] shrink-0" />
                                                            <span className="font-medium text-slate-800 truncate">
                                                                {file.name}
                                                            </span>
                                                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] uppercase font-bold shrink-0">
                                                                {file.name.split('.').pop()}
                                                            </span>
                                                            <span className="text-[11px] text-slate-400 shrink-0">
                                                                ({(file.size / 1024).toFixed(0)} KB)
                                                            </span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setUploadedFiles((prev) =>
                                                                    prev.filter((_, i) => i !== idx)
                                                                )
                                                            }
                                                            className="text-slate-400 hover:text-rose-600 p-1"
                                                            title="Hapus berkas ini"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-3 rounded bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                                            <span>
                                                Belum ada berkas lampiran yang dipilih. Anda sangat disarankan menyertakan proposal usaha atau RAB agar penilaian seleksi lebih maksimal.
                                            </span>
                                        </div>
                                    )}

                                    {/* Pernyataan Komitmen */}
                                    <div className="p-3.5 rounded-lg bg-[#f8fafd] border border-[#dbe3f0]">
                                        <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#1e293b]">
                                            <input
                                                type="checkbox"
                                                name="komitmen_pendampingan"
                                                checked={Boolean(form.komitmen_pendampingan)}
                                                onChange={handleChange}
                                                required
                                                className="mt-0.5 rounded border-slate-300 text-[#203880]"
                                            />
                                            <span>
                                                <strong>Pernyataan Komitmen Alumni:</strong> Saya menyatakan data yang
                                                diajukan adalah benar dan bersedia mengikuti proses seleksi,
                                                memanfaatkan bantuan secara produktif sesuai rencana, serta mengikuti
                                                pendampingan dan melaporkan perkembangan usaha/kerja selama minimal 6
                                                bulan.
                                            </span>
                                        </label>
                                    </div>

                                    {/* Tombol Navigasi Bawah */}
                                    <div className="pt-3 border-t border-[#e2e8f0] flex items-center justify-between flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setCurrentStep(1)}
                                            className="bs-btn bs-btn-outline-secondary inline-flex items-center gap-1.5"
                                        >
                                            <ArrowLeft className="w-4 h-4" />
                                            <span>Kembali ke Langkah 1</span>
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="bs-btn bs-btn-primary inline-flex items-center gap-2 shadow-xs"
                                        >
                                            {submitting ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    <span>Mengirim Pengajuan...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="w-4 h-4" />
                                                    <span>Kirim Pengajuan Ruang Modal</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </form>
                    )}
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
                    onUpdated={() => {
                        dispatch(fetchPublicModal());
                    }}
                    isAdmin={false}
                />
            )}
        </div>
    );
}
