import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AlertCircle, KeyRound, Lock, Mail, UserPlus, X } from 'lucide-react';
import {
    clearAuthError,
    isAlumniUser,
    loginUser,
    socialLoginUser,
} from '../../store/slices/authSlice';

const DEMO_ALUMNI = [
    { label: 'Rina Sari (Alumni Boga)', email: 'rina.sari@alumni.sch.id', password: 'password123' },
    { label: 'Bagus Pratama (Alumni Multimedia)', email: 'bagus.pratama@alumni.sch.id', password: 'password123' },
];

const DEMO_ADMIN = [
    { label: 'Super Admin', email: 'superadmin@doubletrack.sch.id', password: 'password123' },
    { label: 'Admin Pengelola', email: 'admin@doubletrack.sch.id', password: 'password123' },
    { label: 'Petugas Monitoring', email: 'petugas@doubletrack.sch.id', password: 'password123' },
];

const SOCIAL_PRESETS = {
    google: [
        {
            name: 'Rina Sari Dewi',
            email: 'rina.sari@alumni.sch.id',
            sekolah: 'SMAN 1 Tuban',
            kompetensi: 'Tata Boga',
        },
        {
            name: 'Dewi Lestari',
            email: 'dewi.lestari@alumni.sch.id',
            sekolah: 'SMAN 1 Pacitan',
            kompetensi: 'Tata Kecantikan',
        },
    ],
    facebook: [
        {
            name: 'Bagus Pratama',
            email: 'bagus.pratama@alumni.sch.id',
            sekolah: 'SMAN 1 Ngawi',
            kompetensi: 'Multimedia & Desain Grafis',
        },
        {
            name: 'Fajar Nugroho',
            email: 'fajar.n@alumni.sch.id',
            sekolah: 'SMAN 1 Magetan',
            kompetensi: 'Teknologi Informasi & Web',
        },
    ],
};

function GoogleIcon() {
    return (
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
            <path
                fill="#4285F4"
                d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.51-1.14 2.79-2.4 3.65v3.03h3.88c2.27-2.09 3.54-5.17 3.54-8.92z"
            />
            <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.13C3.26 21.3 7.31 24 12 24z"
            />
            <path
                fill="#FBBC05"
                d="M5.28 14.26c-.24-.72-.38-1.49-.38-2.26s.14-1.54.38-2.26V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.13z"
            />
            <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.61l3.99 3.13c.95-2.85 3.6-4.99 6.72-4.99z"
            />
        </svg>
    );
}

function FacebookIcon() {
    return (
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
    );
}

export default function LoginPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirectTo = searchParams.get('redirect') || '';
    const { token, user, loading, error } = useSelector((state) => state.auth);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Social OAuth Modal State
    const [socialProvider, setSocialProvider] = useState(null); // 'google' | 'facebook' | null
    const [socialForm, setSocialForm] = useState({ name: '', email: '', sekolah: '' });

    useEffect(() => {
        if (token && user) {
            if (redirectTo) {
                navigate(redirectTo, { replace: true });
            } else if (isAlumniUser(user)) {
                navigate('/alumni', { replace: true });
            } else {
                navigate('/admin', { replace: true });
            }
        }
        return () => dispatch(clearAuthError());
    }, [token, user, redirectTo, navigate, dispatch]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await dispatch(loginUser({ email, password }));
        if (loginUser.fulfilled.match(res)) {
            const loggedUser = res.payload?.user;
            if (redirectTo) {
                navigate(redirectTo, { replace: true });
            } else if (isAlumniUser(loggedUser)) {
                navigate('/alumni', { replace: true });
            } else {
                navigate('/admin', { replace: true });
            }
        }
    };

    const openSocialModal = (provider) => {
        setSocialProvider(provider);
        setSocialForm({ name: '', email: '', sekolah: '' });
    };

    const handleQuickSocialLogin = async (preset) => {
        if (!socialProvider) return;
        const res = await dispatch(
            socialLoginUser({
                provider: socialProvider,
                name: preset.name,
                email: preset.email,
                sekolah: preset.sekolah,
                kompetensi: preset.kompetensi,
            })
        );
        if (socialLoginUser.fulfilled.match(res)) {
            setSocialProvider(null);
        }
    };

    const handleCustomSocialSubmit = async (e) => {
        e.preventDefault();
        if (!socialProvider || !socialForm.email.trim() || !socialForm.name.trim()) return;
        const res = await dispatch(
            socialLoginUser({
                provider: socialProvider,
                name: socialForm.name.trim(),
                email: socialForm.email.trim(),
                sekolah: socialForm.sekolah.trim() || 'Alumni SMA Double Track',
            })
        );
        if (socialLoginUser.fulfilled.match(res)) {
            setSocialProvider(null);
        }
    };

    return (
        <div className="max-w-md mx-auto py-6">
            <div className="bs-card border-t-4 border-t-[#f8a000]">
                <div className="bs-card-header flex-col items-center text-center py-4 bg-white">
                    <img
                        src="/images/logo-dt.webp"
                        alt="Logo SMA Double Track"
                        className="h-12 w-auto object-contain mb-2"
                    />
                    <span className="inline-flex items-center gap-2 text-[#203880] font-bold">
                        <KeyRound className="w-4 h-4 text-[#f8a000]" />
                        Login Alumni &amp; Pengelola
                    </span>
                    <p className="text-xs font-normal text-[#64748b] mt-0.5">
                        Masuk untuk mengajukan layanan, memantau perkembangan, atau mengelola sistem.
                    </p>
                </div>
                <div className="bs-card-body space-y-4">
                    {error && (
                        <div className="bs-alert bs-alert-danger">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Social Login Buttons: Google & Facebook */}
                    <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2.5">
                            <button
                                type="button"
                                disabled={loading}
                                onClick={() => openSocialModal('google')}
                                className="bs-btn bg-white text-[#1e293b] border-[#cbd5e1] hover:bg-[#f8fafd] hover:border-[#94a3b8] font-semibold text-xs py-2.5 shadow-2xs"
                            >
                                <GoogleIcon />
                                <span>Google</span>
                            </button>

                            <button
                                type="button"
                                disabled={loading}
                                onClick={() => openSocialModal('facebook')}
                                className="bs-btn bg-[#1877F2] text-white border-[#1877F2] hover:bg-[#166fe5] font-semibold text-xs py-2.5 shadow-2xs"
                            >
                                <FacebookIcon />
                                <span>Facebook</span>
                            </button>
                        </div>

                        <div className="relative flex items-center py-1">
                            <div className="flex-grow border-t border-[#dbe3f0]" />
                            <span className="shrink-0 mx-3 text-[11px] uppercase tracking-wider font-semibold text-[#64748b]">
                                atau masuk dengan email
                            </span>
                            <div className="flex-grow border-t border-[#dbe3f0]" />
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="bs-form-label">Alamat Email</label>
                            <div className="relative">
                                <Mail className="w-4 h-4 text-[#6c757d] absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="nama@alumni.sch.id"
                                    className="bs-form-control pl-9"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="bs-form-label">Kata Sandi</label>
                            <div className="relative">
                                <Lock className="w-4 h-4 text-[#6c757d] absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    className="bs-form-control pl-9"
                                />
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="bs-btn bs-btn-primary w-full">
                            {loading ? 'Memproses Login...' : 'Masuk Sekarang'}
                        </button>
                    </form>

                    {/* Register CTA for Alumni */}
                    <div className="p-3 rounded bg-[#eef4ff] border border-[#dbe3f0] text-center space-y-1.5">
                        <div className="text-xs text-[#203880] font-medium">
                            Belum memiliki akun Alumni SMA Double Track?
                        </div>
                        <Link
                            to={redirectTo ? `/register?redirect=${encodeURIComponent(redirectTo)}` : '/register'}
                            className="bs-btn bs-btn-sm bg-[#f8a000] text-[#17285e] font-semibold hover:bg-[#ffc010] w-full"
                        >
                            <UserPlus className="w-3.5 h-3.5" />
                            Daftar Akun Alumni Baru
                        </Link>
                    </div>

                    {/* Demo Accounts Helper */}
                    <div className="pt-3 border-t border-[#dee2e6] space-y-2.5">
                        <div>
                            <div className="text-xs font-semibold text-[#203880] mb-1.5">
                                Akun Demo Alumni (klik untuk isi otomatis):
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {DEMO_ALUMNI.map((acc) => (
                                    <button
                                        key={acc.email}
                                        type="button"
                                        onClick={() => {
                                            setEmail(acc.email);
                                            setPassword(acc.password);
                                        }}
                                        className="bs-btn bs-btn-sm bs-btn-outline-primary"
                                    >
                                        {acc.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <div className="text-xs font-semibold text-[#64748b] mb-1.5">
                                Akun Demo Pengelola / Admin:
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {DEMO_ADMIN.map((acc) => (
                                    <button
                                        key={acc.email}
                                        type="button"
                                        onClick={() => {
                                            setEmail(acc.email);
                                            setPassword(acc.password);
                                        }}
                                        className="bs-btn bs-btn-sm bs-btn-outline-secondary"
                                    >
                                        {acc.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Social Account Chooser Modal (Google / Facebook OAuth) */}
            {socialProvider && (
                <div className="bs-modal-backdrop" onClick={() => setSocialProvider(null)}>
                    <div className="bs-modal-dialog max-w-md" onClick={(e) => e.stopPropagation()}>
                        <div className="bs-modal-header">
                            <div className="flex items-center gap-2">
                                {socialProvider === 'google' ? (
                                    <GoogleIcon />
                                ) : (
                                    <span className="text-[#1877F2]">
                                        <FacebookIcon />
                                    </span>
                                )}
                                <h3 className="font-bold text-sm text-[#203880]">
                                    Masuk dengan {socialProvider === 'google' ? 'Google' : 'Facebook'}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSocialProvider(null)}
                                className="text-[#64748b] hover:text-[#1e293b]"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="bs-modal-body space-y-4 text-xs">
                            <div className="space-y-2">
                                <div className="font-semibold text-[#203880]">
                                    Pilih Akun {socialProvider === 'google' ? 'Google' : 'Facebook'} Tersimpan:
                                </div>
                                <div className="space-y-1.5">
                                    {(SOCIAL_PRESETS[socialProvider] || []).map((preset) => (
                                        <button
                                            key={preset.email}
                                            type="button"
                                            disabled={loading}
                                            onClick={() => handleQuickSocialLogin(preset)}
                                            className="w-full flex items-center justify-between p-2.5 rounded border border-[#dbe3f0] bg-[#f8fafd] hover:bg-[#eef4ff] hover:border-[#0068b0] transition-colors text-left cursor-pointer"
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <div
                                                    className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center text-white ${
                                                        socialProvider === 'google'
                                                            ? 'bg-[#4285F4]'
                                                            : 'bg-[#1877F2]'
                                                    }`}
                                                >
                                                    {preset.name[0]}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-[#203880]">
                                                        {preset.name}
                                                    </div>
                                                    <div className="text-[11px] text-[#64748b]">
                                                        {preset.email} • {preset.sekolah}
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="bs-badge bs-badge-info">Pilih</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="relative flex items-center">
                                <div className="flex-grow border-t border-[#dbe3f0]" />
                                <span className="shrink-0 mx-2 text-[11px] text-[#64748b]">
                                    atau gunakan akun {socialProvider === 'google' ? 'Google' : 'Facebook'} lain
                                </span>
                                <div className="flex-grow border-t border-[#dbe3f0]" />
                            </div>

                            <form onSubmit={handleCustomSocialSubmit} className="space-y-3">
                                <div>
                                    <label className="bs-form-label text-xs">Nama Akun *</label>
                                    <input
                                        type="text"
                                        required
                                        value={socialForm.name}
                                        onChange={(e) =>
                                            setSocialForm((p) => ({ ...p, name: e.target.value }))
                                        }
                                        placeholder="Nama Lengkap Anda"
                                        className="bs-form-control text-xs py-1.5"
                                    />
                                </div>
                                <div>
                                    <label className="bs-form-label text-xs">
                                        Email {socialProvider === 'google' ? 'Google' : 'Facebook'} *
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={socialForm.email}
                                        onChange={(e) =>
                                            setSocialForm((p) => ({ ...p, email: e.target.value }))
                                        }
                                        placeholder={
                                            socialProvider === 'google'
                                                ? 'nama@gmail.com'
                                                : 'nama@facebook.com'
                                        }
                                        className="bs-form-control text-xs py-1.5"
                                    />
                                </div>
                                <div>
                                    <label className="bs-form-label text-xs">Asal Sekolah SMA (Opsional)</label>
                                    <input
                                        type="text"
                                        value={socialForm.sekolah}
                                        onChange={(e) =>
                                            setSocialForm((p) => ({ ...p, sekolah: e.target.value }))
                                        }
                                        placeholder="Contoh: SMAN 1 Tuban"
                                        className="bs-form-control text-xs py-1.5"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`bs-btn w-full text-xs font-semibold ${
                                        socialProvider === 'google'
                                            ? 'bs-btn-primary'
                                            : 'bg-[#1877F2] text-white hover:bg-[#166fe5]'
                                    }`}
                                >
                                    {loading
                                        ? 'Memproses...'
                                        : `Lanjutkan dengan ${
                                              socialProvider === 'google' ? 'Google' : 'Facebook'
                                          }`}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
