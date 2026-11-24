import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowRight, Briefcase, ExternalLink, Search, Store, TrendingUp } from 'lucide-react';
import {
    fetchPublicMasterOptions,
    fetchPublicPasar,
    fetchPublicStats,
} from '../../store/slices/publicSlice';
import { getCategoryThumbnail, getProductThumbnail, safeOrderUrl } from '../../utils/format';

export default function HomePage() {
    const dispatch = useDispatch();
    const { stats, masterOptions, products, loadingProducts } = useSelector((state) => state.publicData);
    const [kategori, setKategori] = useState('Semua');
    const [search, setSearch] = useState('');
    const kategoriOptions = ['Semua', ...(masterOptions?.kategori_pasar || [])];

    useEffect(() => {
        dispatch(fetchPublicStats());
        dispatch(fetchPublicMasterOptions());
    }, [dispatch]);

    useEffect(() => {
        const params = {};
        if (kategori !== 'Semua') params.kategori = kategori;
        if (search.trim()) params.search = search.trim();
        dispatch(fetchPublicPasar(params));
    }, [dispatch, kategori, search]);

    return (
        <div className="space-y-6">
            {/* Double Track Signature Hero */}
            <div className="rounded-md bg-gradient-to-r from-[#203880] via-[#0068b0] to-[#1098e0] text-white p-6 md:p-8 shadow-sm border-b-4 border-[#f8a000]">
                <div className="bs-row items-center">
                    <div className="col-span-12 lg:col-span-8 space-y-3">
                        <span className="inline-block px-3 py-1 rounded-full bg-[#f8a000] text-[#17285e] text-xs font-bold tracking-wide shadow-2xs">
                            Program Ekosistem Alumni SMA Double Track Mandiri
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
                                to="/ruang-pasar"
                                className="bs-btn bg-white/15 text-white border-white/30 hover:bg-white/25"
                            >
                                Jelajahi Ruang Pasar
                            </Link>
                        </div>
                    </div>

                    <div className="col-span-12 lg:col-span-4">
                        <div className="grid grid-cols-2 gap-3 bg-[#17285e]/45 border border-white/20 rounded-md p-4">
                            <div>
                                <div className="text-2xl font-bold text-[#ffc010]">{stats.products}</div>
                                <div className="text-xs text-[#e6f2ff]">Produk Tayang</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">{stats.modal}</div>
                                <div className="text-xs text-[#e6f2ff]">Pengajuan Modal</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">{stats.tumbuh}</div>
                                <div className="text-xs text-[#e6f2ff]">Sesi Mentoring</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-[#ffc010]">{stats.monitoring}</div>
                                <div className="text-xs text-[#e6f2ff]">Catatan Pantau</div>
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

            {/* Etalase Alumni Section */}
            <div className="bs-card">
                <div className="bs-card-header flex-col sm:flex-row sm:items-center">
                    <div>
                        <h2 className="text-base font-bold text-[#203880]">Etalase Alumni SMA Double Track</h2>
                        <p className="text-xs font-normal text-[#6c757d]">
                            Produk dan jasa alumni yang telah lolos moderasi pengelola.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <div className="relative">
                            <Search className="w-4 h-4 text-[#6c757d] absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari produk / alumni..."
                                className="bs-form-control pl-9 sm:w-56"
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
                        <div className="text-center py-8 text-sm text-[#6c757d]">Memuat etalase produk...</div>
                    ) : products.length === 0 ? (
                        <div className="bs-alert bs-alert-info">
                            Belum ada produk yang dipublikasikan untuk filter ini.
                        </div>
                    ) : (
                        <div className="bs-row">
                            {products.map((p) => (
                                <div key={p.id} className="col-span-12 md:col-span-6 lg:col-span-4">
                                    <div className="group border border-[#dee2e6] rounded-md overflow-hidden h-full flex flex-col justify-between bg-[#fcfcfd] hover:border-[#0068b0] hover:shadow-sm transition-all">
                                        <div>
                                            <div className="relative h-44 w-full bg-[#e9ecef] border-b border-[#dee2e6] overflow-hidden">
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
                                                    <span className="text-[11px] font-mono text-[#6c757d]">{p.kode}</span>
                                                </div>
                                                <h3 className="font-semibold text-[#203880] text-base leading-snug">
                                                    {p.nama_produk}
                                                </h3>
                                                <p className="text-xs text-[#495057] leading-relaxed">{p.deskripsi}</p>
                                            </div>
                                        </div>

                                        <div className="p-4 pt-3 mt-4 border-t border-[#e9ecef] space-y-2">
                                            <div className="font-bold text-sm text-[#198754]">
                                                {p.harga || 'Hubungi penjual'}
                                            </div>
                                            <div className="text-xs text-[#6c757d]">
                                                Alumni: <strong className="text-[#212529]">{p.nama_alumni}</strong>
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
        </div>
    );
}
