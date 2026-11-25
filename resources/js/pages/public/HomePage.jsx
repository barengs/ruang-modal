import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    ArrowRight,
    Award,
    Briefcase,
    ChevronLeft,
    ChevronRight,
    ExternalLink,
    Quote,
    Sparkles,
    Store,
    TrendingUp,
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

    const featuredProducts = useMemo(() => products.slice(0, 3), [products]);
    const detailItem = useMemo(
        () => products.find((item) => item.id === detailId) || null,
        [products, detailId]
    );

    const heroPieData = [
        { label: 'Produk Tayang', value: Number(stats.products) || 0, color: '#ffc010' },
        { label: 'Pengajuan Modal', value: Number(stats.modal) || 0, color: '#38bdf8' },
        { label: 'Sesi Mentoring', value: Number(stats.tumbuh) || 0, color: '#34d399' },
        { label: 'Catatan Pantau', value: Number(stats.monitoring) || 0, color: '#fb7185' },
    ];
    const totalStats = heroPieData.reduce((acc, item) => acc + item.value, 0);

    // Build SVG pie slices
    const pieSlices = (() => {
        if (totalStats <= 0) return [];
        let cumulativeAngle = -Math.PI / 2;
        const cx = 64;
        const cy = 64;
        const r = 56;

        return heroPieData
            .filter((d) => d.value > 0)
            .map((d) => {
                const fraction = d.value / totalStats;
                const angle = fraction * Math.PI * 2;
                const startAngle = cumulativeAngle;
                const endAngle = cumulativeAngle + angle;
                cumulativeAngle = endAngle;

                if (fraction >= 0.9999) {
                    return {
                        ...d,
                        pct: 100,
                        isFullCircle: true,
                        cx,
                        cy,
                        r,
                    };
                }

                const x1 = cx + r * Math.cos(startAngle);
                const y1 = cy + r * Math.sin(startAngle);
                const x2 = cx + r * Math.cos(endAngle);
                const y2 = cy + r * Math.sin(endAngle);
                const largeArc = angle > Math.PI ? 1 : 0;

                const path = [
                    `M ${cx} ${cy}`,
                    `L ${x1.toFixed(2)} ${y1.toFixed(2)}`,
                    `A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`,
                    'Z',
                ].join(' ');

                return {
                    ...d,
                    pct: Math.round(fraction * 100),
                    path,
                };
            });
    })();

    return (
        <div className="space-y-6">
            {/* Double Track Signature Hero (Flat / No Border Radius) */}
            <div className="bg-gradient-to-r from-[#203880] via-[#0068b0] to-[#1098e0] text-white p-6 md:p-8 shadow-sm border-b-4 border-[#f8a000]">
                <div className="bs-row items-center">
                    <div className="col-span-12 lg:col-span-7 space-y-3">
                        <span className="inline-block px-3 py-1 rounded-full bg-[#f8a000] text-[#17285e] text-xs font-bold tracking-wide shadow-2xs">
                            Program Ekosistem Alumni SMA Double Track
                        </span>
                        <h1 className="text-2xl md:text-3xl font-bold leading-tight">
                            Dari Keterampilan Menjadi Penghasilan
                        </h1>
                        <p className="text-sm md:text-base text-[#e6f2ff] max-w-2xl">
                            Platform terpadu alumni SMA Double Track untuk mengakses fasilitasi modal usaha/alat kerja,
                            pendampingan mentoring, serta memasarkan produk dan jasa unggulan alumni.
                        </p>
                        <div className="flex flex-wrap gap-2 pt-2">
                            <Link
                                to="/ruang-modal"
                                className="bs-btn bg-[#f8a000] text-[#17285e] font-semibold hover:bg-[#ffc010]"
                            >
                                Ajukan Ruang Modal
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link
                                to="/etalase-pasar"
                                className="bs-btn bg-white/15 text-white border-white/30 hover:bg-white/25"
                            >
                                Jelajahi Ruang Pasar
                            </Link>
                        </div>
                    </div>

                    <div className="col-span-12 lg:col-span-5">
                        <div className="bg-[#17285e]/45 border border-white/20 p-4 flex flex-col sm:flex-row items-center gap-4">
                            {/* SVG Pie Chart */}
                            <div className="relative shrink-0">
                                <svg
                                    width="128"
                                    height="128"
                                    viewBox="0 0 128 128"
                                    className="drop-shadow-xs"
                                    aria-label="Pie Chart Statistik Ekosistem Alumni"
                                >
                                    {pieSlices.length === 0 ? (
                                        <circle
                                            cx="64"
                                            cy="64"
                                            r="56"
                                            fill="rgba(255,255,255,0.15)"
                                            stroke="rgba(255,255,255,0.3)"
                                            strokeWidth="1.5"
                                        />
                                    ) : (
                                        pieSlices.map((slice) =>
                                            slice.isFullCircle ? (
                                                <circle
                                                    key={slice.label}
                                                    cx={slice.cx}
                                                    cy={slice.cy}
                                                    r={slice.r}
                                                    fill={slice.color}
                                                    stroke="#17285e"
                                                    strokeWidth="1.5"
                                                >
                                                    <title>{`${slice.label}: ${slice.value} (${slice.pct}%)`}</title>
                                                </circle>
                                            ) : (
                                                <path
                                                    key={slice.label}
                                                    d={slice.path}
                                                    fill={slice.color}
                                                    stroke="#17285e"
                                                    strokeWidth="1.5"
                                                    className="hover:opacity-90 transition-opacity cursor-pointer"
                                                >
                                                    <title>{`${slice.label}: ${slice.value} (${slice.pct}%)`}</title>
                                                </path>
                                            )
                                        )
                                    )}
                                </svg>
                            </div>

                            {/* Pie Chart Legend & Breakdown */}
                            <div className="flex-1 w-full space-y-2">
                                <div className="flex items-center justify-between border-b border-white/15 pb-1.5">
                                    <span className="text-xs font-bold uppercase tracking-wider text-[#ffc010]">
                                        Proporsi Data Ekosistem
                                    </span>
                                    <span className="text-xs font-semibold text-[#e6f2ff]">
                                        Total: {totalStats}
                                    </span>
                                </div>
                                <div className="space-y-1.5">
                                    {heroPieData.map((item) => {
                                        const pct =
                                            totalStats > 0
                                                ? Math.round((item.value / totalStats) * 100)
                                                : 0;
                                        return (
                                            <div
                                                key={item.label}
                                                className="flex items-center justify-between text-xs gap-2"
                                            >
                                                <span className="inline-flex items-center gap-2 text-[#e6f2ff]">
                                                    <span
                                                        className="w-2.5 h-2.5 inline-block shrink-0"
                                                        style={{ backgroundColor: item.color }}
                                                    />
                                                    <span>{item.label}</span>
                                                </span>
                                                <span className="font-bold text-white whitespace-nowrap">
                                                    {item.value}{' '}
                                                    <span className="text-[11px] font-normal text-[#bfd9f2]">
                                                        ({pct}%)
                                                    </span>
                                                </span>
                                            </div>
                                        );
                                    })}
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

            {/* Section Preview Etalase Alumni (Cuplikan 3 Produk Unggulan + Link Lihat Semua) */}
            <section className="bs-card">
                <div className="bs-card-header flex-col sm:flex-row sm:items-center">
                    <div>
                        <h2 className="text-base font-bold text-[#203880] flex items-center gap-2">
                            <Store className="w-4 h-4 text-[#f8a000]" />
                            Etalase Unggulan Alumni SMA Double Track
                        </h2>
                        <p className="text-xs font-normal text-[#64748b]">
                            Cuplikan produk dan jasa pilihan karya alumni. Lihat halaman katalog untuk daftar lengkap.
                        </p>
                    </div>
                    <Link
                        to="/etalase-pasar"
                        className="bs-btn bs-btn-sm bs-btn-outline-primary shrink-0"
                    >
                        Lihat Semua Etalase ({products.length})
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>

                <div className="bs-card-body space-y-5">
                    {loadingProducts ? (
                        <div className="text-center py-8 text-sm text-[#64748b]">Memuat cuplikan etalase...</div>
                    ) : featuredProducts.length === 0 ? (
                        <div className="bs-alert bs-alert-info">
                            Belum ada produk yang dipublikasikan di etalase.
                        </div>
                    ) : (
                        <>
                            <div className="bs-row">
                                {featuredProducts.map((p) => (
                                    <div key={p.id} className="col-span-12 md:col-span-4">
                                        <div
                                            onClick={(e) => {
                                                if (e.target.closest('a, button')) return;
                                                setDetailId(p.id);
                                            }}
                                            className="group cursor-pointer border border-[#dbe3f0] rounded-md overflow-hidden h-full flex flex-col justify-between bg-[#fbfcff] hover:border-[#0068b0] hover:shadow-sm transition-all"
                                        >
                                            <div>
                                                <div className="relative h-44 w-full bg-[#eef2f9] border-b border-[#dbe3f0] overflow-hidden">
                                                    <img
                                                        src={getProductThumbnail(p)}
                                                        alt={p.nama_produk}
                                                        loading="lazy"
                                                        onError={(e) => {
                                                            e.currentTarget.onerror = null;
                                                            e.currentTarget.src = getCategoryThumbnail(p.kategori);
                                                        }}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                    <span className="bs-badge bs-badge-info absolute top-2.5 left-2.5 shadow-xs">
                                                        {p.kategori}
                                                    </span>
                                                </div>
                                                <div className="p-4 pb-0 space-y-1.5">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className="text-[11px] font-mono text-[#64748b]">
                                                            {p.kode}
                                                        </span>
                                                    </div>
                                                    <h3 className="font-semibold text-[#203880] text-base leading-snug">
                                                        {p.nama_produk}
                                                    </h3>
                                                    <p className="text-xs text-[#475569] leading-relaxed line-clamp-2">
                                                        {p.deskripsi}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="p-4 pt-3 mt-4 border-t border-[#eef2f9] space-y-2">
                                                <div className="font-bold text-sm text-[#008a75]">
                                                    {p.harga || 'Hubungi penjual'}
                                                </div>
                                                <div className="text-xs text-[#64748b]">
                                                    Alumni: <strong className="text-[#1e293b]">{p.nama_alumni}</strong>
                                                    {p.sekolah ? ` • ${p.sekolah}` : ''}
                                                </div>
                                                <a
                                                    href={safeOrderUrl(p.kontak_link)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="bs-btn bs-btn-sm bs-btn-outline-primary w-full"
                                                >
                                                    Hubungi / Pesan
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-2 border-t border-[#eef2f9] flex flex-col sm:flex-row items-center justify-between gap-3">
                                <span className="text-xs text-[#64748b]">
                                    Menampilkan <strong>{featuredProducts.length}</strong> dari{' '}
                                    <strong>{products.length}</strong> produk &amp; jasa alumni yang telah tayang.
                                </span>
                                <Link
                                    to="/etalase-pasar"
                                    className="bs-btn bs-btn-primary"
                                >
                                    Jelajahi Seluruh Produk &amp; Jasa di Ruang Pasar
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </>
                    )}
                </div>
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
