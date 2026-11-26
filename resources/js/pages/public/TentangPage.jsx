import React from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowRight,
    Award,
    Briefcase,
    Check,
    CheckCircle2,
    Layers,
    ShieldCheck,
    Store,
    Target,
    TrendingUp,
    Users,
} from 'lucide-react';

export default function TentangPage() {
    const pillars = [
        {
            title: 'Ruang Modal',
            badge: 'Fasilitasi',
            badgeClass: 'bs-badge-info',
            icon: Briefcase,
            iconColor: 'text-[#0068b0]',
            desc: 'Fasilitasi bantuan alat kerja, bahan baku produksi, mesin usaha, serta perlengkapan pemasaran bagi alumni yang merintis karier maupun usaha mandiri.',
            to: '/ruang-modal',
            cta: 'Ajukan Ruang Modal',
        },
        {
            title: 'Ruang Tumbuh',
            badge: 'Mentoring',
            badgeClass: 'bs-badge-success',
            icon: TrendingUp,
            iconColor: 'text-[#198754]',
            desc: 'Layanan pendampingan dan konsultasi bersama mentor praktis meliputi persiapan kerja, manajemen usaha, branding, keuangan, hingga legalitas UMKM.',
            to: '/ruang-tumbuh',
            cta: 'Ajukan Pendampingan',
        },
        {
            title: 'Ruang Pasar',
            badge: 'Etalase',
            badgeClass: 'bs-badge-warning',
            icon: Store,
            iconColor: 'text-[#f59e0b]',
            desc: 'Etalase digital terkurasi untuk mempromosikan produk dan jasa unggulan karya alumni SMA Double Track agar menjangkau pasar yang lebih luas.',
            to: '/ruang-pasar',
            cta: 'Daftarkan Produk / Jasa',
        },
    ];

    const workflows = [
        {
            step: '01',
            title: 'Pengajuan Daring',
            desc: 'Alumni mengisi formulir pengajuan Ruang Modal, Ruang Tumbuh, atau pendaftaran produk Ruang Pasar melalui portal.',
        },
        {
            step: '02',
            title: 'Kurasi & Verifikasi',
            desc: 'Tim pengelola meninjau kelengkapan data, kelayakan rencana pemanfaatan, serta kesesuaian kompetensi alumni.',
        },
        {
            step: '03',
            title: 'Fasilitasi & Pendampingan',
            desc: 'Alumni yang lolos verifikasi memperoleh fasilitasi bantuan, sesi mentoring terjadwal, atau penayangan produk di etalase.',
        },
        {
            step: '04',
            title: 'Monitoring Berkelanjutan',
            desc: 'Pengelola memantau perkembangan usaha dan karier alumni secara berkala untuk memastikan dampak program yang berkelanjutan.',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Compact Full-Bleed Hero Banner (Matching Beranda Style) */}
            <section className="w-screen relative left-1/2 -translate-x-1/2 bg-[#243271] text-white py-8 md:py-10 overflow-hidden shadow-sm">
                <div
                    className="pointer-events-none absolute -top-20 -left-20 w-72 h-72 rounded-full opacity-20 blur-3xl"
                    style={{ background: 'radial-gradient(circle, #38bdf8 0%, transparent 70%)' }}
                />
                <div
                    className="pointer-events-none absolute -bottom-16 right-1/4 w-80 h-80 rounded-full opacity-20 blur-3xl"
                    style={{ background: 'radial-gradient(circle, #0d4cc4 0%, transparent 70%)' }}
                />

                <div className="bs-container relative z-10">
                    <div className="grid grid-cols-12 items-center gap-6 lg:gap-8">
                        {/* Kolom Kiri: Teks Profil, Headline, Checklist & CTA */}
                        <div className="col-span-12 lg:col-span-7 space-y-3.5">
                            <p className="text-xs sm:text-sm font-medium text-white/95 tracking-wide">
                                Profil &amp; Arsitektur Program{' '}
                                <span className="text-[#ffb703] font-bold">SMA Double Track</span>
                            </p>
                            <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold leading-tight tracking-tight text-white">
                                Ruang Alumni SMA Double Track
                            </h1>
                            <p className="text-xs sm:text-sm text-[#dbeafe] leading-relaxed max-w-2xl">
                                Wadah sinergi pasca-pelatihan bagi lulusan SMA Double Track untuk mengubah keterampilan
                                vokasional menjadi kemandirian ekonomi melalui fasilitasi modal, pendampingan intensif,
                                dan perluasan akses pasar.
                            </p>
                            <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1">
                                {[
                                    'Berbasis Kompetensi Vokasional',
                                    'Terkurasi & Transparan',
                                    'Monitoring Berkelanjutan',
                                ].map((item) => (
                                    <li
                                        key={item}
                                        className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-white"
                                    >
                                        <span className="w-4 h-4 rounded-full bg-[#14b8a6] text-white inline-flex items-center justify-center shrink-0">
                                            <Check className="w-3 h-3 stroke-[3]" />
                                        </span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="pt-2 flex flex-wrap items-center gap-3">
                                <Link
                                    to="/ruang-modal"
                                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#f26722] to-[#f9841a] hover:from-[#e05815] hover:to-[#eb770e] text-white font-bold text-xs sm:text-sm shadow-md transition-all no-underline"
                                >
                                    Ajukan Layanan Alumni
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>

                        {/* Kolom Kanan: Visual Stiker Tiga Siswa dengan Booklet & Floating Badge */}
                        <div className="col-span-12 lg:col-span-5 flex justify-center lg:justify-end">
                            <div className="relative max-w-[360px] sm:max-w-[400px] lg:max-w-[440px] w-full">
                                {/* Stiker Tiga Siswa Berjilbab & Rompi Merah */}
                                <div className="relative z-10 flex justify-center">
                                    <img
                                        src="/images/tiga-siswa-dt.webp"
                                        alt="Tiga Siswa SMA Double Track dengan Booklet"
                                        className="w-full h-auto max-h-[300px] sm:max-h-[340px] lg:max-h-[360px] object-contain drop-shadow-2xl select-none"
                                    />
                                </div>

                                {/* Floating Card Logo & 3 Pilar */}
                                <div className="absolute -bottom-2 -left-2 sm:-left-4 z-20 bg-[#1a2563]/90 backdrop-blur-md border border-white/30 rounded-xl p-3 shadow-xl flex items-center gap-3">
                                    <div className="bg-white rounded-lg p-1.5 shrink-0 shadow-xs">
                                        <img
                                            src="/images/logo-dt.webp"
                                            alt="Logo SMA Double Track"
                                            className="h-8 w-auto object-contain"
                                        />
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-[#cbd5e1] font-medium leading-none">
                                            3 Pilar Terintegrasi
                                        </div>
                                        <div className="text-xs sm:text-sm font-extrabold text-[#ffb703] mt-1">
                                            Modal • Tumbuh • Pasar
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Latar Belakang & Visi Misi */}
            <div className="bs-row">
                <div className="col-span-12 lg:col-span-7">
                    <div className="bs-card h-full">
                        <div className="bs-card-header">
                            <span className="inline-flex items-center gap-2">
                                <Layers className="w-4 h-4 text-[#0068b0]" />
                                Sekilas Program
                            </span>
                        </div>
                        <div className="bs-card-body space-y-3 text-sm text-[#495057] leading-relaxed">
                            <p>
                                Program <strong>SMA Double Track</strong> membekali siswa SMA dengan keterampilan kerja dan
                                kewirausahaan di samping pendidikan akademik reguler. Setelah lulus, alumni membutuhkan
                                ruang pendukung agar keterampilan yang telah dipelajari dapat tumbuh menjadi sumber
                                penghasilan nyata.
                            </p>
                            <p>
                                Platform <strong>Ruang Alumni SMA Double Track</strong> hadir menghubungkan alumni
                                dengan pengelola program, mentor industri, serta masyarakat luas melalui tiga pilar layanan
                                terintegrasi: <strong>Ruang Modal</strong>, <strong>Ruang Tumbuh</strong>, dan{' '}
                                <strong>Ruang Pasar</strong>.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                                <div className="p-3 rounded border border-[#dee2e6] bg-[#f8f9fa]">
                                    <div className="flex items-center gap-1.5 font-semibold text-[#203880] text-xs">
                                        <Award className="w-4 h-4 text-[#0068b0]" />
                                        Berbasis Kompetensi
                                    </div>
                                    <p className="text-xs text-[#6c757d] mt-1">
                                        Selaras dengan bidang keterampilan Double Track yang ditempuh di sekolah.
                                    </p>
                                </div>
                                <div className="p-3 rounded border border-[#dee2e6] bg-[#f8f9fa]">
                                    <div className="flex items-center gap-1.5 font-semibold text-[#203880] text-xs">
                                        <ShieldCheck className="w-4 h-4 text-[#198754]" />
                                        Terkurasi & Transparan
                                    </div>
                                    <p className="text-xs text-[#6c757d] mt-1">
                                        Setiap pengajuan diverifikasi secara objektif oleh tim pengelola program.
                                    </p>
                                </div>
                                <div className="p-3 rounded border border-[#dee2e6] bg-[#f8f9fa]">
                                    <div className="flex items-center gap-1.5 font-semibold text-[#203880] text-xs">
                                        <Users className="w-4 h-4 text-[#f59e0b]" />
                                        Pendampingan Berlanjut
                                    </div>
                                    <p className="text-xs text-[#6c757d] mt-1">
                                        Didukung monitoring berkala untuk menjaga keberlanjutan usaha dan karier.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-span-12 lg:col-span-5">
                    <div className="bs-card h-full">
                        <div className="bs-card-header">
                            <span className="inline-flex items-center gap-2">
                                <Target className="w-4 h-4 text-[#198754]" />
                                Tujuan Ruang Alumni
                            </span>
                        </div>
                        <div className="bs-card-body">
                            <ul className="space-y-3 text-sm text-[#495057]">
                                <li className="flex items-start gap-2.5">
                                    <CheckCircle2 className="w-4 h-4 text-[#198754] shrink-0 mt-0.5" />
                                    <span>
                                        Meningkatkan keterserapan alumni di dunia kerja dan mempercepat pertumbuhan wirausaha
                                        baru berbasis keterampilan.
                                    </span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <CheckCircle2 className="w-4 h-4 text-[#198754] shrink-0 mt-0.5" />
                                    <span>
                                        Menyediakan akses fasilitasi peralatan kerja dan modal produksi awal yang tepat
                                        sasaran bagi alumni potensial.
                                    </span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <CheckCircle2 className="w-4 h-4 text-[#198754] shrink-0 mt-0.5" />
                                    <span>
                                        Menghadirkan ruang konsultasi terarah bersama praktisi dan mentor untuk menjawab
                                        tantangan teknis maupun manajemen usaha.
                                    </span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <CheckCircle2 className="w-4 h-4 text-[#198754] shrink-0 mt-0.5" />
                                    <span>
                                        Memperluas jangkauan promosi produk dan jasa alumni melalui etalase publik yang
                                        terpercaya.
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3 Pilar Layanan */}
            <div className="space-y-3">
                <div>
                    <h2 className="text-base font-bold text-[#203880]">Tiga Pilar Layanan Utama</h2>
                    <p className="text-xs text-[#6c757d]">
                        Pilih layanan pengajuan yang sesuai dengan kebutuhan pengembangan karier dan usaha Anda.
                    </p>
                </div>
                <div className="bs-row">
                    {pillars.map((p) => {
                        const Icon = p.icon;
                        return (
                            <div key={p.title} className="col-span-12 md:col-span-4">
                                <div className="bs-card h-full flex flex-col">
                                    <div className="bs-card-header">
                                        <span className="inline-flex items-center gap-2">
                                            <Icon className={`w-4 h-4 ${p.iconColor}`} />
                                            {p.title}
                                        </span>
                                        <span className={`bs-badge ${p.badgeClass}`}>{p.badge}</span>
                                    </div>
                                    <div className="bs-card-body flex-1 flex flex-col justify-between gap-4">
                                        <p className="text-sm text-[#495057] leading-relaxed">{p.desc}</p>
                                        <Link to={p.to} className="bs-btn bs-btn-outline-primary w-full">
                                            {p.cta}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Alur Pengajuan */}
            <div className="bs-card">
                <div className="bs-card-header">
                    <div>
                        <h2 className="text-base font-bold text-[#203880]">Alur Pengajuan & Pendampingan</h2>
                        <p className="text-xs font-normal text-[#6c757d]">
                            Tahapan layanan dari pendaftaran hingga pemantauan perkembangan alumni.
                        </p>
                    </div>
                </div>
                <div className="bs-card-body">
                    <div className="bs-row">
                        {workflows.map((w) => (
                            <div key={w.step} className="col-span-12 sm:col-span-6 lg:col-span-3">
                                <div className="p-4 rounded-md border border-[#dee2e6] bg-[#fcfcfd] h-full space-y-2">
                                    <span className="inline-block px-2 py-0.5 rounded bg-[#203880] text-white text-xs font-bold">
                                        Tahap {w.step}
                                    </span>
                                    <h3 className="font-semibold text-sm text-[#203880]">{w.title}</h3>
                                    <p className="text-xs text-[#6c757d] leading-relaxed">{w.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
