import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    AlertCircle,
    CheckCircle2,
    Eye,
    EyeOff,
    Loader2,
    LogIn,
    ShieldAlert,
    ShieldCheck,
    UserPlus,
    XCircle,
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import { clearAuthError, registerUser } from '../../store/slices/authSlice';
import { fetchPublicMasterOptions } from '../../store/slices/publicSlice';
import PasswordStrengthMeter, { evaluatePasswordStrength } from '../../components/PasswordStrengthMeter';
import { validateEmail, validateGraduationYear } from '../../utils/validation';

const INITIAL_REGISTER = {
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
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
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
    const [emailTouched, setEmailTouched] = useState(false);
    const [yearTouched, setYearTouched] = useState(false);
    const [emailStatus, setEmailStatus] = useState({
        checking: false,
        available: null,
        message: '',
        suggestion: '',
    });

    useEffect(() => {
        dispatch(fetchPublicMasterOptions());
        return () => dispatch(clearAuthError());
    }, [dispatch]);

    useEffect(() => {
        if (!form.email) {
            setEmailStatus({ checking: false, available: null, message: '', suggestion: '' });
            return;
        }

        const res = validateEmail(form.email);
        if (!res.valid) {
            setEmailStatus({
                checking: false,
                available: false,
                message: res.message,
                suggestion: res.suggestion || '',
            });
            return;
        }

        // Format email valid: cek ketersediaan email ke server (debounced)
        setEmailStatus((prev) => ({
            ...prev,
            checking: true,
            suggestion: res.suggestion || '',
        }));

        const timer = setTimeout(async () => {
            try {
                const { data } = await api.post('/auth/check-email', { email: form.email });
                setEmailStatus({
                    checking: false,
                    available: data.available,
                    message: data.message,
                    suggestion: res.suggestion || '',
                });
            } catch (err) {
                setEmailStatus({
                    checking: false,
                    available: null,
                    message: 'Format email valid.',
                    suggestion: res.suggestion || '',
                });
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [form.email]);

    useEffect(() => {
        if (token) {
            navigate(redirectTo, { replace: true });
        }
    }, [token, redirectTo, navigate]);

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleYearChange = (e) => {
        const val = e.target.value.replace(/\D/g, '').slice(0, 4);
        setForm((prev) => ({ ...prev, tahun_lulus: val }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 1. Validasi Alamat Email
        const emailCheck = validateEmail(form.email);
        if (!emailCheck.valid) {
            setEmailTouched(true);
            toast.error(emailCheck.message || 'Alamat email tidak valid. Harap periksa kembali.');
            return;
        }

        if (emailStatus.available === false && emailStatus.message.includes('terdaftar')) {
            setEmailTouched(true);
            toast.error('Email ini sudah terdaftar. Silakan login atau gunakan alamat email lain.');
            return;
        }

        // 2. Validasi Kata Sandi
        if (form.password.length < 8) {
            toast.error('Kata sandi harus terdiri dari minimal 8 karakter.');
            return;
        }

        if (form.password !== form.password_confirmation) {
            toast.error('Konfirmasi kata sandi tidak cocok. Harap periksa kembali.');
            return;
        }

        const strength = evaluatePasswordStrength(form.password);
        if (strength.score < 2) {
            toast.warning('Kata sandi terlalu lemah. Gunakan kombinasi huruf besar, huruf kecil, dan angka demi keamanan akun Anda.');
            return;
        }

        // 3. Validasi Penulisan Tahun Lulus
        const yearCheck = validateGraduationYear(form.tahun_lulus);
        if (!yearCheck.valid) {
            setYearTouched(true);
            toast.error(yearCheck.message || 'Tahun kelulusan tidak valid.');
            return;
        }

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
                                <label className="bs-form-label flex items-center justify-between">
                                    <span>Alamat Email *</span>
                                    {emailTouched && form.email && (
                                        <span className="text-[11px] font-semibold">
                                            {emailStatus.checking ? (
                                                <span className="text-slate-500 inline-flex items-center gap-1">
                                                    <Loader2 className="w-3 h-3 animate-spin text-[#0068b0]" />
                                                    Memeriksa...
                                                </span>
                                            ) : emailStatus.available === true ? (
                                                <span className="text-emerald-700 inline-flex items-center gap-1">
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                    Email Tersedia
                                                </span>
                                            ) : emailStatus.available === false ? (
                                                <span className="text-rose-600 inline-flex items-center gap-1">
                                                    <XCircle className="w-3.5 h-3.5" />
                                                    Tidak Valid / Terpakai
                                                </span>
                                            ) : null}
                                        </span>
                                    )}
                                </label>
                                <div className="relative">
                                    <input
                                        name="email"
                                        type="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        onBlur={() => setEmailTouched(true)}
                                        required
                                        placeholder="nama@alumni.sch.id"
                                        className={`bs-form-control pr-8 ${
                                            emailTouched && form.email
                                                ? emailStatus.available === true
                                                    ? 'border-emerald-500 focus:border-emerald-600 focus:ring-emerald-200'
                                                    : emailStatus.available === false
                                                        ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200'
                                                        : ''
                                                : ''
                                        }`}
                                    />
                                    {emailTouched && form.email && (
                                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                                            {emailStatus.checking ? (
                                                <Loader2 className="w-4 h-4 animate-spin text-[#0068b0]" />
                                            ) : emailStatus.available === true ? (
                                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                            ) : emailStatus.available === false ? (
                                                <AlertCircle className="w-4 h-4 text-rose-500" />
                                            ) : null}
                                        </div>
                                    )}
                                </div>

                                {/* Pesan status atau saran perbaikan typo */}
                                {emailTouched && form.email && (
                                    <div className="space-y-1 mt-1 text-[11px]">
                                        {emailStatus.message && (
                                            <p
                                                className={`flex items-center gap-1 ${
                                                    emailStatus.available === true
                                                        ? 'text-emerald-700'
                                                        : emailStatus.available === false
                                                            ? 'text-rose-600 font-medium'
                                                            : 'text-slate-500'
                                                }`}
                                            >
                                                {emailStatus.message}
                                                {emailStatus.available === false && emailStatus.message.includes('terdaftar') && (
                                                    <Link
                                                        to={`/login?redirect=${encodeURIComponent(redirectTo)}`}
                                                        className="text-[#0068b0] underline ml-1 font-bold hover:text-[#203880]"
                                                    >
                                                        Login di sini &rarr;
                                                    </Link>
                                                )}
                                            </p>
                                        )}
                                        {emailStatus.suggestion && (
                                            <p className="text-amber-800 bg-amber-50 p-1.5 rounded border border-amber-200 flex items-center justify-between">
                                                <span>
                                                    Apakah maksud Anda: <strong>{emailStatus.suggestion}</strong>?
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setForm((prev) => ({ ...prev, email: emailStatus.suggestion }));
                                                    }}
                                                    className="text-xs text-[#0068b0] underline hover:text-[#203880] font-semibold ml-2"
                                                >
                                                    Gunakan
                                                </button>
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                            {/* Baris Kata Sandi & Konfirmasi */}
                            <div className="col-span-12 md:col-span-6">
                                <label className="bs-form-label flex items-center justify-between">
                                    <span>Kata Sandi Baru *</span>
                                    <span className="text-[11px] text-[#64748b] font-normal">Min. 8 karakter</span>
                                </label>
                                <div className="relative">
                                    <input
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        minLength={8}
                                        value={form.password}
                                        onChange={handleChange}
                                        required
                                        placeholder="Kombinasi huruf, angka & simbol"
                                        className="bs-form-control pr-10"
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1"
                                        tabIndex={-1}
                                        title={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                <PasswordStrengthMeter password={form.password} />
                            </div>

                            <div className="col-span-12 md:col-span-6">
                                <label className="bs-form-label flex items-center justify-between">
                                    <span>Konfirmasi Kata Sandi *</span>
                                    {form.password_confirmation && (
                                        <span className="text-[11px] font-semibold">
                                            {form.password === form.password_confirmation ? (
                                                <span className="text-emerald-700 inline-flex items-center gap-1">
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                    Cocok
                                                </span>
                                            ) : (
                                                <span className="text-rose-600 inline-flex items-center gap-1">
                                                    <XCircle className="w-3.5 h-3.5" />
                                                    Belum cocok
                                                </span>
                                            )}
                                        </span>
                                    )}
                                </label>
                                <div className="relative">
                                    <input
                                        name="password_confirmation"
                                        type={showPasswordConfirm ? 'text' : 'password'}
                                        minLength={8}
                                        value={form.password_confirmation}
                                        onChange={handleChange}
                                        required
                                        placeholder="Ulangi kata sandi di atas"
                                        className={`bs-form-control pr-10 ${
                                            form.password_confirmation
                                                ? form.password === form.password_confirmation
                                                    ? 'border-emerald-500 focus:border-emerald-600 focus:ring-emerald-200'
                                                    : 'border-rose-400 focus:border-rose-500 focus:ring-rose-200'
                                                : ''
                                        }`}
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1"
                                        tabIndex={-1}
                                        title={showPasswordConfirm ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                                    >
                                        {showPasswordConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {form.password_confirmation && form.password !== form.password_confirmation && (
                                    <div className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                        Kata sandi konfirmasi belum sama dengan kata sandi di samping.
                                    </div>
                                )}
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
                                <label className="bs-form-label flex items-center justify-between">
                                    <span>Tahun Lulus *</span>
                                    {yearTouched && form.tahun_lulus && (
                                        <span className="text-[11px] font-semibold">
                                            {validateGraduationYear(form.tahun_lulus).valid ? (
                                                <span className="text-emerald-700 inline-flex items-center gap-1">
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                    Tahun Valid
                                                </span>
                                            ) : (
                                                <span className="text-rose-600 inline-flex items-center gap-1">
                                                    <XCircle className="w-3.5 h-3.5" />
                                                    Format Salah
                                                </span>
                                            )}
                                        </span>
                                    )}
                                </label>
                                <div className="relative">
                                    <input
                                        name="tahun_lulus"
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        maxLength={4}
                                        value={form.tahun_lulus}
                                        onChange={handleYearChange}
                                        onBlur={() => setYearTouched(true)}
                                        required
                                        placeholder="Contoh: 2025 (4 digit)"
                                        className={`bs-form-control pr-8 ${
                                            yearTouched && form.tahun_lulus
                                                ? validateGraduationYear(form.tahun_lulus).valid
                                                    ? 'border-emerald-500 focus:border-emerald-600 focus:ring-emerald-200'
                                                    : 'border-rose-400 focus:border-rose-500 focus:ring-rose-200'
                                                : ''
                                        }`}
                                    />
                                    {yearTouched && form.tahun_lulus && (
                                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                                            {validateGraduationYear(form.tahun_lulus).valid ? (
                                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                            ) : (
                                                <AlertCircle className="w-4 h-4 text-rose-500" />
                                            )}
                                        </div>
                                    )}
                                </div>
                                {yearTouched && form.tahun_lulus && !validateGraduationYear(form.tahun_lulus).valid && (
                                    <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                        {validateGraduationYear(form.tahun_lulus).message}
                                    </p>
                                )}
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
