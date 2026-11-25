import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogIn, ShieldAlert, UserPlus } from 'lucide-react';

export default function AlumniAuthGate({ moduleName = 'Layanan Ruang Alumni' }) {
    const location = useLocation();
    const redirectParam = encodeURIComponent(location.pathname);

    return (
        <div className="p-6 rounded-md border-2 border-dashed border-[#0068b0]/40 bg-[#eef4ff]/60 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#203880] text-[#ffc010] flex items-center justify-center mx-auto shadow-xs">
                <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="max-w-xl mx-auto space-y-1.5">
                <h3 className="text-base font-bold text-[#203880]">
                    Diperlukan Akun Alumni untuk Mengajukan {moduleName}
                </h3>
                <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                    Sebelum mendaftarkan diri ke <strong>{moduleName}</strong>, Anda wajib memiliki akun alumni terlebih
                    dahulu agar data profil, riwayat pengajuan, perkembangan usaha, dan testimoni Anda tercatat secara
                    terintegrasi di <strong>Dashboard Alumni</strong>.
                </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                <Link
                    to={`/register?redirect=${redirectParam}`}
                    className="bs-btn bs-btn-primary"
                >
                    <UserPlus className="w-4 h-4" />
                    Daftar Akun Alumni Baru
                </Link>
                <Link
                    to={`/login?redirect=${redirectParam}`}
                    className="bs-btn bg-[#f8a000] text-[#17285e] font-semibold hover:bg-[#ffc010]"
                >
                    <LogIn className="w-4 h-4" />
                    Masuk ke Akun Saya
                </Link>
            </div>
        </div>
    );
}
