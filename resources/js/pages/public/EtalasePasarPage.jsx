import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Check, ExternalLink, PlusCircle, Search, Star, Store } from 'lucide-react';
import {
    fetchPublicMasterOptions,
    fetchPublicPasar,
} from '../../store/slices/publicSlice';
import PasarProductDetailModal from '../../components/PasarProductDetailModal';
import {
    getCategoryThumbnail,
    getProductThumbnail,
    safeOrderUrl,
} from '../../utils/format';

export default function EtalasePasarPage() {
    const dispatch = useDispatch();
    const { masterOptions, products, loadingProducts } = useSelector((state) => state.publicData);
    const [kategori, setKategori] = useState('Semua');
    const [search, setSearch] = useState('');
    const [detailId, setDetailId] = useState(null);

    const kategoriOptions = useMemo(
        () => ['Semua', ...(masterOptions?.kategori_pasar || [])],
        [masterOptions]
    );

    useEffect(() => {
        dispatch(fetchPublicMasterOptions());
    }, [dispatch]);

    useEffect(() => {
        const params = {};
        if (kategori !== 'Semua') params.kategori = kategori;
        if (search.trim()) params.search = search.trim();
        dispatch(fetchPublicPasar(params));
    }, [dispatch, kategori, search]);

    const detailItem = useMemo(
        () => products.find((item) => item.id === detailId) || null,
        [products, detailId]
    );

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
                    <div className="grid grid-cols-12 items-center gap-6">
                        <div className="col-span-12 lg:col-span-8 space-y-3">
                            <p className="text-xs sm:text-sm font-medium text-white/95 tracking-wide">
                                Katalog Digital Terkurasi{' '}
                                <span className="text-[#ffb703] font-bold">Ruang Pasar Alumni</span>
                            </p>
                            <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight tracking-tight text-white">
                                Daftar Produk &amp; Jasa Unggulan Alumni
                            </h1>
                            <p className="text-xs sm:text-sm text-[#dbeafe] leading-relaxed max-w-2xl">
                                Jelajahi berbagai produk kreatif, kuliner, fashion, dan layanan jasa unggulan karya
                                alumni <strong className="text-white">SMA Double Track</strong> yang telah lolos kurasi
                                pengelola.
                            </p>
                            <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1">
                                {[
                                    'Produk & Jasa Terkurasi',
                                    'Pesan Langsung ke Alumni',
                                    '100% Tanpa Komisi',
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
                        </div>

                        <div className="col-span-12 lg:col-span-4 flex lg:justify-end">
                            <div className="w-full sm:w-auto min-w-[260px] bg-[#1a2563]/90 backdrop-blur-md border border-white/30 rounded-xl p-4 shadow-xl space-y-3">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <div className="text-[11px] text-[#cbd5e1] font-medium">
                                            Total Katalog Aktif
                                        </div>
                                        <div className="text-2xl font-extrabold text-white leading-tight">
                                            {products.length}{' '}
                                            <span className="text-xs font-semibold text-[#34d399]">
                                                Produk Tayang
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-0.5 text-[#fbbf24]">
                                        {[...Array(5)].map((_, idx) => (
                                            <Star
                                                key={idx}
                                                className="w-3.5 h-3.5 fill-[#fbbf24] text-[#fbbf24]"
                                            />
                                        ))}
                                    </div>
                                </div>

                                <Link
                                    to="/ruang-pasar"
                                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#f26722] to-[#f9841a] hover:from-[#e05815] hover:to-[#eb770e] text-white font-bold text-xs sm:text-sm shadow-md transition-all no-underline"
                                >
                                    <PlusCircle className="w-4 h-4" />
                                    Daftarkan Produk / Jasa
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Filter & Product Grid Card */}
            <div className="bs-card">
                <div className="bs-card-header flex-col sm:flex-row sm:items-center">
                    <div>
                        <h2 className="text-base font-bold text-[#203880]">
                            Katalog Produk &amp; Jasa Tayang ({products.length})
                        </h2>
                        <p className="text-xs font-normal text-[#64748b]">
                            Klik kartu produk untuk melihat detail lengkap, atau klik tombol Hubungi / Pesan.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <div className="relative">
                            <Search className="w-4 h-4 text-[#64748b] absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari produk, alumni, sekolah..."
                                className="bs-form-control pl-9 sm:w-60"
                            />
                        </div>
                        <select
                            className="bs-form-select sm:w-44"
                            value={kategori}
                            onChange={(e) => setKategori(e.target.value)}
                        >
                            {kategoriOptions.map((opt) => (
                                <option key={opt} value={opt}>
                                    {opt}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="bs-card-body">
                    {loadingProducts ? (
                        <div className="text-center py-8 text-sm text-[#64748b]">
                            Memuat daftar produk Ruang Pasar...
                        </div>
                    ) : products.length === 0 ? (
                        <div className="bs-alert bs-alert-info">
                            Belum ada produk atau jasa yang ditemukan untuk filter ini.
                        </div>
                    ) : (
                        <div className="bs-row">
                            {products.map((p) => (
                                <div key={p.id} className="col-span-12 md:col-span-6 lg:col-span-4">
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
                                                <div className="text-[11px] font-mono text-[#64748b]">{p.kode}</div>
                                                <h3 className="font-semibold text-[#203880] text-base leading-snug">
                                                    {p.nama_produk}
                                                </h3>
                                                <p className="text-xs text-[#475569] leading-relaxed">{p.deskripsi}</p>
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
                    )}
                </div>
            </div>

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
