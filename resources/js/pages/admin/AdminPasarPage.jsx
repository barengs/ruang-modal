import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CheckCircle2, Edit3, Eye, FileSpreadsheet, Printer, Trash2, X } from 'lucide-react';
import {
    clearAdminNotice,
    deletePasarItem,
    fetchPasarList,
    updatePasarItem,
} from '../../store/slices/adminSlice';
import { hasPermission } from '../../store/slices/authSlice';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import PasarProductDetailModal from '../../components/PasarProductDetailModal';
import ConfirmModal from '../../components/ConfirmModal';
import { formatDateTime, getCategoryThumbnail, getProductThumbnail } from '../../utils/format';
import { exportToExcelFile, exportToPdfReport } from '../../utils/reportExporter';

const STATUS_OPTIONS = ['Menunggu Moderasi', 'Tayang', 'Perlu Perbaikan', 'Ditolak'];

export default function AdminPasarPage() {
    const dispatch = useDispatch();
    const { pasar, flash } = useSelector((state) => state.admin);
    const { user } = useSelector((state) => state.auth);
    const [detailId, setDetailId] = useState(null);
    const [selected, setSelected] = useState(null);
    const [status, setStatus] = useState('Tayang');
    const [catatan, setCatatan] = useState('');
    const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, item: null });

    const canModerate = hasPermission(user, 'pasar.moderate');
    const canDelete = hasPermission(user, 'pasar.delete');

    useEffect(() => {
        dispatch(fetchPasarList());
        return () => dispatch(clearAdminNotice());
    }, [dispatch]);

    const detailItem = useMemo(
        () => pasar.find((item) => item.id === detailId) || null,
        [pasar, detailId]
    );

    const openModerate = (row) => {
        setDetailId(null);
        setSelected(row);
        setStatus(row.status_publikasi);
        setCatatan(row.catatan_admin || '');
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!selected) return;
        const targetId = selected.id;
        await dispatch(
            updatePasarItem({
                id: targetId,
                payload: { status_publikasi: status, catatan_admin: catatan },
            })
        );
        setSelected(null);
        setDetailId(targetId);
    };

    const handleDelete = (row) => {
        setConfirmDelete({ isOpen: true, item: row });
    };

    const handleConfirmDelete = async () => {
        if (!confirmDelete.item) return;
        if (detailId === confirmDelete.item.id) setDetailId(null);
        await dispatch(deletePasarItem(confirmDelete.item.id));
        setConfirmDelete({ isOpen: false, item: null });
    };

    const handlePrintPdf = () => {
        const tayangCount = pasar.filter((r) => r.status_publikasi === 'Tayang').length;
        const menungguCount = pasar.filter((r) => r.status_publikasi === 'Menunggu Moderasi').length;

        exportToPdfReport({
            title: 'Laporan Etalase Ruang Pasar — SMA Double Track',
            subtitle: 'Rekapitulasi Produk & Jasa Karya Alumni SMA Double Track',
            filename: `Laporan-Ruang-Pasar-${new Date().toISOString().slice(0, 10)}`,
            summary: [
                { label: 'Total Produk / Jasa', value: `${pasar.length} Produk` },
                { label: 'Tayang di Etalase', value: `${tayangCount} Produk` },
                { label: 'Menunggu Moderasi', value: `${menungguCount} Produk` },
            ],
            columns: [
                { header: 'Kode', width: 95, accessor: (r) => r.kode },
                { header: 'Nama Produk / Jasa', width: 155, accessor: (r) => r.nama_produk },
                { header: 'Kategori', width: 85, accessor: (r) => r.kategori },
                { header: 'Harga', width: 95, accessor: (r) => r.harga || 'Hubungi penjual' },
                {
                    header: 'Alumni & Sekolah',
                    width: 130,
                    accessor: (r) => `${r.nama_alumni} (${r.sekolah || '-'})`,
                },
                { header: 'Deskripsi', width: 145, accessor: (r) => r.deskripsi },
                { header: 'Status', width: 85, accessor: (r) => r.status_publikasi },
            ],
            data: pasar,
        });
    };

    const handleExportExcel = () => {
        exportToExcelFile({
            title: 'LAPORAN PRODUK & JASA RUANG PASAR — RUANG ALUMNI SMA DOUBLE TRACK',
            sheetName: 'Ruang Pasar',
            filename: `Data-Ruang-Pasar-${new Date().toISOString().slice(0, 10)}`,
            columns: [
                { header: 'No', width: 45, accessor: (_, i) => i + 1 },
                { header: 'Kode Produk', width: 130, accessor: (r) => r.kode },
                { header: 'Tanggal Pengajuan', width: 125, accessor: (r) => formatDateTime(r.created_at) },
                { header: 'Nama Produk / Jasa', width: 200, accessor: (r) => r.nama_produk },
                { header: 'Kategori', width: 110, accessor: (r) => r.kategori },
                { header: 'Harga', width: 130, accessor: (r) => r.harga || '-' },
                { header: 'Nama Alumni', width: 140, accessor: (r) => r.nama_alumni },
                { header: 'Asal Sekolah', width: 140, accessor: (r) => r.sekolah },
                { header: 'Email', width: 150, accessor: (r) => r.email },
                { header: 'WhatsApp', width: 110, accessor: (r) => r.whatsapp },
                { header: 'Kontak / Link Order', width: 150, accessor: (r) => r.kontak_link },
                { header: 'Deskripsi Produk', width: 240, accessor: (r) => r.deskripsi },
                { header: 'Status Publikasi', width: 120, accessor: (r) => r.status_publikasi },
                { header: 'Catatan Moderasi Admin', width: 180, accessor: (r) => r.catatan_admin || '-' },
            ],
            data: pasar,
        });
    };

    const columns = useMemo(
        () => [
            {
                accessorKey: 'kode',
                header: 'Kode',
                cell: ({ row, getValue }) => (
                    <div>
                        <code className="text-xs font-semibold text-[#203880]">{getValue()}</code>
                        <div className="text-[11px] text-[#64748b]">
                            {formatDateTime(row.original.created_at)}
                        </div>
                    </div>
                ),
            },
            {
                accessorKey: 'nama_produk',
                header: 'Produk / Jasa',
                cell: ({ row }) => (
                    <div className="flex items-start gap-2.5 max-w-sm">
                        <img
                            src={getProductThumbnail(row.original)}
                            alt={row.original.nama_produk}
                            onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = getCategoryThumbnail(row.original.kategori);
                            }}
                            className="w-14 h-10 rounded object-cover border border-[#dbe3f0] shrink-0 bg-[#eef2f9]"
                        />
                        <div>
                            <div className="font-semibold text-[#203880]">{row.original.nama_produk}</div>
                            <span className="bs-badge bs-badge-info mt-0.5">{row.original.kategori}</span>
                            <div className="text-xs text-[#008a75] font-semibold mt-0.5">
                                {row.original.harga || 'Hubungi penjual'}
                            </div>
                        </div>
                    </div>
                ),
            },
            {
                accessorKey: 'nama_alumni',
                header: 'Alumni',
                cell: ({ row }) => (
                    <div>
                        <div className="font-medium">{row.original.nama_alumni}</div>
                        <div className="text-xs text-[#64748b]">{row.original.sekolah}</div>
                        <div className="text-xs text-[#64748b]">{row.original.kontak_link}</div>
                    </div>
                ),
            },
            {
                accessorKey: 'status_publikasi',
                header: 'Status Publikasi',
                cell: ({ getValue }) => <StatusBadge status={getValue()} />,
            },
            {
                id: 'actions',
                header: 'Aksi',
                enableSorting: false,
                cell: ({ row }) => (
                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            onClick={() => setDetailId(row.original.id)}
                            className="bs-btn bs-btn-sm bs-btn-outline-primary"
                            title="Lihat Detail & Riwayat"
                        >
                            <Eye className="w-3.5 h-3.5" />
                            Detail
                        </button>
                        {canModerate && (
                            <button
                                type="button"
                                onClick={() => openModerate(row.original)}
                                className="bs-btn bs-btn-sm bs-btn-primary"
                            >
                                <Edit3 className="w-3.5 h-3.5" />
                                Moderasi
                            </button>
                        )}
                        {canDelete && (
                            <button
                                type="button"
                                onClick={() => handleDelete(row.original)}
                                className="bs-btn bs-btn-sm bs-btn-outline-danger"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                ),
            },
        ],
        [canModerate, canDelete]
    );

    return (
        <div className="space-y-4">
            <div className="bs-card">
                <div className="bs-card-header flex-col sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-base font-bold text-[#203880]">Moderasi Ruang Pasar</h1>
                        <p className="text-xs font-normal text-[#64748b]">
                            Klik baris data pada tabel untuk melihat detail lengkap & riwayat produk. Produk dengan
                            status <strong>Tayang</strong> akan otomatis muncul di etalase publik.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <button
                            type="button"
                            onClick={handlePrintPdf}
                            className="bs-btn bs-btn-sm bs-btn-outline-primary"
                            title="Cetak / Unduh Laporan PDF"
                        >
                            <Printer className="w-3.5 h-3.5" />
                            Print Laporan (PDF)
                        </button>
                        <button
                            type="button"
                            onClick={handleExportExcel}
                            className="bs-btn bs-btn-sm bs-btn-success"
                            title="Export Data ke Excel (.xlsx)"
                        >
                            <FileSpreadsheet className="w-3.5 h-3.5" />
                            Export Excel
                        </button>
                        <span className="bs-badge bs-badge-primary">{pasar.length} Produk</span>
                    </div>
                </div>

                <div className="bs-card-body space-y-3">
                    {flash && (
                        <div className="bs-alert bs-alert-success">
                            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                            <span>{flash}</span>
                        </div>
                    )}

                    <DataTable
                        data={pasar}
                        columns={columns}
                        searchPlaceholder="Cari nama produk, kategori, alumni..."
                        filterColumn="status_publikasi"
                        filterOptions={STATUS_OPTIONS}
                        onRowClick={(row) => setDetailId(row.id)}
                    />
                </div>
            </div>

            {detailItem && (
                <PasarProductDetailModal
                    item={detailItem}
                    allItems={pasar}
                    onClose={() => setDetailId(null)}
                    onSelectOther={(other) => setDetailId(other.id)}
                    onProcess={canModerate ? openModerate : null}
                    isAdmin
                />
            )}

            {selected && (
                <div className="bs-modal-backdrop">
                    <div className="bs-modal-dialog">
                        <div className="bs-modal-header">
                            <h3 className="font-bold text-sm text-[#203880]">
                                Moderasi Produk — {selected.kode}
                            </h3>
                            <button type="button" onClick={() => setSelected(null)}>
                                <X className="w-4 h-4 text-[#64748b]" />
                            </button>
                        </div>

                        <form onSubmit={handleSave}>
                            <div className="bs-modal-body space-y-3 text-sm">
                                <div className="p-3 bg-[#f8fafd] rounded border border-[#dbe3f0] space-y-1 text-xs">
                                    <div>
                                        <strong>Produk:</strong> {selected.nama_produk} ({selected.kategori})
                                    </div>
                                    <div>
                                        <strong>Deskripsi:</strong> {selected.deskripsi}
                                    </div>
                                    <div>
                                        <strong>Harga:</strong> {selected.harga || '-'}
                                    </div>
                                    <div>
                                        <strong>Kontak:</strong> {selected.kontak_link}
                                    </div>
                                </div>

                                <div>
                                    <label className="bs-form-label">Status Publikasi</label>
                                    <select
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        className="bs-form-select"
                                    >
                                        {STATUS_OPTIONS.map((opt) => (
                                            <option key={opt} value={opt}>
                                                {opt}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="bs-form-label">Catatan Moderasi</label>
                                    <textarea
                                        rows="3"
                                        value={catatan}
                                        onChange={(e) => setCatatan(e.target.value)}
                                        className="bs-form-control"
                                    />
                                </div>
                            </div>

                            <div className="bs-modal-footer">
                                <button
                                    type="button"
                                    onClick={() => setSelected(null)}
                                    className="bs-btn bs-btn-sm bs-btn-outline-secondary"
                                >
                                    Batal
                                </button>
                                <button type="submit" className="bs-btn bs-btn-sm bs-btn-success">
                                    Simpan Moderasi
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={confirmDelete.isOpen}
                onClose={() => setConfirmDelete({ isOpen: false, item: null })}
                onConfirm={handleConfirmDelete}
                title="Hapus Produk Pasar"
                message={`Apakah Anda yakin ingin menghapus produk "${confirmDelete.item?.nama_produk}"? Data produk yang dihapus tidak dapat dipulihkan.`}
                confirmText="Ya, Hapus"
                variant="danger"
            />
        </div>
    );
}
