import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    ArrowRight,
    Award,
    Briefcase,
    Check,
    ChevronLeft,
    ChevronRight,
    ExternalLink,
    Quote,
    ShieldCheck,
    Sparkles,
    Star,
    Store,
    TrendingUp,
    Zap,
} from 'lucide-react';
import api from '../../api/axios';
import {
    fetchPublicPasar,
    fetchPublicStats,
} from '../../store/slices/publicSlice';
import PasarProductDetailModal from '../../components/PasarProductDetailModal';
import { getCategoryThumbnail, getProductThumbnail, safeOrderUrl } from '../../utils/format';

const ALUMNI_TESTIMONIALS = [
    {
        id: 1,
        nama: 'Rina Sari Dewi',
        sekolah: 'SMAN 1 Tuban',
        angkatan: '2024',
        kompetensi: 'Tata Boga',
        program: 'Penerima Ruang Modal',
        badgeClass: 'bs-badge-info',
        usaha: 'Dapur Rina — Bakery & Kue Kering',
        capaian: 'Omzet Rp4.800.000 / bulan',
        kutipan:
            'Bantuan oven listrik 60L dan stand mixer dari Ruang Modal membuat kapasitas produksi roti sobek dan nastar saya meningkat tiga kali lipat. Kini saya rutin menyuplai 3 koperasi sekolah dan pesanan hantaran kantor.',
    },
    {
        id: 2,
        nama: 'Nadia Putri',
        sekolah: 'SMAN 1 Sumenep',
        angkatan: '2024',
        kompetensi: 'Tata Boga & Olahan Pangan',
        program: 'Alumni Ruang Tumbuh',
        badgeClass: 'bs-badge-success',
        usaha: 'Nadia Snack & Camilan Madura',
        capaian: 'NIB OSS & Sertifikat Halal Terbit',
        kutipan:
            'Melalui pendampingan Ruang Tumbuh, saya dibimbing langkah demi langkah mengurus NIB, PIRT, hingga sertifikasi halal self-declare. Produk saya sekarang dipercaya masuk ke toko oleh-oleh modern di Sumenep.',
    },
    {
        id: 3,
        nama: 'Ahmad Fauzi',
        sekolah: 'SMAN 2 Bojonegoro',
        angkatan: '2025',
        kompetensi: 'Teknik Kendaraan Ringan',
        program: 'Penerima Ruang Modal',
        badgeClass: 'bs-badge-info',
        usaha: 'Fauzi Auto Care — Servis Panggilan',
        capaian: 'Pendapatan +Rp3.600.000 / bulan',
        kutipan:
            'Fasilitasi toolset kunci lengkap, dongkrak buaya, dan kompresor portable sangat membantu saya membuka layanan servis motor dan mobil panggilan di akhir pekan selain bekerja di bengkel rekanan.',
    },
    {
        id: 4,
        nama: 'Dimas Saputra',
        sekolah: 'SMAN 1 Sampang',
        angkatan: '2025',
        kompetensi: 'Multimedia & Pemasaran Digital',
        program: 'Alumni Ruang Tumbuh',
        badgeClass: 'bs-badge-success',
        usaha: 'Kuliner & Katalog UMKM',
        capaian: 'Penjualan Online Naik 180%',
        kutipan:
            'Sesi mentoring branding dan strategi konten TikTok bersama mentor Ruang Tumbuh membuka wawasan saya tentang cara membuat katalog WhatsApp Business dan video produk yang menarik pembeli baru.',
    },
];

export default function HomePage() {
    const dispatch = useDispatch();
    const { stats, products, loadingProducts } = useSelector((state) => state.publicData);
    const [detailId, setDetailId] = useState(null);
    const [activeSlide, setActiveSlide] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [testimonials, setTestimonials] = useState(ALUMNI_TESTIMONIALS);

    useEffect(() => {
        dispatch(fetchPublicStats());
        dispatch(fetchPublicPasar());
        api.get('/public/testimonials')
            .then(({ data }) => {
                if (Array.isArray(data?.data) && data.data.length > 0) {
                    setTestimonials(
                        data.data.map((t) => ({
                            ...t,
                            badgeClass:
                                t.program === 'Alumni Ruang Tumbuh'
                                    ? 'bs-badge-success'
                                    : 'bs-badge-info',
                        }))
                    );
                }
            })
            .catch(() => {});
    }, [dispatch]);

    // Auto-running testimonial slider
    useEffect(() => {
        if (isPaused || testimonials.length === 0) return;
        const timer = setInterval(() => {
            setActiveSlide((prev) => (prev + 1) % testimonials.length);
        }, 4500);
        return () => clearInterval(timer);
    }, [isPaused, testimonials.length]);

    const featuredProducts = useMemo(() => products.slice(0, 4), [products]);
    const detailItem = useMemo(
        () => products.find((item) => item.id === detailId) || null,
        [products, detailId]
    );

    const totalStats =
        (Number(stats.products) || 0) +
        (Number(stats.modal) || 0) +
        (Number(stats.tumbuh) || 0) +
        (Number(stats.monitoring) || 0);

    const heroHighlights = [
        'Fasilitasi Alat Kerja & Modal Usaha',
        'Pendampingan Mentor & Legalitas UMKM',
        'Etalase Digital Produk & Jasa Alumni',
    ];

    return (
        <div className="space-y-8">
            {/* Full-Bleed Hero Banner + Bottom Overlapping Promo Card (IDwebhost-inspired style) */}
            <div className="relative">
                {/* Full-Bleed Deep Indigo Hero Wrapper */}
                <section className="w-screen relative left-1/2 -translate-x-1/2 bg-[#243271] text-white pt-8 pb-24 md:pt-12 md:pb-28 overflow-hidden">
                    {/* Subtle Ambient Glows */}
                    <div
                        className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-20 blur-3xl"
                        style={{ background: 'radial-gradient(circle, #38bdf8 0%, transparent 70%)' }}
                    />
                    <div
                        className="pointer-events-none absolute bottom-0 right-1/4 w-96 h-96 rounded-full opacity-15 blur-3xl"
                        style={{ background: 'radial-gradient(circle, #0d4cc4 0%, transparent 70%)' }}
                    />

                    <div className="bs-container relative z-10">
                        <div className="grid grid-cols-12 items-center gap-8 lg:gap-6">
                            {/* Left Column: Headline, Value Props Checklist & Orange CTA */}
                            <div className="col-span-12 lg:col-span-6 space-y-5">
                                <p className="text-sm sm:text-base font-medium text-white/95 tracking-wide">
                                    Ruang Pasca-Pelatihan Alumni{' '}
                                    <span className="text-[#ffb703] font-bold">SMA Double Track</span>
                                </p>

                                <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-extrabold leading-[1.2] tracking-tight text-white">
                                    Dari Keterampilan Vokasional
                                    <br className="hidden sm:inline" /> Menjadi Penghasilan Mandiri
                                </h1>

                                <div className="space-y-1 text-sm sm:text-[15px] text-[#dbeafe] leading-relaxed max-w-xl">
                                    <p>
                                        Platform pemberdayaan wirausaha &amp; karier{' '}
                                        <strong className="text-white font-bold">
                                            #1 Alumni SMA Double Track
                                        </strong>
                                        .
                                    </p>
                                    <p>
                                        Terintegrasi dari fasilitasi modal, pendampingan mentor, hingga etalase pasar.
                                    </p>
                                </div>

                                {/* 3 Checkmark Value Props */}
                                <ul className="space-y-2.5 pt-1">
                                    {heroHighlights.map((text) => (
                                        <li
                                            key={text}
                                            className="flex items-center gap-3 text-sm sm:text-[15px] font-medium text-white"
                                        >
                                            <span className="w-5 h-5 rounded-full bg-[#14b8a6] text-white inline-flex items-center justify-center shrink-0 shadow-xs">
                                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                                            </span>
                                            <span>{text}</span>
                                        </li>
                                    ))}
                                </ul>

                                {/* Prominent Orange CTA Button */}
                                <div className="pt-3 flex flex-wrap items-center gap-3">
                                    <Link
                                        to="/ruang-modal"
                                        className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg bg-gradient-to-r from-[#f26722] to-[#f9841a] hover:from-[#e05815] hover:to-[#eb770e] text-white font-bold text-sm sm:text-base shadow-lg shadow-black/20 transition-all no-underline"
                                    >
                                        Ajukan Ruang Modal
                                    </Link>
                                    <Link
                                        to="/ruang-tumbuh"
                                        className="inline-flex items-center justify-center gap-1.5 px-5 py-3.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/25 text-white font-semibold text-sm sm:text-base transition-all no-underline"
                                    >
                                        Konsultasi Mentor
                                    </Link>
                                </div>
                            </div>

                            {/* Right Column: Alumni Entrepreneur Visual + Floating Cards & Speedometer Gauge */}
                            <div className="col-span-12 lg:col-span-6">
                                <div className="relative max-w-[520px] mx-auto lg:ml-auto">
                                    {/* Group photo — semua alumni terlihat, background menyatu dengan hero */}
                                    <div className="relative overflow-hidden rounded-2xl">
                                        <img
                                            src="/images/hero-alumni.webp"
                                            alt="Alumni Wirausaha SMA Double Track"
                                            className="w-full h-auto object-contain select-none block"
                                        />
                                    </div>

                                    {/* Floating Card 1 (Left): Pertumbuhan Ekosistem / Business Growth */}
                                    <div className="absolute top-[20%] left-2 z-20 bg-[#1a2563]/90 backdrop-blur-md border border-white/40 rounded-xl px-3.5 py-2.5 sm:px-4 sm:py-3 shadow-xl min-w-[165px] sm:min-w-[190px]">
                                        <div className="flex items-center justify-between text-[11px] text-[#cbd5e1] font-medium mb-1">
                                            <span>Pertumbuhan Alumni</span>
                                            <span className="text-white/60">:</span>
                                        </div>
                                        <div className="flex items-end justify-between gap-3">
                                            <div>
                                                <div className="text-2xl sm:text-3xl font-extrabold text-white leading-none">
                                                    {totalStats > 0 ? totalStats : 492}
                                                </div>
                                                <div className="text-[11px] font-semibold text-[#34d399] mt-1">
                                                    ↑ +100% Aktif
                                                </div>
                                            </div>
                                            {/* Mini Rising Sparkline SVG */}
                                            <svg
                                                width="68"
                                                height="36"
                                                viewBox="0 0 68 36"
                                                fill="none"
                                                aria-hidden="true"
                                                className="shrink-0"
                                            >
                                                <path
                                                    d="M3 30 C12 28, 16 18, 24 22 C32 26, 38 12, 46 15 C54 18, 58 5, 65 4"
                                                    stroke="#38bdf8"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                />
                                                <circle cx="24" cy="22" r="2.5" fill="#34d399" />
                                                <circle cx="46" cy="15" r="2.5" fill="#34d399" />
                                                <circle cx="65" cy="4" r="3" fill="#34d399" />
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Floating Card 2 (Top-Right): Rating / Review Card */}
                                    <div className="absolute top-[4%] right-2 z-20 bg-[#1a2563]/90 backdrop-blur-md border border-white/40 rounded-xl px-3.5 py-2.5 sm:px-4 sm:py-3 shadow-xl">
                                        <div className="flex items-center justify-between gap-4 mb-1.5">
                                            <span className="text-[11px] font-semibold text-white/90">
                                                Kualitas Karya Alumni
                                            </span>
                                            <span className="w-4 h-4 rounded-full bg-gradient-to-tr from-[#f8a000] via-[#14b8a6] to-[#38bdf8] inline-flex items-center justify-center text-[9px] font-extrabold text-[#17285e]">
                                                DT
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1 text-[#fbbf24]">
                                            {[...Array(5)].map((_, idx) => (
                                                <Star
                                                    key={idx}
                                                    className="w-4 h-4 fill-[#fbbf24] text-[#fbbf24]"
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Floating Badge 3 (Bottom-Right): Speedometer / Acceleration Gauge */}
                                    <div className="absolute bottom-3 right-3 z-20 flex flex-col items-center">
                                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full p-2 bg-gradient-to-br from-[#38bdf8] via-[#22d3ee] to-[#10b981] shadow-xl flex items-center justify-center">
                                            <div className="w-full h-full rounded-full bg-white flex items-center justify-center relative">
                                                {/* Gauge Ticks SVG */}
                                                <svg
                                                    viewBox="0 0 64 64"
                                                    className="w-14 h-14 sm:w-16 sm:h-16"
                                                    aria-hidden="true"
                                                >
                                                    <path
                                                        d="M12 44 A 24 24 0 1 1 52 44"
                                                        fill="none"
                                                        stroke="#e2e8f0"
                                                        strokeWidth="4"
                                                        strokeLinecap="round"
                                                        strokeDasharray="3 5"
                                                    />
                                                    {/* Orange Speedometer Needle */}
                                                    <line
                                                        x1="32"
                                                        y1="34"
                                                        x2="47"
                                                        y2="20"
                                                        stroke="#f59e0b"
                                                        strokeWidth="3.5"
                                                        strokeLinecap="round"
                                                    />
                                                    <circle cx="32" cy="34" r="4" fill="#f59e0b" />
                                                </svg>
                                            </div>
                                        </div>
                                        <span className="mt-1 text-base sm:text-lg font-extrabold tracking-tight text-white drop-shadow">
                                            3 PILAR
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Bottom Overlapping Promo Banner (Straddling Hero & Content Section) */}
                <div className="relative z-20 -mt-14 md:-mt-16 max-w-4xl mx-auto">
                    <div className="rounded-2xl bg-gradient-to-r from-[#094396] via-[#0d5cc9] to-[#083f8e] text-white shadow-xl border border-white/15 px-5 py-4 sm:px-7 sm:py-5 overflow-hidden relative">
                        {/* Subtle decorative background watermark */}
                        <div className="pointer-events-none select-none absolute -bottom-6 left-1/3 text-[72px] font-black text-white/5 tracking-widest leading-none">
                            PASAR
                        </div>

                        <div className="grid grid-cols-12 items-center gap-4 relative z-10">
                            {/* Left Block: Title & Pill Tag */}
                            <div className="col-span-12 md:col-span-4 text-center md:text-left space-y-1.5">
                                <div className="text-xl sm:text-2xl font-extrabold leading-tight text-white">
                                    Etalase Karya
                                    <span className="block text-[#ffb703]">
                                        Produk &amp; Jasa Alumni
                                    </span>
                                </div>
                                <span className="inline-block px-3 py-1 rounded-full bg-white text-[#0b3c8a] text-[11px] font-bold shadow-xs">
                                    Terintegrasi Ruang Modal + Ruang Pasar
                                </span>
                            </div>

                            {/* Center Block: Storefront & Mobile Catalog Illustration */}
                            <div className="col-span-12 md:col-span-4 flex items-center justify-center">
                                <div className="relative flex items-center justify-center gap-2">
                                    {/* 3D-style Storefront Card */}
                                    <div className="w-24 h-20 rounded-xl bg-white/95 shadow-lg p-2 flex flex-col justify-between border-b-4 border-[#c084fc]">
                                        <div className="bg-gradient-to-r from-[#7c3aed] to-[#9333ea] text-white text-[10px] font-extrabold px-2 py-0.5 rounded text-center tracking-wider">
                                            RUANG PASAR
                                        </div>
                                        <div className="grid grid-cols-2 gap-1.5 px-1">
                                            <div className="h-7 rounded bg-[#fef3c7] flex items-center justify-center">
                                                <Store className="w-4 h-4 text-[#d97706]" />
                                            </div>
                                            <div className="h-7 rounded bg-[#e0f2fe] flex items-center justify-center">
                                                <Briefcase className="w-4 h-4 text-[#0284c7]" />
                                            </div>
                                        </div>
                                        <div className="h-1.5 rounded-full bg-[#e2e8f0] w-3/4 mx-auto" />
                                    </div>

                                    {/* Mobile Catalog Mockup */}
                                    <div className="w-16 h-22 -ml-3 mt-2 rounded-xl bg-[#eef2ff] border-2 border-white shadow-lg p-1.5 flex flex-col justify-between">
                                        <div className="w-6 h-1 rounded-full bg-[#94a3b8] mx-auto" />
                                        <div className="rounded bg-[#fbbf24]/25 border border-[#f59e0b]/40 p-1 text-center">
                                            <Sparkles className="w-3.5 h-3.5 text-[#d97706] mx-auto" />
                                            <span className="block text-[8px] font-bold text-[#1e293b] mt-0.5">
                                                UMKM DT
                                            </span>
                                        </div>
                                        <div className="h-2.5 rounded bg-[#f59e0b] text-[7px] font-extrabold text-white flex items-center justify-center">
                                            PESAN
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Block: Highlight Stat / Free Benefit & Orange CTA */}
                            <div className="col-span-12 md:col-span-4 text-center md:text-right space-y-1.5">
                                <div className="text-[11px] text-[#bfdbfe] font-medium">
                                    Kurasi &amp; Promosi Katalog Alumni
                                </div>
                                <div className="text-2xl sm:text-3xl font-black text-[#ffb703] leading-none">
                                    100% GRATIS
                                    <span className="text-xs font-semibold text-white ml-1">
                                        / Alumni DT
                                    </span>
                                </div>
                                <div className="text-[11px] text-white/90">
                                    {Number(stats.products) > 0
                                        ? `${stats.products} Produk & Jasa Siap Dipesan`
                                        : 'Fasilitasi Modal + Mentoring + Etalase'}
                                </div>
                                <div className="pt-1">
                                    <Link
                                        to="/etalase-pasar"
                                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-[#f59e0b] to-[#f97316] hover:from-[#d97706] hover:to-[#ea580c] text-[#17285e] font-extrabold text-xs shadow-md transition-all no-underline"
                                    >
                                        Jelajahi Etalase Sekarang
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3 Service Cards (Bootstrap 3-col Grid) */}
            <div className="bs-row">
                <div className="col-span-12 md:col-span-4">
                    <div className="bs-card h-full flex flex-col">
                        <div className="bs-card-header">
                            <span className="inline-flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-[#0068b0]" />
                                Ruang Modal
                            </span>
                            <span className="bs-badge bs-badge-info">Fasilitasi</span>
                        </div>
                        <div className="bs-card-body flex-1 flex flex-col justify-between gap-4">
                            <p className="text-sm text-[#475569]">
                                Fasilitasi alat kerja, modal produksi, mesin usaha, dan perlengkapan pemasaran sesuai
                                kebutuhan jalur kerja atau usaha alumni.
                            </p>
                            <Link to="/ruang-modal" className="bs-btn bs-btn-primary w-full">
                                Ajukan Bantuan
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="col-span-12 md:col-span-4">
                    <div className="bs-card h-full flex flex-col">
                        <div className="bs-card-header">
                            <span className="inline-flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-[#008a75]" />
                                Ruang Tumbuh
                            </span>
                            <span className="bs-badge bs-badge-success">Mentoring</span>
                        </div>
                        <div className="bs-card-body flex-1 flex flex-col justify-between gap-4">
                            <p className="text-sm text-[#475569]">
                                Ajukan pendampingan, konsultasi karier, legalitas usaha, keuangan, hingga strategi
                                branding bersama mentor berpengalaman.
                            </p>
                            <Link to="/ruang-tumbuh" className="bs-btn bs-btn-primary w-full">
                                Ajukan Pendampingan
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="col-span-12 md:col-span-4">
                    <div className="bs-card h-full flex flex-col">
                        <div className="bs-card-header">
                            <span className="inline-flex items-center gap-2">
                                <Store className="w-4 h-4 text-[#f8a000]" />
                                Ruang Pasar
                            </span>
                            <span className="bs-badge bs-badge-warning">Etalase</span>
                        </div>
                        <div className="bs-card-body flex-1 flex flex-col justify-between gap-4">
                            <p className="text-sm text-[#475569]">
                                Etalase digital produk dan jasa karya alumni SMA Double Track yang telah lolos
                                kurasi dan moderasi pengelola.
                            </p>
                            <Link to="/ruang-pasar" className="bs-btn bs-btn-primary w-full">
                                Daftarkan Produk / Jasa
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section Preview Etalase Alumni (4-Card Centered Layout with Fading Sky-Blue Border) */}
            <section className="py-6 md:py-10">
                <div className="text-center max-w-2xl mx-auto space-y-2.5 mb-8 md:mb-10">
                    <h2 className="text-2xl sm:text-3xl md:text-[36px] font-extrabold leading-[1.2] tracking-tight bg-gradient-to-r from-[#2c3b96] via-[#3f53c8] to-[#546be6] bg-clip-text text-transparent">
                        Etalase Unggulan Alumni
                        <br />
                        SMA Double Track
                    </h2>
                    <p className="text-base sm:text-lg text-[#334155]">
                        Mulai dari{' '}
                        <strong className="font-extrabold text-[#1e293b]">
                            {products.length} Produk &amp; Jasa
                        </strong>{' '}
                        Karya Terbaik Alumni
                    </p>
                </div>

                {loadingProducts ? (
                    <div className="text-center py-8 text-sm text-[#64748b]">
                        Memuat cuplikan etalase...
                    </div>
                ) : featuredProducts.length === 0 ? (
                    <div className="bs-alert bs-alert-info max-w-xl mx-auto">
                        Belum ada produk yang dipublikasikan di etalase.
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            {featuredProducts.map((p, idx) => {
                                const cardStyles = [
                                    {
                                        bg: 'bg-[#84b817]',
                                        shadow: 'shadow-[#84b817]/25',
                                        Icon: Store,
                                    },
                                    {
                                        bg: 'bg-[#f24488]',
                                        shadow: 'shadow-[#f24488]/25',
                                        Icon: Sparkles,
                                    },
                                    {
                                        bg: 'bg-[#fba414]',
                                        shadow: 'shadow-[#fba414]/25',
                                        Icon: ShieldCheck,
                                    },
                                    {
                                        bg: 'bg-[#0866ff]',
                                        shadow: 'shadow-[#0866ff]/25',
                                        Icon: Zap,
                                    },
                                ];
                                const { bg, shadow, Icon } = cardStyles[idx % cardStyles.length];

                                return (
                                    <div
                                        key={p.id}
                                        onClick={(e) => {
                                            if (e.target.closest('a, button')) return;
                                            setDetailId(p.id);
                                        }}
                                        className="group cursor-pointer p-[2px] rounded-2xl bg-gradient-to-b from-[#7cc4ff] via-[#b8dfff]/70 to-transparent transition-transform duration-200 hover:-translate-y-1"
                                    >
                                        <div className="bg-white rounded-[14px] px-5 pt-7 pb-6 h-full flex flex-col items-center text-center justify-between shadow-[0_10px_28px_-14px_rgba(32,56,128,0.12)] group-hover:shadow-[0_16px_32px_-12px_rgba(13,92,201,0.2)] transition-shadow">
                                            <div className="flex flex-col items-center">
                                                {/* Centered Vibrant Squircle Icon Badge */}
                                                <div
                                                    className={`w-14 h-14 rounded-2xl ${bg} text-white flex items-center justify-center shadow-md ${shadow} mb-5 group-hover:scale-105 transition-transform`}
                                                >
                                                    <Icon className="w-7 h-7 stroke-[2.2]" />
                                                </div>

                                                {/* Centered Bold Title */}
                                                <h3 className="font-extrabold text-[#172554] text-base sm:text-[17px] leading-snug mb-2">
                                                    {p.nama_produk}
                                                </h3>

                                                {/* Category & Price Tag */}
                                                <div className="text-xs font-semibold text-[#0068b0] mb-2.5">
                                                    {p.kategori} •{' '}
                                                    <span className="font-extrabold text-[#008a75]">
                                                        {p.harga || 'Hubungi Penjual'}
                                                    </span>
                                                </div>

                                                {/* Centered Description */}
                                                <p className="text-xs sm:text-[13px] text-[#334155] leading-relaxed line-clamp-4">
                                                    {p.deskripsi}
                                                </p>
                                            </div>

                                            {/* Subtle Alumni Info & Order Link */}
                                            <div className="w-full pt-4 mt-5 border-t border-[#f1f5f9] space-y-2">
                                                <div className="text-[11px] text-[#64748b] truncate">
                                                    <strong className="text-[#1e293b]">
                                                        {p.nama_alumni}
                                                    </strong>
                                                    {p.sekolah ? ` • ${p.sekolah}` : ''}
                                                </div>
                                                <a
                                                    href={safeOrderUrl(p.kontak_link)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center justify-center gap-1 text-xs font-bold text-[#203880] hover:text-[#0866ff] no-underline"
                                                >
                                                    Hubungi / Pesan
                                                    <ExternalLink className="w-3 h-3" />
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-8 text-center">
                            <Link
                                to="/etalase-pasar"
                                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-white border-2 border-[#7cc4ff] text-[#203880] font-bold text-sm hover:bg-[#eef6ff] transition-colors no-underline shadow-2xs"
                            >
                                Lihat Semua Etalase ({products.length} Produk &amp; Jasa)
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </>
                )}
            </section>

            {/* Section Testimoni Alumni — Auto-Running Slider tanpa Card Tegas */}
            <section
                className="py-6 px-2"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                <div className="text-center max-w-2xl mx-auto space-y-1.5 mb-6">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#eef4ff] text-[#203880] text-xs font-bold">
                        <Sparkles className="w-3.5 h-3.5 text-[#f8a000]" />
                        Kisah Sukses Alumni
                    </span>
                    <h2 className="text-lg sm:text-xl font-bold text-[#203880]">
                        Testimoni Penerima Manfaat Ruang Modal &amp; Ruang Tumbuh
                    </h2>
                    <p className="text-xs sm:text-sm text-[#64748b]">
                        Dampak nyata fasilitasi alat kerja, modal usaha, dan pendampingan mentor SMA Double Track.
                    </p>
                </div>

                <div className="relative max-w-4xl mx-auto overflow-hidden">
                    {/* Sliding Track */}
                    <div
                        className="flex transition-transform duration-700 ease-in-out"
                        style={{ transform: `translateX(-${activeSlide * 100}%)` }}
                    >
                        {testimonials.map((item) => (
                            <div key={item.id} className="w-full shrink-0 px-4 sm:px-10 py-2">
                                <div className="text-center space-y-4">
                                    <div className="flex items-center justify-center gap-2 flex-wrap">
                                        <span className={`bs-badge ${item.badgeClass}`}>
                                            {item.program}
                                        </span>
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#fff4db] text-[#9a5b00] text-xs font-bold">
                                            <Award className="w-3.5 h-3.5 text-[#f8a000]" />
                                            {item.capaian}
                                        </span>
                                    </div>

                                    <div className="relative max-w-2xl mx-auto">
                                        <Quote className="w-8 h-8 text-[#0068b0]/15 mx-auto mb-2" />
                                        <p className="text-sm sm:text-base text-[#1e293b] italic leading-relaxed font-medium">
                                            &ldquo;{item.kutipan}&rdquo;
                                        </p>
                                    </div>

                                    <div className="pt-2 flex flex-col items-center justify-center gap-1">
                                        <div className="w-11 h-11 rounded-full bg-[#203880] text-[#ffc010] font-bold text-sm flex items-center justify-center shadow-xs">
                                            {item.nama
                                                .split(' ')
                                                .slice(0, 2)
                                                .map((n) => n[0])
                                                .join('')}
                                        </div>
                                        <div className="font-bold text-sm text-[#203880] mt-1">
                                            {item.nama}
                                        </div>
                                        <div className="text-xs text-[#64748b]">
                                            {item.sekolah} (Lulusan {item.angkatan}) •{' '}
                                            <span className="text-[#0068b0] font-semibold">
                                                {item.usaha} ({item.kompetensi})
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Prev / Next Controls & Dots Indicator */}
                    <div className="flex items-center justify-center gap-3 mt-5">
                        <button
                            type="button"
                            onClick={() =>
                                setActiveSlide(
                                    (prev) =>
                                        (prev - 1 + testimonials.length) %
                                        testimonials.length
                                )
                            }
                            className="p-1.5 rounded-full text-[#203880] hover:bg-[#eef4ff] transition-colors cursor-pointer"
                            aria-label="Testimoni Sebelumnya"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>

                        <div className="flex items-center gap-1.5">
                            {testimonials.map((item, idx) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setActiveSlide(idx)}
                                    aria-label={`Slide ${idx + 1}`}
                                    className={`h-2 rounded-full transition-all cursor-pointer ${
                                        activeSlide === idx
                                            ? 'w-7 bg-[#203880]'
                                            : 'w-2 bg-[#cbd5e1] hover:bg-[#94a3b8]'
                                    }`}
                                />
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                setActiveSlide((prev) => (prev + 1) % testimonials.length)
                            }
                            className="p-1.5 rounded-full text-[#203880] hover:bg-[#eef4ff] transition-colors cursor-pointer"
                            aria-label="Testimoni Berikutnya"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </section>

            {detailItem && (
                <PasarProductDetailModal
                    item={detailItem}
                    allItems={products}
                    onClose={() => setDetailId(null)}
                    onSelectOther={(other) => setDetailId(other.id)}
                    isAdmin={false}
                />
            )}
        </div>
    );
}
