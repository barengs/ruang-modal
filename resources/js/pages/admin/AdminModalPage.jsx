import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CheckCircle2, Edit3, Eye, FileSpreadsheet, Printer, Trash2, X } from 'lucide-react';
import {
    clearAdminNotice,
    deleteModalItem,
    fetchModalList,
    updateModalItem,
} from '../../store/slices/adminSlice';
import { hasPermission } from '../../store/slices/authSlice';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import ModalApplicationDetailModal from '../../components/ModalApplicationDetailModal';
import { formatDateTime, formatRupiah } from '../../utils/format';
import { exportToExcelFile, exportToPdfReport } from '../../utils/reportExporter';

const STATUS_OPTIONS = ['Menunggu Seleksi', 'Disetujui', 'Perlu Perbaikan', 'Ditolak'];

export default function AdminModalPage() {
    const dispatch = useDispatch();
    const { modal, flash } = useSelector((state) => state.admin);
    const { user } = useSelector((state) => state.auth);
    const [detailId, setDetailId] = useState(null);
    const [selected, setSelected] = useState(null);
    const [status, setStatus] = useState('Disetujui');
    const [catatan, setCatatan] = useState('');

    const canUpdate = hasPermission(user, 'modal.update');
    const canDelete = hasPermission(user, 'modal.delete');

    useEffect(() => {
        dispatch(fetchModalList());
        return () => dispatch(clearAdminNotice());
    }, [dispatch]);

    const detailItem = useMemo(
        () => modal.find((item) => item.id === detailId) || null,
        [modal, detailId]
    );

    const openReview = (row) => {
        setDetailId(null);
        setSelected(row);
        setStatus(row.status_seleksi);
        setCatatan(row.catatan_admin || '');
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!selected) return;
        const targetId = selected.id;
        await dispatch(
            updateModalItem({
                id: targetId,
                payload: { status_seleksi: status, catatan_admin: catatan },
            })
        );
        setSelected(null);
        setDetailId(targetId);
    };

    const handleDelete = async (row) => {
        if (!window.confirm(`Hapus pengajuan ${row.kode} milik ${row.nama}?`)) return;
        if (detailId === row.id) setDetailId(null);
        await dispatch(deleteModalItem(row.id));
    };

    const handlePrintPdf = () => {
        const totalBiaya = modal.reduce((acc, r) => acc + (Number(r.estimasi_biaya) || 0), 0);
        const disetujuiCount = modal.filter((r) => r.status_seleksi === 'Disetujui').length;
        const menungguCount = modal.filter((r) => r.status_seleksi === 'Menunggu Seleksi').length;

        exportToPdfReport({
            title: 'Laporan Pengajuan Ruang Modal — SMA Double Track',
            subtitle: 'Rekapitulasi Pengajuan Fasilitasi Alat Kerja & Modal Usaha Alumni SMA Double Track Mandiri',
            filename: `Laporan-Ruang-Modal-${new Date().toISOString().slice(0, 10)}`,
            summary: [
                { label: 'Total Pengajuan', value: `${modal.length} Pengajuan` },
                { label: 'Disetujui', value: `${disetujuiCount} Pengajuan` },
                { label: 'Menunggu Seleksi', value: `${menungguCount} Pengajuan` },
                { label: 'Total Estimasi Biaya', value: formatRupiah(totalBiaya) },
            ],
            columns: [
                { header: 'Kode', width: 95, accessor: (r) => r.kode },
                {
                    header: 'Alumni & Sekolah',
                    width: 120,
                    accessor: (r) => `${r.nama} (${r.sekolah} - ${r.tahun_lulus})`,
                },
                {
                    header: 'Jalur & Kompetensi',
                    width: 110,
                    accessor: (r) => `${r.jalur} - ${r.kompetensi}`,
                },
                { header: 'Jenis Bantuan', width: 105, accessor: (r) => r.jenis_bantuan },
                {
                    header: 'Rincian Kebutuhan',
                    width: 160,
                    accessor: (r) => r.rincian_kebutuhan,
                },
                {
                    header: 'Estimasi',
                    width: 85,
                    accessor: (r) => formatRupiah(r.estimasi_biaya),
                },
                { header: 'Status', width: 85, accessor: (r) => r.status_seleksi },
            ],
            data: modal,
        });
    };

    const handleExportExcel = () => {
        exportToExcelFile({
            title: 'LAPORAN PENGAJUAN RUANG MODAL — EKOSISTEM ALUMNI SMA DOUBLE TRACK',
            sheetName: 'Ruang Modal',
            filename: `Data-Ruang-Modal-${new Date().toISOString().slice(0, 10)}`,
            columns: [
                { header: 'No', width: 45, accessor: (_, i) => i + 1 },
                { header: 'Kode Pengajuan', width: 130, accessor: (r) => r.kode },
                { header: 'Tanggal Pengajuan', width: 125, accessor: (r) => formatDateTime(r.created_at) },
                { header: 'Nama Alumni', width: 140, accessor: (r) => r.nama },
                { header: 'Email', width: 150, accessor: (r) => r.email },
                { header: 'WhatsApp', width: 110, accessor: (r) => r.whatsapp },
                { header: 'Asal Sekolah', width: 140, accessor: (r) => r.sekolah },
                { header: 'Tahun Lulus', width: 80, accessor: (r) => r.tahun_lulus },
                { header: 'Kompetensi DT', width: 140, accessor: (r) => r.kompetensi },
                { header: 'Jalur', width: 80, accessor: (r) => r.jalur },
                { header: 'Status Aktivitas', width: 120, accessor: (r) => r.status_aktivitas },
                { header: 'Jenis Bantuan', width: 140, accessor: (r) => r.jenis_bantuan },
                { header: 'Estimasi Biaya (Rp)', width: 120, accessor: (r) => Number(r.estimasi_biaya) || 0 },
                { header: 'Rincian Kebutuhan', width: 220, accessor: (r) => r.rincian_kebutuhan },
                { header: 'Rencana Pemanfaatan', width: 220, accessor: (r) => r.rencana_deskripsi },
                { header: 'Status Seleksi', width: 120, accessor: (r) => r.status_seleksi },
                { header: 'Catatan Admin', width: 180, accessor: (r) => r.catatan_admin || '-' },
            ],
            data: modal,
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
                        <div className="text-[11px] text-[#6c757d]">
                            {formatDateTime(row.original.created_at)}
                        </div>
                    </div>
                ),
            },
            {
                accessorKey: 'nama',
                header: 'Alumni & Sekolah',
                cell: ({ row }) => (
                    <div>
                        <div className="font-semibold text-[#212529]">{row.original.nama}</div>
                        <div className="text-xs text-[#6c757d]">
                            {row.original.sekolah} ({row.original.tahun_lulus})
                        </div>
                        <div className="text-xs text-[#6c757d]">{row.original.whatsapp}</div>
                    </div>
                ),
            },
            {
                accessorKey: 'jalur',
                header: 'Jalur & Bantuan',
                cell: ({ row }) => (
                    <div>
                        <span className="bs-badge bs-badge-info mb-1">{row.original.jalur}</span>
                        <div className="text-xs font-medium">{row.original.jenis_bantuan}</div>
                        <div className="text-xs text-[#6c757d]">{row.original.kompetensi}</div>
                    </div>
                ),
            },
            {
                accessorKey: 'estimasi_biaya',
                header: 'Estimasi',
                cell: ({ getValue }) => <span className="font-semibold">{formatRupiah(getValue())}</span>,
            },
            {
                accessorKey: 'status_seleksi',
                header: 'Status',
                cell: ({ getValue }) => <StatusBadge status={getValue()} />,
            },
            {
                accessorKey: 'catatan_admin',
                header: 'Catatan Admin',
                cell: ({ getValue }) => (
                    <div className="text-xs text-[#495057] max-w-[200px] truncate" title={getValue() || ''}>
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
                                Proses
                            </button>
                        )}
                        {canDelete && (
                            <button
                                type="button"
                                onClick={() => handleDelete(row.original)}
                                className="bs-btn bs-btn-sm bs-btn-outline-danger"
                                title="Hapus"
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
                        <h1 className="text-base font-bold text-[#203880]">Manajemen Pengajuan Ruang Modal</h1>
                        <p className="text-xs font-normal text-[#6c757d]">
                            Klik baris data pada tabel untuk melihat detail lengkap & riwayat pengajuan, atau klik{' '}
                            <strong>Proses</strong> untuk memperbarui status seleksi.
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
                        <span className="bs-badge bs-badge-primary">{modal.length} Data</span>
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
                        data={modal}
                        columns={columns}
                        searchPlaceholder="Cari kode, nama alumni, sekolah, kompetensi..."
                        filterColumn="status_seleksi"
                        filterOptions={STATUS_OPTIONS}
                        onRowClick={(row) => setDetailId(row.id)}
                    />
                </div>
            </div>

            {/* Detail & History Modal on Row Click */}
            {detailItem && (
                <ModalApplicationDetailModal
                    item={detailItem}
                    allItems={modal}
                    onClose={() => setDetailId(null)}
                    onSelectOther={(other) => setDetailId(other.id)}
                    onProcess={canUpdate ? openReview : null}
                    isAdmin
                />
            )}

            {/* Bootstrap-style Review Modal */}
            {selected && (
                <div className="bs-modal-backdrop">
                    <div className="bs-modal-dialog">
                        <div className="bs-modal-header">
                            <h3 className="font-bold text-sm text-[#203880]">
                                Proses Seleksi — {selected.kode}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setSelected(null)}
                                className="text-[#6c757d] hover:text-[#212529]"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSave}>
                            <div className="bs-modal-body space-y-3 text-sm">
                                <div className="p-3 bg-[#f8f9fa] rounded border border-[#dee2e6] space-y-1 text-xs">
                                    <div>
                                        <strong>Alumni:</strong> {selected.nama} ({selected.sekolah})
                                    </div>
                                    <div>
                                        <strong>Rincian Kebutuhan:</strong> {selected.rincian_kebutuhan}
                                    </div>
                                    <div>
                                        <strong>Rencana Pemanfaatan:</strong> {selected.rencana_deskripsi}
                                    </div>
                                    <div>
                                        <strong>Estimasi:</strong> {formatRupiah(selected.estimasi_biaya)}
                                    </div>
                                </div>

                                <div>
                                    <label className="bs-form-label">Status Seleksi</label>
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
                                    <label className="bs-form-label">Catatan Admin</label>
                                    <textarea
                                        rows="3"
                                        value={catatan}
                                        onChange={(e) => setCatatan(e.target.value)}
                                        placeholder="Catatan verifikasi atau poin perbaikan..."
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
                                    Simpan Perubahan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
