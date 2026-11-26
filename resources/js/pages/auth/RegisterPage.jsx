import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AlertCircle, LogIn, UserPlus } from 'lucide-react';
import { toast } from 'react-toastify';
import { clearAuthError, registerUser } from '../../store/slices/authSlice';
import { fetchPublicMasterOptions } from '../../store/slices/publicSlice';

const INITIAL_REGISTER = {
    name: '',
    email: '',
    password: '',
    whatsapp: '',
    sekolah: '',
    tahun_lulus: '',
    kompetensi: '',
    nama_usaha: '',
};

export default function RegisterPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirectTo = searchParams.get('redirect') || '/alumni';
    const { token, loading, error } = useSelector((state) => state.auth);
    const { masterOptions } = useSelector((state) => state.publicData);
    const [form, setForm] = useState(INITIAL_REGISTER);

    useEffect(() => {
        dispatch(fetchPublicMasterOptions());
        return () => dispatch(clearAuthError());
    }, [dispatch]);

    useEffect(() => {
        if (token) {
            navigate(redirectTo, { replace: true });
        }
    }, [token, redirectTo, navigate]);

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await dispatch(registerUser(form));
        if (registerUser.fulfilled.match(res)) {
            toast.success('Pendaftaran akun alumni berhasil! Selamat datang.');
            navigate(redirectTo, { replace: true });
        } else {
            toast.error(res.payload || 'Pendaftaran akun gagal. Periksa data Anda.');
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-4">
            <div className="bs-card border-t-4 border-t-[#f8a000]">
                <div className="bs-card-header flex-col items-center text-center py-4 bg-white">
                    <img
                        src="/images/logo-dt.webp"
                        alt="Logo SMA Double Track"
                        className="h-12 w-auto object-contain mb-2"
                    />
                    <span className="inline-flex items-center gap-2 text-[#203880] font-bold text-base">
                        <UserPlus className="w-4 h-4 text-[#f8a000]" />
                        Pendaftaran Akun Alumni SMA Double Track
                    </span>
                    <p className="text-xs font-normal text-[#64748b] mt-0.5 max-w-md">
                        Buat akun alumni untuk mengajukan Ruang Modal, Ruang Tumbuh, dan Ruang Pasar, serta memantau
                        perkembangan usaha di Dashboard Alumni.
                    </p>
                </div>

                <div className="bs-card-body space-y-4">
                    {error && (
                        <div className="bs-alert bs-alert-danger">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="bs-row">
                            <div className="col-span-12 md:col-span-6">
                                <label className="bs-form-label">Nama Lengkap Alumni *</label>
                                <input
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="Masukkan nama lengkap"
                                    className="bs-form-control"
                                />
                            </div>
                            <div className="col-span-12 md:col-span-6">
                                <label className="bs-form-label">Alamat Email *</label>
                                <input
                                    name="email"
                                    type="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="nama@alumni.sch.id"
                                    className="bs-form-control"
                                />
                            </div>
                            <div className="col-span-12 md:col-span-6">
                                <label className="bs-form-label">Kata Sandi (min. 8 karakter) *</label>
                                <input
                                    name="password"
                                    type="password"
                                    minLength={8}
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                    placeholder="Minimal 8 karakter"
                                    className="bs-form-control"
                                />
                            </div>
                            <div className="col-span-12 md:col-span-6">
                                <label className="bs-form-label">Nomor WhatsApp Aktif *</label>
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
                                <label className="bs-form-label">Asal Sekolah SMA *</label>
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
                                    placeholder="Contoh: 2025"
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
                                    <option value="">Pilih Kompetensi</option>
                                    {(masterOptions?.kompetensi_dt || []).map((opt) => (
                                        <option key={opt} value={opt}>
                                            {opt}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-span-12 md:col-span-6">
                                <label className="bs-form-label">Nama Usaha / Pekerjaan (Opsional)</label>
                                <input
                                    name="nama_usaha"
                                    value={form.nama_usaha}
                                    onChange={handleChange}
                                    placeholder="Contoh: Dapur Rina Bakery"
                                    className="bs-form-control"
                                />
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="bs-btn bs-btn-primary w-full">
                            <UserPlus className="w-4 h-4" />
                            {loading ? 'Mendaftarkan Akun...' : 'Daftar & Masuk ke Portal Alumni'}
                        </button>
                    </form>

                    <div className="pt-3 border-t border-[#dbe3f0] text-center text-xs text-[#64748b]">
                        Sudah memiliki akun alumni?{' '}
                        <Link
                            to={`/login?redirect=${encodeURIComponent(redirectTo)}`}
                            className="font-semibold text-[#0068b0] hover:text-[#203880] hover:underline inline-flex items-center gap-1"
                        >
                            <LogIn className="w-3.5 h-3.5" />
                            Login di sini
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
