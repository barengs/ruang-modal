import React, { useMemo } from 'react';
import {
    Activity,
    Calendar,
    Clock,
    FileText,
    History,
    ShieldCheck,
    User,
    Wallet,
    X,
} from 'lucide-react';
import { formatDateTime, formatRupiah } from '../utils/format';

export default function MonitoringDetailModal({
    item,
    allItems = [],
    onClose,
    onSelectOther = null,
}) {
    if (!item) return null;

    // Riwayat pemantauan milik alumni atau kode referensi yang sama
    const alumniMonitorings = useMemo(() => {
        const normNama = (item.nama_alumni || '').trim().toLowerCase();
        const normRef = (item.ref_kode || '').trim().toLowerCase();

        return allItems.filter((other) => {
            if (normNama && (other.nama_alumni || '').trim().toLowerCase() === normNama) return true;
            if (normRef && (other.ref_kode || '').trim().toLowerCase() === normRef) return true;
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
                            Detail Catatan Monitoring Alumni
                        </h3>
                        <code className="px-2 py-0.5 rounded bg-[#e6f2ff] text-[#203880] text-xs font-bold border border-[#b3d9ff]">
                            {item.kode}
                        </code>
                        <span className="bs-badge bs-badge-info">Modul {item.modul}</span>
                        <span className="bs-badge bs-badge-success">{item.status_produktif}</span>
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
                    {/* Meta Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 rounded bg-[#f8fafd] border border-[#dbe3f0] text-xs text-[#64748b]">
                        <span className="inline-flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-[#0068b0]" />
                            Tanggal Pantau: <strong className="text-[#1e293b]">{item.tanggal_pantau}</strong>
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-[#008a75]" />
                            Dicatat: <strong className="text-[#1e293b]">{formatDateTime(item.created_at)}</strong>
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#203880]" />
                            Petugas:{' '}
                            <strong className="text-[#1e293b]">
                                {item.petugas || item.creator?.name || 'Petugas Monitoring'}
                            </strong>
                        </span>
                    </div>

                    {/* Grid: Data Alumni & Hasil Produktivitas */}
                    <div className="bs-row">
                        <div className="col-span-12 md:col-span-6">
                            <div className="border border-[#dbe3f0] rounded-md p-3.5 h-full space-y-2.5 bg-white">
                                <div className="font-semibold text-xs uppercase tracking-wider text-[#203880] flex items-center gap-1.5 border-b border-[#eef2f9] pb-2">
                                    <User className="w-3.5 h-3.5 text-[#0068b0]" />
                                    Identitas Alumni & Referensi
                                </div>
                                <div className="space-y-2 text-xs">
                                    <div className="flex justify-between gap-2">
                                        <span className="text-[#64748b]">Nama Alumni</span>
                                        <span className="font-semibold text-[#1e293b] text-right">
                                            {item.nama_alumni}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center gap-2">
                                        <span className="text-[#64748b]">Modul Terkait</span>
                                        <span className="bs-badge bs-badge-info">{item.modul}</span>
                                    </div>
                                    <div className="flex justify-between gap-2">
                                        <span className="text-[#64748b]">Kode Referensi (RM/RT/RP)</span>
                                        <code className="font-semibold text-[#203880]">
                                            {item.ref_kode || '-'}
                                        </code>
                                    </div>
                                    <div className="flex justify-between gap-2">
                                        <span className="text-[#64748b]">Petugas Pemantau</span>
                                        <span className="font-medium text-[#1e293b] text-right">
                                            {item.petugas || item.creator?.name || '-'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-span-12 md:col-span-6">
                            <div className="border border-[#dbe3f0] rounded-md p-3.5 h-full space-y-2.5 bg-white">
                                <div className="font-semibold text-xs uppercase tracking-wider text-[#203880] flex items-center gap-1.5 border-b border-[#eef2f9] pb-2">
                                    <Wallet className="w-3.5 h-3.5 text-[#008a75]" />
                                    Capaian Produktivitas & Omzet
                                </div>
                                <div className="space-y-2 text-xs">
                                    <div className="flex justify-between items-center gap-2">
                                        <span className="text-[#64748b]">Status Produktif</span>
                                        <span className="bs-badge bs-badge-success">{item.status_produktif}</span>
                                    </div>
                                    <div className="flex justify-between gap-2">
                                        <span className="text-[#64748b]">Pendapatan / Omzet (Teks)</span>
                                        <span className="font-bold text-[#008a75] text-right">
                                            {item.pendapatan_omzet || '-'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between gap-2">
                                        <span className="text-[#64748b]">Nominal Terhitung</span>
                                        <span className="font-bold text-[#203880] text-right">
                                            {formatRupiah(item.pendapatan_nominal)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Catatan Monitoring */}
                    <div className="border border-[#dbe3f0] rounded-md p-3.5 space-y-2 bg-white">
                        <div className="font-semibold text-xs uppercase tracking-wider text-[#203880] flex items-center gap-1.5 border-b border-[#eef2f9] pb-2">
                            <FileText className="w-3.5 h-3.5 text-[#0068b0]" />
                            Catatan Evaluasi & Perkembangan Lapangan
                        </div>
                        <div className="p-3 rounded bg-[#f8fafd] border border-[#eef2f9] text-xs text-[#1e293b] leading-relaxed whitespace-pre-line">
                            {item.catatan || 'Tidak ada catatan tambahan.'}
                        </div>
                    </div>

                    {/* Riwayat Pemantauan Alumni */}
                    <div className="border border-[#dbe3f0] rounded-md p-3.5 space-y-2.5 bg-white">
                        <div className="flex items-center justify-between border-b border-[#eef2f9] pb-2">
                            <span className="font-semibold text-xs uppercase tracking-wider text-[#203880] flex items-center gap-1.5">
                                <History className="w-3.5 h-3.5 text-[#0068b0]" />
                                Riwayat Pemantauan {item.nama_alumni}
                            </span>
                            <span className="bs-badge bs-badge-info">
                                {alumniMonitorings.length} Catatan Pantau
                            </span>
                        </div>

                        <div className="bs-table-responsive">
                            <table className="bs-table text-xs">
                                <thead>
                                    <tr>
                                        <th>Kode</th>
                                        <th>Tanggal Pantau</th>
                                        <th>Modul & Ref</th>
                                        <th>Status Produktif</th>
                                        <th>Omzet</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {alumniMonitorings.map((sub) => {
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
                                                    <code className="font-semibold text-[#203880]">{sub.kode}</code>
                                                    {isCurrent && (
                                                        <span className="ml-1.5 text-[10px] text-[#0068b0] font-semibold">
                                                            (Sedang dibuka)
                                                        </span>
                                                    )}
                                                </td>
                                                <td>{sub.tanggal_pantau}</td>
                                                <td>
                                                    {sub.modul} ({sub.ref_kode || '-'})
                                                </td>
                                                <td>
                                                    <span className="bs-badge bs-badge-success">
                                                        {sub.status_produktif}
                                                    </span>
                                                </td>
                                                <td className="font-semibold text-[#008a75]">
                                                    {sub.pendapatan_omzet || formatRupiah(sub.pendapatan_nominal)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bs-modal-footer">
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
