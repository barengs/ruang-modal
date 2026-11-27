import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CheckCircle2, Edit3, Eye, FileSpreadsheet, Printer, Trash2, X } from 'lucide-react';
import {
    clearAdminNotice,
    deleteTumbuhItem,
    fetchTumbuhList,
    updateTumbuhItem,
} from '../../store/slices/adminSlice';
import { hasPermission } from '../../store/slices/authSlice';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import TumbuhRequestDetailModal from '../../components/TumbuhRequestDetailModal';
import ConfirmModal from '../../components/ConfirmModal';
import { formatDateTime } from '../../utils/format';
import { exportToExcelFile, exportToPdfReport } from '../../utils/reportExporter';

const STATUS_OPTIONS = ['Menunggu', 'Disetujui', 'Perlu Perbaikan', 'Selesai', 'Ditolak'];

export default function AdminTumbuhPage() {
    const dispatch = useDispatch();
    const { tumbuh, flash } = useSelector((state) => state.admin);
    const { user } = useSelector((state) => state.auth);
    const [detailId, setDetailId] = useState(null);
    const [selected, setSelected] = useState(null);
    const [status, setStatus] = useState('Disetujui');
    const [catatan, setCatatan] = useState('');
    const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, item: null });

    const canUpdate = hasPermission(user, 'tumbuh.update');
    const canDelete = hasPermission(user, 'tumbuh.delete');

    useEffect(() => {
        dispatch(fetchTumbuhList());
        return () => dispatch(clearAdminNotice());
    }, [dispatch]);

    const detailItem = useMemo(
        () => tumbuh.find((item) => item.id === detailId) || null,
        [tumbuh, detailId]
    );

    const openReview = (row) => {
        setDetailId(null);
        setSelected(row);
        setStatus(row.status);
        setCatatan(row.catatan_admin || '');
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!selected) return;
        const targetId = selected.id;
        await dispatch(
            updateTumbuhItem({
                id: targetId,
                payload: { status, catatan_admin: catatan },
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
        await dispatch(deleteTumbuhItem(confirmDelete.item.id));
        setConfirmDelete({ isOpen: false, item: null });
    };

    const handlePrintPdf = () => {
        const disetujuiCount = tumbuh.filter((r) => r.status === 'Disetujui').length;
        const selesaiCount = tumbuh.filter((r) => r.status === 'Selesai').length;
        const menungguCount = tumbuh.filter((r) => r.status === 'Menunggu').length;

        exportToPdfReport({
            title: 'Laporan Permintaan Ruang Tumbuh — SMA Double Track',
            subtitle: 'Rekapitulasi Permintaan Pendampingan & Mentoring Alumni SMA Double Track',
            filename: `Laporan-Ruang-Tumbuh-${new Date().toISOString().slice(0, 10)}`,
            summary: [
                { label: 'Total Permintaan', value: `${tumbuh.length} Permintaan` },
                { label: 'Disetujui / Aktif', value: `${disetujuiCount} Permintaan` },
                { label: 'Selesai', value: `${selesaiCount} Permintaan` },
                { label: 'Menunggu', value: `${menungguCount} Permintaan` },
            ],
            columns: [
                { header: 'Kode', width: 95, accessor: (r) => r.kode },
                { header: 'Nama Alumni & Sekolah', width: 130, accessor: (r) => `${r.nama} (${r.sekolah})` },
                { header: 'Kontak WA', width: 85, accessor: (r) => r.whatsapp },
                { header: 'Bidang Minat', width: 110, accessor: (r) => r.bidang_minat },
                { header: 'Topik Pendampingan', width: 165, accessor: (r) => r.topik_pendampingan },
                { header: 'Kebutuhan Jadwal', width: 120, accessor: (r) => r.kebutuhan_jadwal },
                { header: 'Status', width: 75, accessor: (r) => r.status },
            ],
            data: tumbuh,
        });
    };

    const handleExportExcel = () => {
        exportToExcelFile({
            title: 'LAPORAN PERMINTAAN PENDAMPINGAN RUANG TUMBUH — SMA DOUBLE TRACK',
            sheetName: 'Ruang Tumbuh',
            filename: `Data-Ruang-Tumbuh-${new Date().toISOString().slice(0, 10)}`,
            columns: [
                { header: 'No', width: 45, accessor: (_, i) => i + 1 },
                { header: 'Kode Permintaan', width: 130, accessor: (r) => r.kode },
                { header: 'Tanggal Permintaan', width: 125, accessor: (r) => formatDateTime(r.created_at) },
                { header: 'Nama Alumni', width: 140, accessor: (r) => r.nama },
                { header: 'Email', width: 150, accessor: (r) => r.email },
                { header: 'WhatsApp', width: 110, accessor: (r) => r.whatsapp },
                { header: 'Asal Sekolah', width: 140, accessor: (r) => r.sekolah },
                { header: 'Bidang Minat', width: 150, accessor: (r) => r.bidang_minat },
                { header: 'Topik Pendampingan', width: 220, accessor: (r) => r.topik_pendampingan },
                { header: 'Kebutuhan & Jadwal', width: 200, accessor: (r) => r.kebutuhan_jadwal },
                { header: 'Status', width: 110, accessor: (r) => r.status },
                { header: 'Catatan Admin / Mentor', width: 200, accessor: (r) => r.catatan_admin || '-' },
            ],
            data: tumbuh,
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
                accessorKey: 'nama',
                header: 'Alumni',
                cell: ({ row }) => (
                    <div>
                        <div className="font-semibold">{row.original.nama}</div>
                        <div className="text-xs text-[#64748b]">{row.original.sekolah}</div>
                        <div className="text-xs text-[#64748b]">{row.original.whatsapp}</div>
                    </div>
                ),
            },
            {
                accessorKey: 'bidang_minat',
                header: 'Bidang & Topik',
                cell: ({ row }) => (
                    <div className="max-w-xs">
                        <span className="bs-badge bs-badge-info mb-1">{row.original.bidang_minat}</span>
                        <div className="text-xs font-medium text-[#1e293b]">{row.original.topik_pendampingan}</div>
                    </div>
                ),
            },
            {
                accessorKey: 'status',
                header: 'Status',
                cell: ({ getValue }) => <StatusBadge status={getValue()} />,
            },
            {
                accessorKey: 'catatan_admin',
                header: 'Catatan Admin',
                cell: ({ getValue }) => (
                    <div className="text-xs text-[#475569] max-w-[180px] truncate" title={getValue() || ''}>
                        {getValue() || '-'}
                    </div>
                ),
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
                        {canUpdate && (
                            <button
                                type="button"
                                onClick={() => openReview(row.original)}
                                className="bs-btn bs-btn-sm bs-btn-primary"
                            >
                                <Edit3 className="w-3.5 h-3.5" />
                                Kelola
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
        [canUpdate, canDelete]
    );

    return (
        <div className="space-y-4">
            <div className="bs-card">
                <div className="bs-card-header flex-col sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-base font-bold text-[#203880]">Manajemen Ruang Tumbuh</h1>
                        <p className="text-xs font-normal text-[#64748b]">
                            Klik baris data pada tabel untuk melihat detail lengkap & riwayat pendampingan, atau klik{' '}
                            <strong>Kelola</strong> untuk memperbarui status.
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
                        <span className="bs-badge bs-badge-primary">{tumbuh.length} Data</span>
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
                        data={tumbuh}
                        columns={columns}
                        searchPlaceholder="Cari nama alumni, bidang minat, topik..."
                        filterColumn="status"
                        filterOptions={STATUS_OPTIONS}
                        onRowClick={(row) => setDetailId(row.id)}
                    />
                </div>
            </div>

            {detailItem && (
                <TumbuhRequestDetailModal
                    item={detailItem}
                    allItems={tumbuh}
                    onClose={() => setDetailId(null)}
                    onSelectOther={(other) => setDetailId(other.id)}
                    onProcess={canUpdate ? openReview : null}
                    isAdmin
                />
            )}

            {selected && (
                <div className="bs-modal-backdrop">
                    <div className="bs-modal-dialog">
                        <div className="bs-modal-header">
                            <h3 className="font-bold text-sm text-[#203880]">
                                Kelola Pendampingan — {selected.kode}
                            </h3>
                            <button type="button" onClick={() => setSelected(null)}>
                                <X className="w-4 h-4 text-[#64748b]" />
                            </button>
                        </div>

                        <form onSubmit={handleSave}>
                            <div className="bs-modal-body space-y-3 text-sm">
                                <div className="p-3 bg-[#f8fafd] rounded border border-[#dbe3f0] space-y-1 text-xs">
                                    <div>
                                        <strong>Alumni:</strong> {selected.nama} ({selected.sekolah})
                                    </div>
                                    <div>
                                        <strong>Topik:</strong> {selected.topik_pendampingan}
                                    </div>
                                    <div>
                                        <strong>Kebutuhan / Jadwal:</strong> {selected.kebutuhan_jadwal}
                                    </div>
                                </div>

                                <div>
                                    <label className="bs-form-label">Status Pendampingan</label>
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
                                    <label className="bs-form-label">Catatan Admin / Mentor</label>
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
                                <button type="submit" className="bs-btn bs-btn-sm bs-btn-primary">
                                    Simpan
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
                title="Hapus Permintaan Ruang Tumbuh"
                message={`Apakah Anda yakin ingin menghapus permintaan ${confirmDelete.item?.kode}? Data permintaan yang dihapus tidak dapat dipulihkan.`}
                confirmText="Ya, Hapus"
                variant="danger"
            />
        </div>
    );
}
