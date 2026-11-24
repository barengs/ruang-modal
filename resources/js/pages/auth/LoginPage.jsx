import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AlertCircle, KeyRound, Lock, Mail } from 'lucide-react';
import { clearAuthError, loginUser } from '../../store/slices/authSlice';

const DEMO_ACCOUNTS = [
    { label: 'Super Admin', email: 'superadmin@doubletrack.sch.id', password: 'password123' },
    { label: 'Admin Pengelola', email: 'admin@doubletrack.sch.id', password: 'password123' },
    { label: 'Petugas Monitoring', email: 'petugas@doubletrack.sch.id', password: 'password123' },
];

export default function LoginPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { token, loading, error } = useSelector((state) => state.auth);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        if (token) {
            navigate('/admin', { replace: true });
        }
        return () => dispatch(clearAuthError());
    }, [token, navigate, dispatch]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await dispatch(loginUser({ email, password }));
        if (loginUser.fulfilled.match(res)) {
            navigate('/admin', { replace: true });
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
                        Login Panel Pengelola (JWT Auth)
                    </span>
                </div>
                <div className="bs-card-body space-y-4">
                    {error && (
                        <div className="bs-alert bs-alert-danger">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="bs-form-label">Email Pengelola</label>
                            <div className="relative">
                                <Mail className="w-4 h-4 text-[#6c757d] absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="admin@doubletrack.sch.id"
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
                            {loading ? 'Memproses Login...' : 'Masuk ke Panel Admin'}
                        </button>
                    </form>

                    {/* Demo Accounts Helper */}
                    <div className="pt-3 border-t border-[#dee2e6]">
                        <div className="text-xs font-semibold text-[#6c757d] mb-2">
                            Akun Demo (klik untuk isi otomatis):
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {DEMO_ACCOUNTS.map((acc) => (
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
    );
}
