import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ExternalLink, PlusCircle, Search, Store } from 'lucide-react';
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
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-[#203880] via-[#0068b0] to-[#1098e0] text-white p-6 md:p-8 shadow-sm border-b-4 border-[#f8a000]">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="max-w-2xl space-y-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f8a000] text-[#17285e] text-xs font-bold tracking-wide">
                            <Store className="w-3.5 h-3.5" />
                            Katalog Etalase Alumni
                        </span>
                        <h1 className="text-2xl md:text-3xl font-bold leading-tight">
                            Daftar Produk &amp; Jasa Ruang Pasar
                        </h1>
                        <p className="text-sm md:text-base text-[#e6f2ff]">
                            Jelajahi berbagai produk kreatif, kuliner, fashion, dan layanan jasa unggulan karya alumni
                            SMA Double Track yang telah lolos kurasi pengelola.
                        </p>
                    </div>
                    <Link
                        to="/ruang-pasar"
                        className="bs-btn bg-[#f8a000] text-[#17285e] font-bold hover:bg-[#ffc010] shrink-0 self-start md:self-center shadow-sm"
                    >
                        <PlusCircle className="w-4 h-4" />
                        Daftarkan Produk / Jasa
                    </Link>
                </div>
            </div>

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
