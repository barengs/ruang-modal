import React, { useMemo } from 'react';
import {
    Briefcase,
    Calendar,
    CheckCircle2,
    Clock,
    Edit3,
    ExternalLink,
    FileCheck,
    FileText,
    GraduationCap,
    History,
    Mail,
    Phone,
    ShieldCheck,
    User,
    X,
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import { formatDateTime, formatRupiah } from '../utils/format';
import { exportBastPdf } from '../utils/reportExporter';

export default function ModalApplicationDetailModal({
    item,
    allItems = [],
    onClose,
    onSelectOther = null,
    onProcess = null,
    isAdmin = false,
}) {
    if (!item) return null;

    // Build chronological timeline history (fallback to synthesized entry if histories not loaded)
    const timeline = useMemo(() => {
        if (Array.isArray(item.histories) && item.histories.length > 0) {
            return item.histories;
        }
        const entries = [
            {
                id: 'init',
                status_seleksi: 'Menunggu Seleksi',
                catatan: 'Pengajuan Ruang Modal dikirim oleh pemohon.',
                actor_type: 'pemohon',
                actor_name: item.nama,
                created_at: item.created_at,
            },
        ];
        if (item.status_seleksi !== 'Menunggu Seleksi' || item.catatan_admin) {
            entries.push({
                id: 'review',
                status_seleksi: item.status_seleksi,
                catatan: item.catatan_admin || `Status diperbarui menjadi ${item.status_seleksi}.`,
                actor_type: 'admin',
                actor_name: item.reviewer?.name || 'Admin Pengelola',
                created_at: item.updated_at || item.created_at,
            });
        }
        return entries;
    }, [item]);

    // Find all submissions from the same applicant (matched by email, whatsapp, or exact name)
    const applicantSubmissions = useMemo(() => {
        const normEmail = (item.email || '').trim().toLowerCase();
        const normWa = (item.whatsapp || '').replace(/\D/g, '');
        const normNama = (item.nama || '').trim().toLowerCase();

        return allItems.filter((other) => {
            if (normEmail && (other.email || '').trim().toLowerCase() === normEmail) return true;
            if (normWa && (other.whatsapp || '').replace(/\D/g, '') === normWa) return true;
            if (normNama && (other.nama || '').trim().toLowerCase() === normNama) return true;
            return other.id === item.id;
        });
    }, [item, allItems]);

    return (
        <div className="bs-modal-backdrop" onClick={onClose}>
            <div
                className="bs-modal-dialog max-w-3xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="bs-modal-header">
                    <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="font-bold text-sm sm:text-base text-[#203880]">
                            Detail Pengajuan Ruang Modal
                        </h3>
                        <code className="px-2 py-0.5 rounded bg-[#e7f1ff] text-[#203880] text-xs font-bold border border-[#b6d4fe]">
                            {item.kode}
                        </code>
                        <StatusBadge status={item.status_seleksi} />
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-[#6c757d] hover:text-[#212529] p-1"
                        aria-label="Tutup"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="bs-modal-body space-y-5 text-sm">
                    {/* Meta Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 rounded bg-[#f8f9fa] border border-[#dee2e6] text-xs text-[#6c757d]">
                        <span className="inline-flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-[#0068b0]" />
                            Diajukan: <strong className="text-[#212529]">{formatDateTime(item.created_at)}</strong>
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-[#198754]" />
                            Pembaruan Terakhir:{' '}
                            <strong className="text-[#212529]">
                                {formatDateTime(item.updated_at || item.created_at)}
                            </strong>
                        </span>
                        {item.reviewer?.name && (
                            <span className="inline-flex items-center gap-1.5">
                                <ShieldCheck className="w-3.5 h-3.5 text-[#203880]" />
                                Peninjau: <strong className="text-[#212529]">{item.reviewer.name}</strong>
                            </span>
                        )}
                    </div>

                    {/* Grid: Profil Pemohon & Ringkasan Bantuan */}
                    <div className="bs-row">
                        <div className="col-span-12 md:col-span-6">
                            <div className="border border-[#dee2e6] rounded-md p-3.5 h-full space-y-2.5 bg-white">
                                <div className="font-semibold text-xs uppercase tracking-wider text-[#203880] flex items-center gap-1.5 border-b border-[#e9ecef] pb-2">
                                    <User className="w-3.5 h-3.5 text-[#0068b0]" />
                                    Data Alumni Pemohon
                                </div>
                                <div className="space-y-1.5 text-xs">
                                    <div className="flex justify-between gap-2">
                                        <span className="text-[#6c757d]">Nama Lengkap</span>
                                        <span className="font-semibold text-[#212529] text-right">{item.nama}</span>
                                    </div>
                                    <div className="flex justify-between gap-2">
                                        <span className="text-[#6c757d]">Asal Sekolah</span>
                                        <span className="font-medium text-[#212529] text-right">
                                            {item.sekolah} ({item.tahun_lulus})
                                        </span>
                                    </div>
                                    <div className="flex justify-between gap-2">
                                        <span className="text-[#6c757d]">Kompetensi DT</span>
                                        <span className="font-medium text-[#212529] text-right">
                                            {item.kompetensi}
                                        </span>
                                    </div>
                                    <div className="flex justify-between gap-2">
                                        <span className="text-[#6c757d]">Status Aktivitas</span>
                                        <span className="font-medium text-[#212529] text-right">
                                            {item.status_aktivitas || '-'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between gap-2">
                                        <span className="text-[#6c757d] inline-flex items-center gap-1">
                                            <Mail className="w-3 h-3" /> Email
                                        </span>
                                        <span className="font-medium text-[#212529] text-right">
                                            {item.email || '-'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between gap-2">
                                        <span className="text-[#6c757d] inline-flex items-center gap-1">
                                            <Phone className="w-3 h-3" /> WhatsApp
                                        </span>
                                        <span className="font-medium text-[#212529] text-right">
                                            {item.whatsapp || '-'}
                                        </span>
                                    </div>
                                    {item.guru_pendamping && (
                                        <div className="flex justify-between gap-2">
                                            <span className="text-[#6c757d]">Guru Pendamping</span>
                                            <span className="font-semibold text-[#0068b0] text-right">
                                                {item.guru_pendamping}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center gap-2">
                                        <span className="text-[#6c757d]">Komitmen 6 Bulan</span>
                                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#198754]">
                                            <CheckCircle2 className="w-3.5 h-3.5" /> Bersedia Didampingi
                                        </span>
                                    </div>
                                    {item.dokumen_lampiran && (
                                        <div className="pt-1 border-t border-[#e9ecef] flex justify-between items-center">
                                            <span className="text-[#6c757d]">Lampiran Proposal/RAB</span>
                                            <a
                                                href={item.dokumen_lampiran}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1 text-[#0068b0] font-semibold hover:underline"
                                            >
                                                Lihat Lampiran <ExternalLink className="w-3 h-3" />
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="col-span-12 md:col-span-6">
                            <div className="border border-[#dee2e6] rounded-md p-3.5 h-full space-y-2.5 bg-white">
                                <div className="font-semibold text-xs uppercase tracking-wider text-[#203880] flex items-center gap-1.5 border-b border-[#e9ecef] pb-2">
                                    <Briefcase className="w-3.5 h-3.5 text-[#198754]" />
                                    Informasi Bantuan, Skor & BAST
                                </div>
                                <div className="space-y-1.5 text-xs">
                                    <div className="flex justify-between items-center gap-2">
                                        <span className="text-[#6c757d]">Jalur Pengajuan</span>
                                        <span className="bs-badge bs-badge-info">{item.jalur}</span>
                                    </div>
                                    <div className="flex justify-between gap-2">
                                        <span className="text-[#6c757d]">Jenis Bantuan</span>
                                        <span className="font-semibold text-[#212529] text-right">
                                            {item.jenis_bantuan}
                                        </span>
                                    </div>
                                    <div className="flex justify-between gap-2">
                                        <span className="text-[#6c757d]">Estimasi Pengajuan</span>
                                        <span className="font-bold text-[#198754] text-right">
                                            {formatRupiah(item.estimasi_biaya)}
                                        </span>
                                    </div>
                                    {item.nominal_disetujui != null && (
                                        <div className="flex justify-between gap-2">
                                            <span className="text-[#6c757d]">Nominal Disetujui</span>
                                            <span className="font-bold text-[#203880] text-right">
                                                {formatRupiah(item.nominal_disetujui)}
                                            </span>
                                        </div>
                                    )}
                                    {item.skor_total != null && (
                                        <div className="flex justify-between items-center gap-2">
                                            <span className="text-[#6c757d]">Skor Rubrik Seleksi</span>
                                            <span className="bs-badge bs-badge-success">
                                                {item.skor_total} / 100
                                            </span>
                                        </div>
                                    )}
                                    {item.nomor_bast && (
                                        <div className="flex justify-between gap-2">
                                            <span className="text-[#6c757d]">Nomor BAST</span>
                                            <code className="font-bold text-[#008a75]">
                                                {item.nomor_bast} ({item.tanggal_penyaluran || '-'})
                                            </code>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center gap-2">
                                        <span className="text-[#6c757d]">Status Seleksi</span>
                                        <StatusBadge status={item.status_seleksi} />
                                    </div>
                                    <div className="pt-1 border-t border-[#f1f5f9]">
                                        <div className="text-[#6c757d] mb-1">Catatan Pengelola / Admin:</div>
                                        <div className="p-2 rounded bg-[#f8f9fa] border border-[#e9ecef] text-[#212529] leading-relaxed">
                                            {item.catatan_admin || 'Belum ada catatan evaluasi dari pengelola.'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Rincian Rubrik Penilaian 5 Indikator (jika sudah dinilai) */}
                    {item.skor_total != null && (
                        <div className="border border-[#dee2e6] rounded-md p-3.5 space-y-2.5 bg-white">
                            <div className="flex items-center justify-between border-b border-[#e9ecef] pb-2">
                                <span className="font-semibold text-xs uppercase tracking-wider text-[#203880]">
                                    Hasil Rubrik Penilaian Seleksi (5 Indikator Blueprint)
                                </span>
                                <span className="bs-badge bs-badge-primary">
                                    Nilai Akhir: {item.skor_total} / 100
                                </span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs text-center">
                                <div className="p-2 rounded bg-[#f8fafd] border border-[#dbe3f0]">
                                    <div className="text-[11px] text-[#64748b]">Kompetensi (20%)</div>
                                    <div className="font-bold text-sm text-[#203880]">
                                        {item.skor_kompetensi ?? '-'}
                                    </div>
                                </div>
                                <div className="p-2 rounded bg-[#f8fafd] border border-[#dbe3f0]">
                                    <div className="text-[11px] text-[#64748b]">Rencana (25%)</div>
                                    <div className="font-bold text-sm text-[#203880]">
                                        {item.skor_rencana ?? '-'}
                                    </div>
                                </div>
                                <div className="p-2 rounded bg-[#f8fafd] border border-[#dbe3f0]">
                                    <div className="text-[11px] text-[#64748b]">Ketepatan Alat (25%)</div>
                                    <div className="font-bold text-sm text-[#203880]">
                                        {item.skor_kebutuhan ?? '-'}
                                    </div>
                                </div>
                                <div className="p-2 rounded bg-[#f8fafd] border border-[#dbe3f0]">
                                    <div className="text-[11px] text-[#64748b]">Dampak Ekonomi (20%)</div>
                                    <div className="font-bold text-sm text-[#203880]">
                                        {item.skor_dampak ?? '-'}
                                    </div>
                                </div>
                                <div className="p-2 rounded bg-[#f8fafd] border border-[#dbe3f0]">
                                    <div className="text-[11px] text-[#64748b]">Komitmen (10%)</div>
                                    <div className="font-bold text-sm text-[#203880]">
                                        {item.skor_komitmen ?? '-'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Rincian Kebutuhan & Rencana Pemanfaatan */}
                    <div className="border border-[#dee2e6] rounded-md p-3.5 space-y-3 bg-white">
                        <div className="font-semibold text-xs uppercase tracking-wider text-[#203880] flex items-center gap-1.5 border-b border-[#e9ecef] pb-2">
                            <FileText className="w-3.5 h-3.5 text-[#0068b0]" />
                            Rincian Kebutuhan & Rencana Pemanfaatan
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                            <div className="p-3 rounded bg-[#f8f9fa] border border-[#e9ecef] space-y-1">
                                <div className="font-semibold text-[#203880]">
                                    Rincian Kebutuhan Alat / Modal
                                </div>
                                <p className="text-[#495057] leading-relaxed whitespace-pre-line">
                                    {item.rincian_kebutuhan}
                                </p>
                            </div>
                            <div className="p-3 rounded bg-[#f8f9fa] border border-[#e9ecef] space-y-1">
                                <div className="font-semibold text-[#203880]">
                                    Rencana Pemanfaatan & Target Penghasilan
                                </div>
                                <p className="text-[#495057] leading-relaxed whitespace-pre-line">
                                    {item.rencana_deskripsi}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Timeline Riwayat Status Pengajuan */}
                    <div className="border border-[#dee2e6] rounded-md p-3.5 space-y-3 bg-white">
                        <div className="flex items-center justify-between border-b border-[#e9ecef] pb-2">
                            <span className="font-semibold text-xs uppercase tracking-wider text-[#203880] flex items-center gap-1.5">
                                <History className="w-3.5 h-3.5 text-[#0068b0]" />
                                Riwayat Aktivitas & Status Pengajuan
                            </span>
                            <span className="bs-badge bs-badge-secondary">{timeline.length} Aktivitas</span>
                        </div>

                        <div className="relative pl-5 space-y-3 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#dee2e6]">
                            {timeline.map((log, idx) => (
                                <div
                                    key={log.id || idx}
                                    className="relative p-3 rounded border border-[#e9ecef] bg-[#fcfcfd] text-xs space-y-1"
                                >
                                    <span
                                        className={`absolute -left-[19px] top-3.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                                            log.actor_type === 'admin' ? 'bg-[#198754]' : 'bg-[#0068b0]'
                                        }`}
                                    />
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <StatusBadge status={log.status_seleksi} />
                                            <span className="font-semibold text-[#203880]">
                                                {log.actor_name}
                                            </span>
                                            <span className="px-1.5 py-0.2 rounded bg-[#e9ecef] text-[10px] font-medium text-[#495057]">
                                                {log.actor_type === 'admin' ? 'Pengelola / Admin' : 'Pemohon'}
                                            </span>
                                        </div>
                                        <span className="text-[11px] text-[#6c757d]">
                                            {formatDateTime(log.created_at)}
                                        </span>
                                    </div>
                                    {log.catatan && (
                                        <p className="text-[#495057] leading-relaxed pt-0.5">{log.catatan}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Riwayat Semua Pengajuan milik Pemohon yang Sama */}
                    {applicantSubmissions.length > 0 && (
                        <div className="border border-[#dee2e6] rounded-md p-3.5 space-y-2.5 bg-white">
                            <div className="flex items-center justify-between border-b border-[#e9ecef] pb-2">
                                <span className="font-semibold text-xs uppercase tracking-wider text-[#203880] flex items-center gap-1.5">
                                    <GraduationCap className="w-3.5 h-3.5 text-[#198754]" />
                                    Riwayat Pengajuan oleh {item.nama}
                                </span>
                                <span className="bs-badge bs-badge-info">
                                    {applicantSubmissions.length} Pengajuan
                                </span>
                            </div>

                            <div className="bs-table-responsive">
                                <table className="bs-table text-xs">
                                    <thead>
                                        <tr>
                                            <th>Kode</th>
                                            <th>Tanggal</th>
                                            <th>Jalur & Bantuan</th>
                                            <th>Estimasi</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {applicantSubmissions.map((sub) => {
                                            const isCurrent = sub.id === item.id;
                                            return (
                                                <tr
                                                    key={sub.id}
                                                    onClick={() =>
                                                        !isCurrent && onSelectOther ? onSelectOther(sub) : undefined
                                                    }
                                                    className={
                                                        isCurrent
                                                            ? 'bg-[#e7f1ff]/60 font-medium'
                                                            : onSelectOther
                                                              ? 'cursor-pointer hover:bg-[#f1f5f9]'
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
                                                    <td>{formatDateTime(sub.created_at)}</td>
                                                    <td>
                                                        {sub.jalur} — {sub.jenis_bantuan}
                                                    </td>
                                                    <td className="font-semibold">
                                                        {formatRupiah(sub.estimasi_biaya)}
                                                    </td>
                                                    <td>
                                                        <StatusBadge status={sub.status_seleksi} />
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

                {/* Modal Footer */}
                <div className="bs-modal-footer">
                    {['Disetujui', 'Disalurkan'].includes(item.status_seleksi) && (
                        <button
                            type="button"
                            onClick={() => exportBastPdf(item, formatRupiah)}
                            className="bs-btn bs-btn-sm bs-btn-success"
                        >
                            <FileCheck className="w-3.5 h-3.5" />
                            Cetak BAST (PDF)
                        </button>
                    )}
                    {isAdmin && onProcess && (
                        <button
                            type="button"
                            onClick={() => onProcess(item)}
                            className="bs-btn bs-btn-sm bs-btn-primary"
                        >
                            <Edit3 className="w-3.5 h-3.5" />
                            Proses Seleksi & BAST
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
