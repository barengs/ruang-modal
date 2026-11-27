import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CheckCircle2, Eye, FileSpreadsheet, Plus, Printer, Trash2, X } from 'lucide-react';
import {
    clearAdminNotice,
    createMonitoringItem,
    deleteMonitoringItem,
    fetchMonitoringList,
} from '../../store/slices/adminSlice';
import { hasPermission } from '../../store/slices/authSlice';
import DataTable from '../../components/DataTable';
import ConfirmModal from '../../components/ConfirmModal';
import CurrencyInput from '../../components/CurrencyInput';
import MonitoringDetailModal from '../../components/MonitoringDetailModal';
import { formatRupiah } from '../../utils/format';
import { exportToExcelFile, exportToPdfReport } from '../../utils/reportExporter';

const INITIAL_FORM = {
    ref_kode: '',
    nama_alumni: '',
    modul: 'Modal',
    tanggal_pantau: new Date().toISOString().slice(0, 10),
    tahap_pantau: 'Bulan 1-2 (Implementasi)',
    pemanfaatan_bantuan: 'Digunakan sesuai tujuan',
    status_produktif: '',
    pendapatan_omzet: '',
    pendapatan_nominal: '',
    petugas: '',
    catatan: '',
};

export default function AdminMonitoringPage() {
    const dispatch = useDispatch();
    const { monitoring, flash } = useSelector((state) => state.admin);
    const { user } = useSelector((state) => state.auth);
    const [detailId, setDetailId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState(INITIAL_FORM);
    const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, item: null });

    const canCreate = hasPermission(user, 'monitoring.create');
    const canDelete = hasPermission(user, 'monitoring.delete');

    useEffect(() => {
        dispatch(fetchMonitoringList());
        return () => dispatch(clearAdminNotice());
    }, [dispatch]);

    const detailItem = useMemo(
        () => monitoring.find((item) => item.id === detailId) || null,
        [monitoring, detailId]
    );

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            ...form,
            pendapatan_nominal: form.pendapatan_nominal ? Number(form.pendapatan_nominal) : undefined,
        };
        const res = await dispatch(createMonitoringItem(payload));
        if (createMonitoringItem.fulfilled.match(res)) {
            setForm(INITIAL_FORM);
            setShowModal(false);
        }
    };

    const handleDelete = (row) => {
        setConfirmDelete({ isOpen: true, item: row });
    };

    const handleConfirmDelete = async () => {
        if (!confirmDelete.item) return;
        if (detailId === confirmDelete.item.id) setDetailId(null);
        await dispatch(deleteMonitoringItem(confirmDelete.item.id));
        setConfirmDelete({ isOpen: false, item: null });
    };

    const handlePrintPdf = () => {
        const totalOmzet = monitoring.reduce((acc, r) => acc + (Number(r.pendapatan_nominal) || 0), 0);

        exportToPdfReport({
            title: 'Laporan Monitoring Alumni — SMA Double Track',
            subtitle: 'Rekapitulasi Pemantauan Produktivitas & Perkembangan Omzet Alumni SMA Double Track',
            filename: `Laporan-Monitoring-Alumni-${new Date().toISOString().slice(0, 10)}`,
            summary: [
                { label: 'Total Catatan Pantau', value: `${monitoring.length} Catatan` },
                { label: 'Total Akumulasi Omzet', value: formatRupiah(totalOmzet) },
            ],
            columns: [
                { header: 'Kode', width: 95, accessor: (r) => r.kode },
                { header: 'Nama Alumni', width: 120, accessor: (r) => r.nama_alumni },
                { header: 'Modul & Ref', width: 110, accessor: (r) => `${r.modul} (${r.ref_kode || '-'})` },
                { header: 'Tgl Pantau', width: 75, accessor: (r) => r.tanggal_pantau },
                { header: 'Status Produktif', width: 120, accessor: (r) => r.status_produktif },
                {
                    header: 'Omzet / Pendapatan',
                    width: 110,
                    accessor: (r) => r.pendapatan_omzet || formatRupiah(r.pendapatan_nominal),
                },
                { header: 'Catatan Lapangan', width: 155, accessor: (r) => r.catatan || '-' },
            ],
            data: monitoring,
        });
    };

    const handleExportExcel = () => {
        exportToExcelFile({
            title: 'LAPORAN MONITORING HASIL PENDAMPINGAN ALUMNI — SMA DOUBLE TRACK',
            sheetName: 'Monitoring',
            filename: `Data-Monitoring-Alumni-${new Date().toISOString().slice(0, 10)}`,
            columns: [
                { header: 'No', width: 45, accessor: (_, i) => i + 1 },
                { header: 'Kode Monitoring', width: 130, accessor: (r) => r.kode },
                { header: 'Tanggal Pantau', width: 110, accessor: (r) => r.tanggal_pantau },
                { header: 'Nama Alumni', width: 140, accessor: (r) => r.nama_alumni },
                { header: 'Modul', width: 85, accessor: (r) => r.modul },
                { header: 'Kode Referensi', width: 130, accessor: (r) => r.ref_kode || '-' },
                { header: 'Status Produktif', width: 150, accessor: (r) => r.status_produktif },
                { header: 'Pendapatan / Omzet (Teks)', width: 150, accessor: (r) => r.pendapatan_omzet || '-' },
                { header: 'Nominal Omzet (Rp)', width: 120, accessor: (r) => Number(r.pendapatan_nominal) || 0 },
                { header: 'Petugas Pemantau', width: 135, accessor: (r) => r.petugas || '-' },
                { header: 'Catatan Evaluasi', width: 240, accessor: (r) => r.catatan || '-' },
            ],
            data: monitoring,
        });
    };

    const columns = useMemo(
        () => [
            {
                accessorKey: 'kode',
                header: 'Kode',
                cell: ({ getValue }) => <code className="text-xs font-semibold text-[#203880]">{getValue()}</code>,
            },
            {
                accessorKey: 'nama_alumni',
                header: 'Alumni & Ref',
                cell: ({ row }) => (
                    <div>
                        <div className="font-semibold">{row.original.nama_alumni}</div>
                        <div className="text-xs text-[#64748b]">Ref: {row.original.ref_kode || '-'}</div>
                    </div>
                ),
            },
            {
                accessorKey: 'modul',
                header: 'Modul',
                cell: ({ getValue }) => <span className="bs-badge bs-badge-info">{getValue()}</span>,
            },
            {
                accessorKey: 'tanggal_pantau',
                header: 'Tahap & Tgl Pantau',
                cell: ({ row, getValue }) => (
                    <div>
                        <div className="text-xs font-semibold text-[#203880]">
                            {row.original.tahap_pantau || 'Monitoring Berkala'}
                        </div>
                        <div className="text-[11px] text-[#64748b]">{getValue()}</div>
                    </div>
                ),
            },
            {
                accessorKey: 'status_produktif',
                header: 'Status & Pemanfaatan Alat',
                cell: ({ row, getValue }) => (
                    <div>
                        <span className="bs-badge bs-badge-success">{getValue()}</span>
                        {row.original.pemanfaatan_bantuan && (
                            <div className="text-[11px] text-[#0068b0] font-medium mt-0.5">
                                Alat: {row.original.pemanfaatan_bantuan}
                            </div>
                        )}
                    </div>
                ),
            },
            {
                accessorKey: 'pendapatan_omzet',
                header: 'Pendapatan / Omzet',
                cell: ({ row }) => (
                    <div>
                        <div className="font-semibold text-[#008a75]">
                            {row.original.pendapatan_omzet ||
                                (row.original.pendapatan_nominal
                                    ? formatRupiah(row.original.pendapatan_nominal)
                                    : '-')}
                        </div>
                        <div className="text-xs text-[#64748b]">Petugas: {row.original.petugas || '-'}</div>
                    </div>
                ),
            },
            {
                accessorKey: 'catatan',
                header: 'Catatan',
                cell: ({ getValue }) => (
                    <div className="text-xs text-[#475569] max-w-[200px] truncate" title={getValue() || ''}>
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
        [canDelete]
    );

    return (
        <div className="space-y-4">
            <div className="bs-card">
                <div className="bs-card-header flex-col sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-base font-bold text-[#203880]">Monitoring Hasil Pendampingan</h1>
                        <p className="text-xs font-normal text-[#64748b]">
                            Klik baris data pada tabel untuk melihat detail lengkap & riwayat pemantauan perkembangan
                            alumni.
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
                        {canCreate && (
                            <button
                                type="button"
                                onClick={() => setShowModal(true)}
                                className="bs-btn bs-btn-sm bs-btn-primary"
                            >
                                <Plus className="w-4 h-4" />
                                Tambah Monitoring
                            </button>
                        )}
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
                        data={monitoring}
                        columns={columns}
                        searchPlaceholder="Cari alumni, kode referensi, petugas..."
                        filterColumn="modul"
                        filterOptions={['Modal', 'Tumbuh', 'Pasar']}
                        onRowClick={(row) => setDetailId(row.id)}
                    />
                </div>
            </div>

            {detailItem && (
                <MonitoringDetailModal
                    item={detailItem}
                    allItems={monitoring}
                    onClose={() => setDetailId(null)}
                    onSelectOther={(other) => setDetailId(other.id)}
                />
            )}

            {showModal && (
                <div className="bs-modal-backdrop">
                    <div className="bs-modal-dialog max-w-2xl">
                        <div className="bs-modal-header">
                            <h3 className="font-bold text-sm text-[#203880]">Tambah Catatan Monitoring</h3>
                            <button type="button" onClick={() => setShowModal(false)}>
                                <X className="w-4 h-4 text-[#64748b]" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="bs-modal-body space-y-3">
                                <div className="bs-row">
                                    <div className="col-span-12 sm:col-span-6">
                                        <label className="bs-form-label">Nama Alumni *</label>
                                        <input
                                            name="nama_alumni"
                                            value={form.nama_alumni}
                                            onChange={handleChange}
                                            required
                                            className="bs-form-control"
                                        />
                                    </div>
                                    <div className="col-span-12 sm:col-span-6">
                                        <label className="bs-form-label">ID Referensi (RM/RT/RP)</label>
                                        <input
                                            name="ref_kode"
                                            value={form.ref_kode}
                                            onChange={handleChange}
                                            placeholder="Contoh: RM-20260712-A1B2C3D4"
                                            className="bs-form-control"
                                        />
                                    </div>
                                    <div className="col-span-12 sm:col-span-6">
                                        <label className="bs-form-label">Modul *</label>
                                        <select
                                            name="modul"
                                            value={form.modul}
                                            onChange={handleChange}
                                            className="bs-form-select"
                                        >
                                            <option value="Modal">Modal</option>
                                            <option value="Tumbuh">Tumbuh</option>
                                            <option value="Pasar">Pasar</option>
                                        </select>
                                    </div>
                                    <div className="col-span-12 sm:col-span-6">
                                        <label className="bs-form-label">Tanggal Pantau *</label>
                                        <input
                                            name="tanggal_pantau"
                                            type="date"
                                            value={form.tanggal_pantau}
                                            onChange={handleChange}
                                            required
                                            className="bs-form-control"
                                        />
                                    </div>
                                    <div className="col-span-12 sm:col-span-6">
                                        <label className="bs-form-label">Tahap Periode Monitoring (6 Bulan)</label>
                                        <select
                                            name="tahap_pantau"
                                            value={form.tahap_pantau}
                                            onChange={handleChange}
                                            className="bs-form-select"
                                        >
                                            <option value="Bulan 1-2 (Implementasi)">
                                                Bulan 1-2 (Implementasi Kerja/Usaha)
                                            </option>
                                            <option value="Bulan 3-4 (Produktivitas & Pemasaran)">
                                                Bulan 3-4 (Peningkatan Produktivitas & Pemasaran)
                                            </option>
                                            <option value="Bulan 5-6 (Evaluasi & Keberlanjutan)">
                                                Bulan 5-6 (Evaluasi Pendapatan & Keberlanjutan)
                                            </option>
                                        </select>
                                    </div>
                                    <div className="col-span-12 sm:col-span-6">
                                        <label className="bs-form-label">Evaluasi Pemanfaatan Alat / Modal</label>
                                        <select
                                            name="pemanfaatan_bantuan"
                                            value={form.pemanfaatan_bantuan}
                                            onChange={handleChange}
                                            className="bs-form-select"
                                        >
                                            <option value="Digunakan sesuai tujuan">
                                                Digunakan sesuai tujuan
                                            </option>
                                            <option value="Digunakan sebagian">Digunakan sebagian</option>
                                            <option value="Belum optimal / kendala teknis">
                                                Belum optimal / kendala teknis
                                            </option>
                                        </select>
                                    </div>
                                    <div className="col-span-12 sm:col-span-6">
                                        <label className="bs-form-label">Status Produktif *</label>
                                        <input
                                            name="status_produktif"
                                            value={form.status_produktif}
                                            onChange={handleChange}
                                            required
                                            placeholder="Bekerja / Usaha aktif / dll"
                                            className="bs-form-control"
                                        />
                                    </div>
                                    <div className="col-span-12 sm:col-span-6">
                                        <label className="bs-form-label">Pendapatan / Omzet per Bulan (Rp)</label>
                                        <CurrencyInput
                                            name="pendapatan_omzet"
                                            value={form.pendapatan_omzet}
                                            onChange={(e) => {
                                                setForm((prev) => ({
                                                    ...prev,
                                                    pendapatan_omzet: e.target.value,
                                                    pendapatan_nominal: e.target.rawDigits ?? prev.pendapatan_nominal,
                                                }));
                                            }}
                                            placeholder="3.500.000"
                                            mode="rupiah"
                                            suffix="/ bulan"
                                        />
                                    </div>
                                    <div className="col-span-12 sm:col-span-6">
                                        <label className="bs-form-label">Nominal Omzet Terhitung (Rp)</label>
                                        <CurrencyInput
                                            name="pendapatan_nominal"
                                            value={form.pendapatan_nominal}
                                            onChange={(e) => {
                                                setForm((prev) => ({
                                                    ...prev,
                                                    pendapatan_nominal: e.target.value,
                                                    pendapatan_omzet: e.target.formatted
                                                        ? `Rp${e.target.formatted} / bulan`
                                                        : '',
                                                }));
                                            }}
                                            placeholder="3.500.000"
                                            mode="numeric"
                                        />
                                    </div>
                                    <div className="col-span-12 sm:col-span-6">
                                        <label className="bs-form-label">Petugas</label>
                                        <input
                                            name="petugas"
                                            value={form.petugas}
                                            onChange={handleChange}
                                            placeholder={user?.name || 'Nama petugas'}
                                            className="bs-form-control"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="bs-form-label">Catatan Monitoring</label>
                                    <textarea
                                        name="catatan"
                                        rows="3"
                                        value={form.catatan}
                                        onChange={handleChange}
                                        className="bs-form-control"
                                    />
                                </div>
                            </div>

                            <div className="bs-modal-footer">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="bs-btn bs-btn-sm bs-btn-outline-secondary"
                                >
                                    Batal
                                </button>
                                <button type="submit" className="bs-btn bs-btn-sm bs-btn-primary">
                                    Simpan Monitoring
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
                title="Hapus Catatan Monitoring"
                message={`Apakah Anda yakin ingin menghapus catatan monitoring ${confirmDelete.item?.kode}?`}
                confirmText="Ya, Hapus"
                variant="danger"
            />
        </div>
    );
}
