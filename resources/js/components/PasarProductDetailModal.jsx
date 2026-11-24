import React, { useMemo } from 'react';
import {
    Calendar,
    Clock,
    Edit3,
    ExternalLink,
    FileText,
    GraduationCap,
    History,
    Mail,
    Phone,
    ShieldCheck,
    Store,
    User,
    X,
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import {
    formatDateTime,
    getCategoryThumbnail,
    getProductThumbnail,
    safeOrderUrl,
} from '../utils/format';

export default function PasarProductDetailModal({
    item,
    allItems = [],
    onClose,
    onSelectOther = null,
    onProcess = null,
    isAdmin = false,
}) {
    if (!item) return null;

    const statusValue = item.status_publikasi || 'Tayang';

    const timeline = useMemo(() => {
        const entries = [
            {
                id: 'init',
                status: 'Menunggu Moderasi',
                catatan: 'Produk / jasa diajukan oleh alumni ke etalase Ruang Pasar.',
                actor_type: 'pemohon',
                actor_name: item.nama_alumni,
                created_at: item.created_at,
            },
        ];
        if (statusValue !== 'Menunggu Moderasi' || item.catatan_admin) {
            entries.push({
                id: 'review',
                status: statusValue,
                catatan: item.catatan_admin || `Status publikasi diperbarui menjadi ${statusValue}.`,
                actor_type: 'admin',
                actor_name: item.reviewer?.name || 'Admin Moderator',
                created_at: item.updated_at || item.created_at,
            });
        }
        return entries;
    }, [item, statusValue]);

    const applicantProducts = useMemo(() => {
        const normEmail = (item.email || '').trim().toLowerCase();
        const normWa = (item.whatsapp || '').replace(/\D/g, '');
        const normNama = (item.nama_alumni || '').trim().toLowerCase();

        return allItems.filter((other) => {
            if (normEmail && (other.email || '').trim().toLowerCase() === normEmail) return true;
            if (normWa && (other.whatsapp || '').replace(/\D/g, '') === normWa) return true;
            if (normNama && (other.nama_alumni || '').trim().toLowerCase() === normNama) return true;
            return other.id === item.id;
        });
    }, [item, allItems]);

    return (
        <div className="bs-modal-backdrop" onClick={onClose}>
            <div className="bs-modal-dialog max-w-3xl" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="bs-modal-header">
                    <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="font-bold text-sm sm:text-base text-[#203880]">
                            Detail Produk & Jasa Ruang Pasar
                        </h3>
                        <code className="px-2 py-0.5 rounded bg-[#e6f2ff] text-[#203880] text-xs font-bold border border-[#b3d9ff]">
                            {item.kode}
                        </code>
                        <StatusBadge status={statusValue} />
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-[#64748b] hover:text-[#1e293b] p-1"
                        aria-label="Tutup"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="bs-modal-body space-y-5 text-sm">
                    {/* Thumbnail Hero & Product Highlights */}
                    <div className="border border-[#dbe3f0] rounded-md overflow-hidden bg-white">
                        <div className="grid grid-cols-1 md:grid-cols-12">
                            <div className="md:col-span-5 bg-[#eef2f9] border-b md:border-b-0 md:border-r border-[#dbe3f0] relative min-h-[180px]">
                                <img
                                    src={getProductThumbnail(item)}
                                    alt={item.nama_produk}
                                    onError={(e) => {
                                        e.currentTarget.onerror = null;
                                        e.currentTarget.src = getCategoryThumbnail(item.kategori);
                                    }}
                                    className="w-full h-full max-h-56 object-cover"
                                />
                                <span className="bs-badge bs-badge-info absolute top-2.5 left-2.5 shadow-2xs">
                                    {item.kategori}
                                </span>
                            </div>
                            <div className="md:col-span-7 p-4 flex flex-col justify-between gap-3">
                                <div className="space-y-1.5">
                                    <h4 className="font-bold text-base text-[#203880] leading-snug">
                                        {item.nama_produk}
                                    </h4>
                                    <div className="text-base font-bold text-[#008a75]">
                                        {item.harga || 'Hubungi penjual'}
                                    </div>
                                    <p className="text-xs text-[#475569] leading-relaxed whitespace-pre-line">
                                        {item.deskripsi}
                                    </p>
                                </div>

                                <div className="pt-2 border-t border-[#eef2f9] flex flex-wrap items-center justify-between gap-2">
                                    <div className="text-xs text-[#64748b]">
                                        Oleh: <strong className="text-[#1e293b]">{item.nama_alumni}</strong>
                                        {item.sekolah ? ` • ${item.sekolah}` : ''}
                                    </div>
                                    {item.kontak_link && (
                                        <a
                                            href={safeOrderUrl(item.kontak_link)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bs-btn bs-btn-sm bs-btn-outline-primary"
                                        >
                                            Hubungi / Pesan
                                            <ExternalLink className="w-3.5 h-3.5" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Meta Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 rounded bg-[#f8fafd] border border-[#dbe3f0] text-xs text-[#64748b]">
                        <span className="inline-flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-[#0068b0]" />
                            Diajukan: <strong className="text-[#1e293b]">{formatDateTime(item.created_at)}</strong>
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-[#008a75]" />
                            Pembaruan Terakhir:{' '}
                            <strong className="text-[#1e293b]">
                                {formatDateTime(item.updated_at || item.created_at)}
                            </strong>
                        </span>
                        {item.reviewer?.name && (
                            <span className="inline-flex items-center gap-1.5">
                                <ShieldCheck className="w-3.5 h-3.5 text-[#203880]" />
                                Moderator: <strong className="text-[#1e293b]">{item.reviewer.name}</strong>
                            </span>
                        )}
                    </div>

                    {/* Grid: Profil Alumni & Status Moderasi */}
                    <div className="bs-row">
                        <div className="col-span-12 md:col-span-6">
                            <div className="border border-[#dbe3f0] rounded-md p-3.5 h-full space-y-2.5 bg-white">
                                <div className="font-semibold text-xs uppercase tracking-wider text-[#203880] flex items-center gap-1.5 border-b border-[#eef2f9] pb-2">
                                    <User className="w-3.5 h-3.5 text-[#0068b0]" />
                                    Informasi Alumni & Kontak
                                </div>
                                <div className="space-y-1.5 text-xs">
                                    <div className="flex justify-between gap-2">
                                        <span className="text-[#64748b]">Nama Alumni</span>
                                        <span className="font-semibold text-[#1e293b] text-right">
                                            {item.nama_alumni}
                                        </span>
                                    </div>
                                    <div className="flex justify-between gap-2">
                                        <span className="text-[#64748b]">Asal Sekolah</span>
                                        <span className="font-medium text-[#1e293b] text-right">
                                            {item.sekolah || '-'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between gap-2">
                                        <span className="text-[#64748b] inline-flex items-center gap-1">
                                            <Mail className="w-3 h-3" /> Email
                                        </span>
                                        <span className="font-medium text-[#1e293b] text-right">
                                            {item.email || '-'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between gap-2">
                                        <span className="text-[#64748b] inline-flex items-center gap-1">
                                            <Phone className="w-3 h-3" /> WhatsApp / Kontak
                                        </span>
                                        <span className="font-medium text-[#1e293b] text-right">
                                            {item.whatsapp || item.kontak_link || '-'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-span-12 md:col-span-6">
                            <div className="border border-[#dbe3f0] rounded-md p-3.5 h-full space-y-2.5 bg-white">
                                <div className="font-semibold text-xs uppercase tracking-wider text-[#203880] flex items-center gap-1.5 border-b border-[#eef2f9] pb-2">
                                    <Store className="w-3.5 h-3.5 text-[#f8a000]" />
                                    Status Moderasi Etalase
                                </div>
                                <div className="space-y-1.5 text-xs">
                                    <div className="flex justify-between items-center gap-2">
                                        <span className="text-[#64748b]">Kategori Produk</span>
                                        <span className="bs-badge bs-badge-info">{item.kategori}</span>
                                    </div>
                                    <div className="flex justify-between items-center gap-2">
                                        <span className="text-[#64748b]">Status Publikasi</span>
                                        <StatusBadge status={statusValue} />
                                    </div>
                                    <div className="pt-1 border-t border-[#f1f5f9]">
                                        <div className="text-[#64748b] mb-1">Catatan Moderasi Admin:</div>
                                        <div className="p-2 rounded bg-[#f8fafd] border border-[#eef2f9] text-[#1e293b] leading-relaxed">
                                            {item.catatan_admin || 'Belum ada catatan moderasi dari pengelola.'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Timeline Riwayat Moderasi */}
                    <div className="border border-[#dbe3f0] rounded-md p-3.5 space-y-3 bg-white">
                        <div className="flex items-center justify-between border-b border-[#eef2f9] pb-2">
                            <span className="font-semibold text-xs uppercase tracking-wider text-[#203880] flex items-center gap-1.5">
                                <History className="w-3.5 h-3.5 text-[#0068b0]" />
                                Riwayat Pengajuan & Moderasi Produk
                            </span>
                            <span className="bs-badge bs-badge-secondary">{timeline.length} Aktivitas</span>
                        </div>

                        <div className="relative pl-5 space-y-3 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#dbe3f0]">
                            {timeline.map((log, idx) => (
                                <div
                                    key={log.id || idx}
                                    className="relative p-3 rounded border border-[#eef2f9] bg-[#fbfcff] text-xs space-y-1"
                                >
                                    <span
                                        className={`absolute -left-[19px] top-3.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                                            log.actor_type === 'admin' ? 'bg-[#008a75]' : 'bg-[#f8a000]'
                                        }`}
                                    />
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <StatusBadge status={log.status} />
                                            <span className="font-semibold text-[#203880]">{log.actor_name}</span>
                                            <span className="px-1.5 py-0.2 rounded bg-[#eef2f9] text-[10px] font-medium text-[#475569]">
                                                {log.actor_type === 'admin' ? 'Admin Moderator' : 'Alumni'}
                                            </span>
                                        </div>
                                        <span className="text-[11px] text-[#64748b]">
                                            {formatDateTime(log.created_at)}
                                        </span>
                                    </div>
                                    {log.catatan && (
                                        <p className="text-[#475569] leading-relaxed pt-0.5">{log.catatan}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Riwayat Produk Lain milik Alumni */}
                    {applicantProducts.length > 0 && (
                        <div className="border border-[#dbe3f0] rounded-md p-3.5 space-y-2.5 bg-white">
                            <div className="flex items-center justify-between border-b border-[#eef2f9] pb-2">
                                <span className="font-semibold text-xs uppercase tracking-wider text-[#203880] flex items-center gap-1.5">
                                    <GraduationCap className="w-3.5 h-3.5 text-[#008a75]" />
                                    Daftar Produk & Jasa oleh {item.nama_alumni}
                                </span>
                                <span className="bs-badge bs-badge-info">{applicantProducts.length} Produk</span>
                            </div>

                            <div className="bs-table-responsive">
                                <table className="bs-table text-xs">
                                    <thead>
                                        <tr>
                                            <th>Kode</th>
                                            <th>Produk / Jasa</th>
                                            <th>Kategori</th>
                                            <th>Harga</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {applicantProducts.map((sub) => {
                                            const isCurrent = sub.id === item.id;
                                            return (
                                                <tr
                                                    key={sub.id}
                                                    onClick={() =>
                                                        !isCurrent && onSelectOther ? onSelectOther(sub) : undefined
                                                    }
                                                    className={
                                                        isCurrent
                                                            ? 'bg-[#e6f2ff]/60 font-medium'
                                                            : onSelectOther
                                                              ? 'cursor-pointer hover:bg-[#eef4ff]'
                                                              : ''
                                                    }
                                                >
                                                    <td>
                                                        <code className="font-semibold text-[#203880]">
                                                            {sub.kode}
                                                        </code>
                                                        {isCurrent && (
                                                            <span className="ml-1.5 text-[10px] text-[#0068b0] font-semibold">
                                                                (Sedang dibuka)
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td>{sub.nama_produk}</td>
                                                    <td>{sub.kategori}</td>
                                                    <td className="font-semibold text-[#008a75]">
                                                        {sub.harga || '-'}
                                                    </td>
                                                    <td>
                                                        <StatusBadge status={sub.status_publikasi || 'Tayang'} />
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bs-modal-footer">
                    {isAdmin && onProcess && (
                        <button
                            type="button"
                            onClick={() => onProcess(item)}
                            className="bs-btn bs-btn-sm bs-btn-primary"
                        >
                            <Edit3 className="w-3.5 h-3.5" />
                            Moderasi Produk
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={onClose}
                        className="bs-btn bs-btn-sm bs-btn-outline-secondary"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
}
