import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AlertCircle, CheckCircle2, Eye, History, ImagePlus, Send, Store, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import {
    fetchPublicMasterOptions,
    fetchPublicPasarSubmissions,
    resetSubmitState,
    submitPasarProduct,
} from '../../store/slices/publicSlice';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import CurrencyInput from '../../components/CurrencyInput';
import AlumniAuthGate from '../../components/AlumniAuthGate';
import PasarProductDetailModal from '../../components/PasarProductDetailModal';
import {
    formatDateTime,
    getCategoryThumbnail,
    getProductThumbnail,
} from '../../utils/format';

const MY_PASAR_STORAGE_KEY = 'rp_my_submitted_codes';
const STATUS_OPTIONS = ['Menunggu Moderasi', 'Tayang', 'Perlu Perbaikan', 'Ditolak'];

const INITIAL_FORM = {
    nama_alumni: '',
    email: '',
    whatsapp: '',
    sekolah: '',
    nama_produk: '',
    kategori: '',
    harga: '',
    kontak_link: '',
    deskripsi: '',
};

const KATEGORI_LIST = ['Kuliner', 'Fashion', 'Jasa kreatif', 'Kecantikan', 'Kerajinan', 'Teknologi', 'Lainnya'];

function loadMyCodes() {
    try {
        const raw = localStorage.getItem(MY_PASAR_STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

export default function RuangPasarPage() {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const {
        masterOptions,
        pasarSubmissions,
        loadingPasarSubmissions,
        submitting,
        submitResult,
        submitError,
    } = useSelector((state) => state.publicData);
    const [form, setForm] = useState(INITIAL_FORM);
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState(null);
    const fileInputRef = useRef(null);
    const [detailId, setDetailId] = useState(null);
    const [onlyMine, setOnlyMine] = useState(false);
    const [myCodes, setMyCodes] = useState(() => loadMyCodes());

    useEffect(() => {
        if (user) {
            setForm((prev) => ({
                ...prev,
                nama_alumni: prev.nama_alumni || user.name || '',
                email: prev.email || user.email || '',
                whatsapp: prev.whatsapp || user.whatsapp || '',
                sekolah: prev.sekolah || user.sekolah || '',
            }));
        }
    }, [user]);

    useEffect(() => {
        dispatch(resetSubmitState());
        dispatch(fetchPublicMasterOptions());
        dispatch(fetchPublicPasarSubmissions());
        return () => dispatch(resetSubmitState());
    }, [dispatch]);

    useEffect(() => {
        return () => {
            if (thumbnailPreview) {
                URL.revokeObjectURL(thumbnailPreview);
            }
        };
    }, [thumbnailPreview]);

    const detailItem = useMemo(
        () => pasarSubmissions.find((item) => item.id === detailId) || null,
        [pasarSubmissions, detailId]
    );

    const displayedHistory = useMemo(() => {
        if (!onlyMine) return pasarSubmissions;
        return pasarSubmissions.filter((item) => myCodes.includes(item.kode));
    }, [pasarSubmissions, onlyMine, myCodes]);

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0] || null;
        if (thumbnailPreview) {
            URL.revokeObjectURL(thumbnailPreview);
        }
        if (file) {
            setThumbnailFile(file);
            setThumbnailPreview(URL.createObjectURL(file));
        } else {
            setThumbnailFile(null);
            setThumbnailPreview(null);
        }
    };

    const clearThumbnailFile = () => {
        if (thumbnailPreview) {
            URL.revokeObjectURL(thumbnailPreview);
        }
        setThumbnailFile(null);
        setThumbnailPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        Object.entries(form).forEach(([key, val]) => {
            formData.append(key, val ?? '');
        });
        if (thumbnailFile) {
            formData.append('thumbnail', thumbnailFile);
        }

        const res = await dispatch(submitPasarProduct(formData));
        if (submitPasarProduct.fulfilled.match(res)) {
            toast.success(res.payload?.message || 'Produk berhasil didaftarkan ke Ruang Pasar!');
            setForm(INITIAL_FORM);
            clearThumbnailFile();
            const newKode = res.payload?.kode;
            if (newKode) {
                const updated = [newKode, ...myCodes.filter((c) => c !== newKode)];
                setMyCodes(updated);
                try {
                    localStorage.setItem(MY_PASAR_STORAGE_KEY, JSON.stringify(updated));
                } catch {
                    // ignore storage error
                }
            }
        } else {
            toast.error(res.payload || 'Gagal mengajukan produk ke Ruang Pasar.');
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
                accessorKey: 'nama_produk',
                header: 'Produk / Jasa',
                cell: ({ row }) => (
                    <div className="flex items-start gap-2.5 max-w-sm">
                        <img
                            src={getProductThumbnail(row.original)}
                            alt={row.original.nama_produk}
                            onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = getCategoryThumbnail(row.original.kategori);
                            }}
                            className="w-12 h-9 rounded object-cover border border-[#dbe3f0] shrink-0 bg-[#eef2f9]"
                        />
                        <div>
                            <div className="font-semibold text-[#203880]">{row.original.nama_produk}</div>
                            <span className="bs-badge bs-badge-info mt-0.5">{row.original.kategori}</span>
                        </div>
                    </div>
                ),
            },
            {
                accessorKey: 'nama_alumni',
                header: 'Alumni & Sekolah',
                cell: ({ row }) => (
                    <div>
                        <div className="font-medium">{row.original.nama_alumni}</div>
                        <div className="text-xs text-[#64748b]">{row.original.sekolah}</div>
                    </div>
                ),
            },
            {
                accessorKey: 'harga',
                header: 'Harga',
                cell: ({ getValue }) => (
                    <span className="font-semibold text-[#008a75]">{getValue() || 'Hubungi penjual'}</span>
                ),
            },
            {
                accessorKey: 'status_publikasi',
                header: 'Status Moderasi',
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
            {/* Form Pendaftaran Produk ke Ruang Pasar */}
            <div className="bs-card">
                <div className="bs-card-header flex-col sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-lg font-bold text-[#203880]">
                            Pengajuan Ruang Pasar — Daftarkan Produk / Jasa
                        </h1>
                        <p className="text-xs font-normal text-[#64748b]">
                            Data produk atau jasa akan ditinjau oleh admin sebelum dipublikasikan di halaman Etalase
                            Ruang Pasar.
                        </p>
                    </div>
                    <Link
                        to="/etalase-pasar"
                        className="bs-btn bs-btn-sm bs-btn-outline-primary shrink-0"
                    >
                        <Store className="w-3.5 h-3.5" />
                        Lihat Daftar Etalase Pasar
                    </Link>
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
                                    Lihat Detail &amp; Riwayat
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
                        <AlumniAuthGate moduleName="Ruang Pasar" />
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="bs-row">
                            <div className="col-span-12 md:col-span-6">
                                <label className="bs-form-label">Nama Alumni *</label>
                                <input
                                    name="nama_alumni"
                                    value={form.nama_alumni}
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
                                <label className="bs-form-label">WhatsApp *</label>
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
                            <div className="col-span-12 md:col-span-6">
                                <label className="bs-form-label">Nama Usaha / Produk / Jasa *</label>
                                <input
                                    name="nama_produk"
                                    value={form.nama_produk}
                                    onChange={handleChange}
                                    required
                                    className="bs-form-control"
                                />
                            </div>
                            <div className="col-span-12 md:col-span-6">
                                <label className="bs-form-label">Kategori *</label>
                                <select
                                    name="kategori"
                                    value={form.kategori}
                                    onChange={handleChange}
                                    required
                                    className="bs-form-select"
                                >
                                    <option value="">Pilih Kategori</option>
                                    {(masterOptions?.kategori_pasar || KATEGORI_LIST).map((k) => (
                                        <option key={k} value={k}>
                                            {k}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-span-12 md:col-span-6">
                                <label className="bs-form-label">Harga / Kisaran Harga (Rp)</label>
                                <CurrencyInput
                                    name="harga"
                                    value={form.harga}
                                    onChange={handleChange}
                                    placeholder="25.000"
                                    mode="rupiah"
                                />
                            </div>
                            <div className="col-span-12 md:col-span-6">
                                <label className="bs-form-label">Kontak / Tautan Pemesanan *</label>
                                <input
                                    name="kontak_link"
                                    value={form.kontak_link}
                                    onChange={handleChange}
                                    required
                                    placeholder="Nomor WhatsApp atau URL https://..."
                                    className="bs-form-control"
                                />
                            </div>
                            <div className="col-span-12">
                                <label className="bs-form-label">Upload Thumbnail Produk (Opsional)</label>
                                <div className="p-3.5 rounded-md border border-dashed border-[#cbd5e1] bg-[#f8fafd] space-y-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <div className="flex items-center gap-2.5">
                                            <label className="bs-btn bs-btn-sm bs-btn-outline-primary cursor-pointer">
                                                <ImagePlus className="w-4 h-4" />
                                                Pilih Gambar Thumbnail
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept="image/jpeg,image/png,image/webp,image/gif"
                                                    onChange={handleFileChange}
                                                    className="hidden"
                                                />
                                            </label>
                                            <span className="text-xs text-[#64748b]">
                                                {thumbnailFile
                                                    ? `${thumbnailFile.name} (${(thumbnailFile.size / 1024).toFixed(1)} KB)`
                                                    : 'Belum ada file dipilih (Otomatis dikonversi ke WebP dengan Intervention Image)'}
                                            </span>
                                        </div>

                                        {thumbnailFile && (
                                            <button
                                                type="button"
                                                onClick={clearThumbnailFile}
                                                className="bs-btn bs-btn-sm bs-btn-outline-danger self-start sm:self-auto"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                                Hapus Gambar
                                            </button>
                                        )}
                                    </div>

                                    {thumbnailPreview && (
                                        <div className="flex items-center gap-3 pt-1">
                                            <img
                                                src={thumbnailPreview}
                                                alt="Pratinjau Thumbnail"
                                                className="w-36 h-22 object-cover rounded border border-[#dbe3f0] bg-white shadow-2xs"
                                            />
                                            <div className="text-xs text-[#475569] space-y-0.5">
                                                <div className="font-semibold text-[#203880]">
                                                    Pratinjau Thumbnail Produk
                                                </div>
                                                <div>
                                                    Gambar akan diproses otomatis oleh server (Intervention Image) ke
                                                    ukuran 800×450 px format <strong>.webp</strong>.
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="bs-form-label">Deskripsi Produk / Jasa *</label>
                            <textarea
                                name="deskripsi"
                                rows="3"
                                value={form.deskripsi}
                                onChange={handleChange}
                                required
                                className="bs-form-control"
                            />
                        </div>

                        <div>
                            <button type="submit" disabled={submitting} className="bs-btn bs-btn-primary">
                                <Send className="w-4 h-4" />
                                {submitting ? 'Mengajukan Produk...' : 'Ajukan Etalase'}
                            </button>
                        </div>
                    </form>
                    )}
                </div>
            </div>

            {/* Tabel Riwayat Pengajuan Produk Ruang Pasar */}
            <div className="bs-card">
                <div className="bs-card-header flex-col sm:flex-row sm:items-center">
                    <div>
                        <h2 className="text-base font-bold text-[#203880] flex items-center gap-2">
                            <History className="w-4 h-4 text-[#0068b0]" />
                            Riwayat &amp; Status Pengajuan Produk Ruang Pasar
                        </h2>
                        <p className="text-xs font-normal text-[#64748b]">
                            Klik baris data pada tabel untuk melihat detail lengkap dan riwayat moderasi produk.
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
                                    Semua ({pasarSubmissions.length})
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
                                    Pengajuan Saya ({myCodes.length})
                                </button>
                            </div>
                        )}
                        <span className="bs-badge bs-badge-primary">{displayedHistory.length} Pengajuan</span>
                    </div>
                </div>

                <div className="bs-card-body">
                    {loadingPasarSubmissions ? (
                        <div className="text-center py-6 text-sm text-[#64748b]">
                            Memuat riwayat pengajuan produk...
                        </div>
                    ) : (
                        <DataTable
                            data={displayedHistory}
                            columns={columns}
                            searchPlaceholder="Cari kode, nama produk, kategori, alumni, sekolah..."
                            filterColumn="status_publikasi"
                            filterOptions={STATUS_OPTIONS}
                            emptyText="Belum ada riwayat pengajuan produk yang ditemukan."
                            onRowClick={(row) => setDetailId(row.id)}
                        />
                    )}
                </div>
            </div>

            {detailItem && (
                <PasarProductDetailModal
                    item={detailItem}
                    allItems={pasarSubmissions}
                    onClose={() => setDetailId(null)}
                    onSelectOther={(other) => setDetailId(other.id)}
                    isAdmin={false}
                />
            )}
        </div>
    );
}
