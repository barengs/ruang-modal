import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Activity,
    AlertCircle,
    Award,
    Briefcase,
    CheckCircle2,
    Database,
    Edit3,
    Layers,
    MessageSquare,
    Plus,
    Store,
    Trash2,
    TrendingUp,
    X,
} from 'lucide-react';
import {
    clearAdminNotice,
    createMasterOptionItem,
    deleteMasterOptionItem,
    fetchMasterOptionsList,
    updateMasterOptionItem,
} from '../../store/slices/adminSlice';
import DataTable from '../../components/DataTable';
import ConfirmModal from '../../components/ConfirmModal';

export const MASTER_GROUPS = [
    {
        key: 'jalur_pengajuan',
        title: 'Jalur Pengajuan',
        module: 'Form Ruang Modal',
        desc: 'Pilihan jalur pengajuan fasilitasi (contoh: Kerja, Usaha).',
        icon: Briefcase,
    },
    {
        key: 'jenis_bantuan',
        title: 'Jenis Bantuan',
        module: 'Form Ruang Modal',
        desc: 'Pilihan jenis bantuan modal/peralatan pada pengajuan Ruang Modal.',
        icon: Layers,
    },
    {
        key: 'status_aktivitas',
        title: 'Status Aktivitas Alumni',
        module: 'Form Ruang Modal',
        desc: 'Pilihan kondisi aktivitas kerja/usaha alumni saat mengajukan bantuan.',
        icon: Activity,
    },
    {
        key: 'kompetensi_dt',
        title: 'Kompetensi Double Track',
        module: 'Form Ruang Modal',
        desc: 'Pilihan bidang keterampilan vokasional SMA Double Track yang ditempuh alumni.',
        icon: Award,
    },
    {
        key: 'bidang_minat',
        title: 'Bidang Minat Pendampingan',
        module: 'Form Ruang Tumbuh',
        desc: 'Pilihan topik/bidang minat mentoring pada formulir Ruang Tumbuh.',
        icon: TrendingUp,
    },
    {
        key: 'kategori_pasar',
        title: 'Kategori Produk & Jasa',
        module: 'Form Ruang Pasar & Etalase',
        desc: 'Pilihan kategori usaha untuk pendaftaran produk Ruang Pasar dan filter Etalase Alumni.',
        icon: Store,
    },
    {
        key: 'topik_kontak',
        title: 'Topik Pesan Kontak',
        module: 'Form Halaman Kontak',
        desc: 'Pilihan subjek/topik pertanyaan pada formulir Hubungi Kami.',
        icon: MessageSquare,
    },
];

const INITIAL_MODAL_FORM = {
    group_key: 'jalur_pengajuan',
    label: '',
    description: '',
    urutan: 1,
    is_active: true,
};

export default function AdminMasterDataPage() {
    const dispatch = useDispatch();
    const { masterOptions, flash, error } = useSelector((state) => state.admin);
    const [activeGroupKey, setActiveGroupKey] = useState(MASTER_GROUPS[0].key);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [form, setForm] = useState(INITIAL_MODAL_FORM);
    const [saving, setSaving] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, item: null });

    useEffect(() => {
        dispatch(fetchMasterOptionsList());
        return () => dispatch(clearAdminNotice());
    }, [dispatch]);

    const activeGroup = useMemo(
        () => MASTER_GROUPS.find((g) => g.key === activeGroupKey) || MASTER_GROUPS[0],
        [activeGroupKey]
    );

    const groupItems = useMemo(
        () =>
            masterOptions
                .filter((item) => item.group_key === activeGroupKey)
                .sort((a, b) => (a.urutan || 0) - (b.urutan || 0) || a.id - b.id),
        [masterOptions, activeGroupKey]
    );

    const countsByGroup = useMemo(() => {
        const map = {};
        MASTER_GROUPS.forEach((g) => {
            map[g.key] = 0;
        });
        masterOptions.forEach((item) => {
            map[item.group_key] = (map[item.group_key] || 0) + 1;
        });
        return map;
    }, [masterOptions]);

    const openCreateModal = () => {
        setEditingItem(null);
        setForm({
            group_key: activeGroupKey,
            label: '',
            description: '',
            urutan: groupItems.length + 1,
            is_active: true,
        });
        setShowModal(true);
    };

    const openEditModal = (item) => {
        setEditingItem(item);
        setForm({
            group_key: item.group_key,
            label: item.label || '',
            description: item.description || '',
            urutan: item.urutan || 1,
            is_active: Boolean(item.is_active),
        });
        setShowModal(true);
    };

    const handleToggleActive = async (item) => {
        await dispatch(
            updateMasterOptionItem({
                id: item.id,
                payload: {
                    label: item.label,
                    description: item.description,
                    urutan: item.urutan,
                    is_active: !item.is_active,
                },
            })
        );
    };

    const handleDelete = (item) => {
        setConfirmDelete({ isOpen: true, item });
    };

    const handleConfirmDelete = async () => {
        if (!confirmDelete.item) return;
        await dispatch(deleteMasterOptionItem(confirmDelete.item.id));
        setConfirmDelete({ isOpen: false, item: null });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.label.trim()) return;
        setSaving(true);

        const payload = {
            group_key: form.group_key,
            label: form.label.trim(),
            description: form.description.trim() || null,
            urutan: Number(form.urutan) || 1,
            is_active: Boolean(form.is_active),
        };

        if (editingItem) {
            const res = await dispatch(
                updateMasterOptionItem({
                    id: editingItem.id,
                    payload,
                })
            );
            setSaving(false);
            if (updateMasterOptionItem.fulfilled.match(res)) {
                setShowModal(false);
                setEditingItem(null);
            }
        } else {
            const res = await dispatch(createMasterOptionItem(payload));
            setSaving(false);
            if (createMasterOptionItem.fulfilled.match(res)) {
                setShowModal(false);
            }
        }
    };

    const columns = useMemo(
        () => [
            {
                accessorKey: 'urutan',
                header: 'Urutan',
                cell: ({ getValue }) => (
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded bg-[#eef2f9] text-[#203880] font-bold text-xs">
                        {getValue()}
                    </span>
                ),
            },
            {
                accessorKey: 'label',
                header: 'Nama Pilihan (Label)',
                cell: ({ row }) => (
                    <div>
                        <div className="font-semibold text-[#203880]">{row.original.label}</div>
                        <div className="text-xs text-[#64748b]">
                            {row.original.description || 'Tidak ada keterangan tambahan'}
                        </div>
                    </div>
                ),
            },
            {
                accessorKey: 'is_active',
                header: 'Status Tampil',
                cell: ({ row }) => {
                    const active = Boolean(row.original.is_active);
                    return (
                        <button
                            type="button"
                            onClick={() => handleToggleActive(row.original)}
                            className={`bs-badge cursor-pointer ${
                                active ? 'bs-badge-success' : 'bs-badge-secondary'
                            }`}
                            title="Klik untuk mengubah status aktif/nonaktif"
                        >
                            {active ? 'Aktif' : 'Nonaktif'}
                        </button>
                    );
                },
            },
            {
                id: 'actions',
                header: 'Aksi',
                enableSorting: false,
                cell: ({ row }) => (
                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            onClick={() => openEditModal(row.original)}
                            className="bs-btn bs-btn-sm bs-btn-outline-primary"
                        >
                            <Edit3 className="w-3.5 h-3.5" />
                            Edit
                        </button>
                        <button
                            type="button"
                            onClick={() => handleDelete(row.original)}
                            className="bs-btn bs-btn-sm bs-btn-outline-danger"
                            title="Hapus Pilihan"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                ),
            },
        ],
        []
    );

    return (
        <div className="space-y-4">
            {flash && (
                <div className="bs-alert bs-alert-success">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{flash}</span>
                </div>
            )}

            {error && (
                <div className="bs-alert bs-alert-danger">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                </div>
            )}

            <div className="bs-row items-start">
                {/* Sisi Kiri: Daftar Kategori Master Data */}
                <div className="col-span-12 lg:col-span-4">
                    <div className="bs-card">
                        <div className="bs-card-header">
                            <span className="inline-flex items-center gap-1.5 text-sm">
                                <Database className="w-4 h-4 text-[#0068b0]" />
                                Kategori Master Data
                            </span>
                            <span className="bs-badge bs-badge-info">{MASTER_GROUPS.length} Grup</span>
                        </div>

                        <div className="divide-y divide-[#dbe3f0]">
                            {MASTER_GROUPS.map((group) => {
                                const Icon = group.icon;
                                const isSelected = group.key === activeGroupKey;
                                const count = countsByGroup[group.key] || 0;

                                return (
                                    <div
                                        key={group.key}
                                        onClick={() => setActiveGroupKey(group.key)}
                                        className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors ${
                                            isSelected
                                                ? 'bg-[#203880] text-white border-l-4 border-l-[#f8a000]'
                                                : 'bg-white text-[#1e293b] hover:bg-[#eef4ff]'
                                        }`}
                                    >
                                        <div className="flex items-start gap-2.5 min-w-0">
                                            <Icon
                                                className={`w-4 h-4 shrink-0 mt-0.5 ${
                                                    isSelected ? 'text-[#ffc010]' : 'text-[#0068b0]'
                                                }`}
                                            />
                                            <div className="min-w-0">
                                                <div
                                                    className={`font-semibold text-sm truncate ${
                                                        isSelected ? 'text-white' : 'text-[#203880]'
                                                    }`}
                                                >
                                                    {group.title}
                                                </div>
                                                <div
                                                    className={`text-[11px] truncate ${
                                                        isSelected ? 'text-[#dbeafe]' : 'text-[#64748b]'
                                                    }`}
                                                >
                                                    {group.module}
                                                </div>
                                            </div>
                                        </div>

                                        <span
                                            className={`px-2 py-0.5 rounded-full text-xs font-bold shrink-0 ${
                                                isSelected
                                                    ? 'bg-[#f8a000] text-[#17285e]'
                                                    : 'bg-[#e6f2ff] text-[#00528c]'
                                            }`}
                                        >
                                            {count}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Sisi Kanan: Tabel Pilihan Master Data */}
                <div className="col-span-12 lg:col-span-8">
                    <div className="bs-card">
                        <div className="bs-card-header flex-col sm:flex-row sm:items-center">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-base font-bold text-[#203880]">
                                        {activeGroup.title}
                                    </h1>
                                    <span className="bs-badge bs-badge-info">{activeGroup.module}</span>
                                </div>
                                <p className="text-xs font-normal text-[#64748b] mt-0.5">
                                    {activeGroup.desc} Klik baris data untuk mengubah detail pilihan.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={openCreateModal}
                                className="bs-btn bs-btn-sm bs-btn-primary"
                            >
                                <Plus className="w-4 h-4" />
                                Tambah Pilihan
                            </button>
                        </div>

                        <div className="bs-card-body">
                            <DataTable
                                data={groupItems}
                                columns={columns}
                                searchPlaceholder={`Cari pilihan ${activeGroup.title.toLowerCase()}...`}
                                emptyText="Belum ada pilihan master data pada kategori ini."
                                onRowClick={(row) => openEditModal(row)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Tambah / Edit Pilihan Master Data */}
            {showModal && (
                <div className="bs-modal-backdrop" onClick={() => setShowModal(false)}>
                    <div className="bs-modal-dialog max-w-md" onClick={(e) => e.stopPropagation()}>
                        <div className="bs-modal-header">
                            <h3 className="font-bold text-sm text-[#203880]">
                                {editingItem
                                    ? `Edit Pilihan — ${activeGroup.title}`
                                    : `Tambah Pilihan — ${activeGroup.title}`}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="text-[#64748b] hover:text-[#1e293b]"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="bs-modal-body space-y-3">
                                <div>
                                    <label className="bs-form-label">Kategori Master Data</label>
                                    <select
                                        value={form.group_key}
                                        onChange={(e) =>
                                            setForm((prev) => ({ ...prev, group_key: e.target.value }))
                                        }
                                        className="bs-form-select"
                                    >
                                        {MASTER_GROUPS.map((g) => (
                                            <option key={g.key} value={g.key}>
                                                {g.title} ({g.module})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="bs-form-label">Nama Pilihan / Label *</label>
                                    <input
                                        type="text"
                                        value={form.label}
                                        onChange={(e) =>
                                            setForm((prev) => ({ ...prev, label: e.target.value }))
                                        }
                                        required
                                        placeholder="Masukkan teks pilihan yang akan tampil di form..."
                                        className="bs-form-control"
                                    />
                                </div>

                                <div>
                                    <label className="bs-form-label">Keterangan / Deskripsi (Opsional)</label>
                                    <textarea
                                        rows="2"
                                        value={form.description}
                                        onChange={(e) =>
                                            setForm((prev) => ({ ...prev, description: e.target.value }))
                                        }
                                        placeholder="Penjelasan singkat mengenai pilihan ini..."
                                        className="bs-form-control"
                                    />
                                </div>

                                <div className="bs-row">
                                    <div className="col-span-6">
                                        <label className="bs-form-label">Urutan Tampil</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={form.urutan}
                                            onChange={(e) =>
                                                setForm((prev) => ({ ...prev, urutan: e.target.value }))
                                            }
                                            className="bs-form-control"
                                        />
                                    </div>
                                    <div className="col-span-6">
                                        <label className="bs-form-label">Status</label>
                                        <select
                                            value={form.is_active ? '1' : '0'}
                                            onChange={(e) =>
                                                setForm((prev) => ({
                                                    ...prev,
                                                    is_active: e.target.value === '1',
                                                }))
                                            }
                                            className="bs-form-select"
                                        >
                                            <option value="1">Aktif (Tampil di Form)</option>
                                            <option value="0">Nonaktif (Disembunyikan)</option>
                                        </select>
                                    </div>
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
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="bs-btn bs-btn-sm bs-btn-primary"
                                >
                                    {saving ? 'Menyimpan...' : 'Simpan Pilihan'}
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
                title="Hapus Master Data"
                message={`Apakah Anda yakin ingin menghapus pilihan "${confirmDelete.item?.label}"? Pilihan ini tidak akan muncul lagi di opsi formulir.`}
                confirmText="Ya, Hapus"
                variant="danger"
            />
        </div>
    );
}
