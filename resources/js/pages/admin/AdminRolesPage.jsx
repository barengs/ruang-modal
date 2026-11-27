import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    Activity,
    AlertCircle,
    Briefcase,
    CheckCircle2,
    CheckSquare,
    Database,
    GraduationCap,
    LayoutDashboard,
    MessageCircle,
    Plus,
    RotateCcw,
    Save,
    Shield,
    Store,
    Trash2,
    TrendingUp,
    Users,
    X,
} from 'lucide-react';
import {
    clearAdminNotice,
    createRoleItem,
    deleteRoleItem,
    fetchRolesList,
    updateRolePermissionsItem,
} from '../../store/slices/adminSlice';

/**
 * Definisi Matriks Menu (Baris) x Permission (Kolom)
 */
const MENU_MATRIX_ROWS = [
    {
        key: 'dashboard',
        menu: 'Dashboard',
        desc: 'Halaman ringkasan statistik & grafik analitik ruang alumni',
        icon: LayoutDashboard,
        permissions: {
            view: 'dashboard.view',
            create: null,
            update: null,
            delete: null,
            manage: null,
        },
    },
    {
        key: 'modal',
        menu: 'Ruang Modal',
        desc: 'Pengajuan fasilitasi bantuan peralatan kerja & modal usaha alumni',
        icon: Briefcase,
        permissions: {
            view: 'modal.view',
            create: null,
            update: 'modal.update',
            delete: 'modal.delete',
            manage: null,
        },
    },
    {
        key: 'tumbuh',
        menu: 'Ruang Tumbuh',
        desc: 'Permintaan pendampingan, konsultasi karier, dan mentoring usaha',
        icon: TrendingUp,
        permissions: {
            view: 'tumbuh.view',
            create: null,
            update: 'tumbuh.update',
            delete: 'tumbuh.delete',
            manage: null,
        },
    },
    {
        key: 'pasar',
        menu: 'Ruang Pasar',
        desc: 'Moderasi pendaftaran produk & jasa pada etalase digital alumni',
        icon: Store,
        permissions: {
            view: 'pasar.view',
            create: null,
            update: 'pasar.moderate',
            delete: 'pasar.delete',
            manage: null,
        },
    },
    {
        key: 'monitoring',
        menu: 'Monitoring',
        desc: 'Pencatatan hasil pemantauan produktivitas & perkembangan omzet alumni',
        icon: Activity,
        permissions: {
            view: 'monitoring.view',
            create: 'monitoring.create',
            update: null,
            delete: 'monitoring.delete',
            manage: null,
        },
    },
    {
        key: 'chat',
        menu: 'Live Chat',
        desc: 'Layanan tanya jawab dan konsultasi real-time antara alumni/pengguna dengan admin',
        icon: MessageCircle,
        permissions: {
            view: null,
            create: null,
            update: null,
            delete: null,
            manage: 'chat.manage',
        },
    },
    {
        key: 'master',
        menu: 'Master Data',
        desc: 'Pengelolaan pilihan dropdown formulir (Jalur Pengajuan, Bidang Minat, Kategori, dll)',
        icon: Database,
        permissions: {
            view: null,
            create: null,
            update: null,
            delete: null,
            manage: 'master.manage',
        },
    },
    {
        key: 'alumni',
        menu: 'Data Alumni',
        desc: 'Pengelolaan direktori akun alumni binaan, riwayat program bantuan, dan data profil',
        icon: GraduationCap,
        permissions: {
            view: 'alumni.view',
            create: 'alumni.create',
            update: 'alumni.update',
            delete: 'alumni.delete',
            manage: null,
        },
    },
    {
        key: 'users',
        menu: 'Data Pengelola',
        desc: 'Pengelolaan akun pengguna pengelola/staf internal dan penetapan peran (role)',
        icon: Users,
        permissions: {
            view: 'users.view',
            create: 'users.create',
            update: 'users.update',
            delete: 'users.delete',
            manage: null,
        },
    },
    {
        key: 'roles',
        menu: 'Role Management',
        desc: 'Pengaturan matriks hak akses antara menu aplikasi dan permission',
        icon: Shield,
        permissions: {
            view: null,
            create: null,
            update: null,
            delete: null,
            manage: 'roles.manage',
        },
    },
];

const PERMISSION_COLUMNS = [
    { key: 'view', label: 'Lihat Menu (View)', sub: 'Akses baca & tabel' },
    { key: 'create', label: 'Tambah (Create)', sub: 'Input data baru' },
    { key: 'update', label: 'Proses / Moderasi (Update)', sub: 'Ubah status & verifikasi' },
    { key: 'delete', label: 'Hapus (Delete)', sub: 'Hapus data' },
    { key: 'manage', label: 'Kelola Penuh (Manage)', sub: 'Akses penuh modul' },
];

export default function AdminRolesPage() {
    const dispatch = useDispatch();
    const { roles, allPermissions, flash, error } = useSelector((state) => state.admin);
    const [activeRoleId, setActiveRoleId] = useState(null);
    const [draftPerms, setDraftPerms] = useState([]);
    const [saving, setSaving] = useState(false);

    // State modal Tambah Role
    const [showNewRoleModal, setShowNewRoleModal] = useState(false);
    const [newRoleName, setNewRoleName] = useState('');
    const [copyFromRoleId, setCopyFromRoleId] = useState('');
    const [creatingRole, setCreatingRole] = useState(false);

    useEffect(() => {
        dispatch(fetchRolesList());
        return () => dispatch(clearAdminNotice());
    }, [dispatch]);

    useEffect(() => {
        if (roles.length > 0 && !activeRoleId) {
            setActiveRoleId(roles[0].id);
            setDraftPerms(roles[0].permissions || []);
        }
    }, [roles, activeRoleId]);

    const activeRole = useMemo(
        () => roles.find((r) => r.id === activeRoleId) || null,
        [roles, activeRoleId]
    );

    const selectRole = (role) => {
        setActiveRoleId(role.id);
        setDraftPerms(role.permissions || []);
    };

    const isDirty = useMemo(() => {
        if (!activeRole) return false;
        const orig = [...(activeRole.permissions || [])].sort().join(',');
        const curr = [...draftPerms].sort().join(',');
        return orig !== curr;
    }, [activeRole, draftPerms]);

    const togglePermission = (permName) => {
        if (!permName) return;
        setDraftPerms((prev) =>
            prev.includes(permName) ? prev.filter((p) => p !== permName) : [...prev, permName]
        );
    };

    const getRowPermissions = (row) => Object.values(row.permissions).filter(Boolean);

    const isRowAllChecked = (row) => {
        const rowPerms = getRowPermissions(row);
        return rowPerms.length > 0 && rowPerms.every((p) => draftPerms.includes(p));
    };

    const toggleRowAll = (row) => {
        const rowPerms = getRowPermissions(row);
        if (isRowAllChecked(row)) {
            setDraftPerms((prev) => prev.filter((p) => !rowPerms.includes(p)));
        } else {
            setDraftPerms((prev) => Array.from(new Set([...prev, ...rowPerms])));
        }
    };

    const getColumnPermissions = (colKey) =>
        MENU_MATRIX_ROWS.map((r) => r.permissions[colKey]).filter(Boolean);

    const isColumnAllChecked = (colKey) => {
        const colPerms = getColumnPermissions(colKey);
        return colPerms.length > 0 && colPerms.every((p) => draftPerms.includes(p));
    };

    const toggleColumnAll = (colKey) => {
        const colPerms = getColumnPermissions(colKey);
        if (isColumnAllChecked(colKey)) {
            setDraftPerms((prev) => prev.filter((p) => !colPerms.includes(p)));
        } else {
            setDraftPerms((prev) => Array.from(new Set([...prev, ...colPerms])));
        }
    };

    const selectAllMatrix = () => {
        const allMatrixPerms = MENU_MATRIX_ROWS.flatMap((r) => getRowPermissions(r));
        const combined = Array.from(new Set([...allPermissions, ...allMatrixPerms]));
        setDraftPerms(combined);
    };

    const resetDraft = () => {
        if (activeRole) {
            setDraftPerms(activeRole.permissions || []);
        }
    };

    const handleSaveMatrix = async () => {
        if (!activeRole) return;
        setSaving(true);
        const res = await dispatch(
            updateRolePermissionsItem({
                id: activeRole.id,
                permissions: draftPerms,
            })
        );
        setSaving(false);
        if (updateRolePermissionsItem.fulfilled.match(res)) {
            toast.success(res.payload?.message || `Hak akses role "${activeRole.name}" berhasil disimpan.`);
        } else {
            toast.error(res.payload || 'Gagal menyimpan permission role.');
        }
    };

    const handleCreateRole = async (e) => {
        e.preventDefault();
        if (!newRoleName.trim()) return;
        setCreatingRole(true);

        const templateRole = roles.find((r) => String(r.id) === String(copyFromRoleId));
        const initialPerms = templateRole ? templateRole.permissions || [] : [];

        const res = await dispatch(
            createRoleItem({
                name: newRoleName.trim(),
                permissions: initialPerms,
            })
        );

        setCreatingRole(false);
        if (createRoleItem.fulfilled.match(res)) {
            toast.success(res.payload?.message || 'Role baru berhasil ditambahkan.');
            const created = res.payload.data;
            setNewRoleName('');
            setCopyFromRoleId('');
            setShowNewRoleModal(false);
            setActiveRoleId(created.id);
            setDraftPerms(created.permissions || []);
        } else {
            toast.error(res.payload || 'Gagal menambahkan role baru.');
        }
    };

    const handleDeleteRole = async (role, e) => {
        e.stopPropagation();
        if (role.name === 'super-admin') return;
        if (!window.confirm(`Hapus role "${role.name}"?`)) return;
        const res = await dispatch(deleteRoleItem(role.id));
        if (deleteRoleItem.fulfilled.match(res)) {
            toast.success(res.payload?.message || `Role "${role.name}" berhasil dihapus.`);
            if (activeRoleId === role.id) {
                const remaining = roles.filter((r) => r.id !== role.id);
                if (remaining.length > 0) {
                    setActiveRoleId(remaining[0].id);
                    setDraftPerms(remaining[0].permissions || []);
                }
            }
        } else {
            toast.error(res.payload || 'Gagal menghapus role.');
        }
    };

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

            {/* Side-by-Side Layout: Left Role List (3 cols) + Right Matrix Menu x Permission (9 cols) */}
            <div className="bs-row items-start">
                {/* Sisi Kiri: Daftar Role & Tombol Tambah Role */}
                <div className="col-span-12 lg:col-span-3">
                    <div className="bs-card">
                        <div className="bs-card-header">
                            <span className="inline-flex items-center gap-1.5 text-sm">
                                <Shield className="w-4 h-4 text-[#0068b0]" />
                                Daftar Role
                            </span>
                            <button
                                type="button"
                                onClick={() => setShowNewRoleModal(true)}
                                className="bs-btn bs-btn-sm bs-btn-primary"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Tambah Role
                            </button>
                        </div>

                        <div className="divide-y divide-[#dbe3f0]">
                            {roles.map((role) => {
                                const isSelected = role.id === activeRoleId;
                                const permCount = isSelected
                                    ? draftPerms.length
                                    : role.permissions?.length || 0;

                                return (
                                    <div
                                        key={role.id}
                                        onClick={() => selectRole(role)}
                                        className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors ${
                                            isSelected
                                                ? 'bg-[#203880] text-white border-l-4 border-l-[#f8a000]'
                                                : 'bg-white text-[#1e293b] hover:bg-[#eef4ff]'
                                        }`}
                                    >
                                        <div className="min-w-0">
                                            <div
                                                className={`font-semibold text-sm truncate ${
                                                    isSelected ? 'text-white' : 'text-[#203880]'
                                                }`}
                                            >
                                                {role.name}
                                            </div>
                                            <div
                                                className={`text-[11px] ${
                                                    isSelected ? 'text-[#dbeafe]' : 'text-[#64748b]'
                                                }`}
                                            >
                                                {permCount} dari {allPermissions.length} permission
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1.5 shrink-0">
                                            <span
                                                className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                                    isSelected
                                                        ? 'bg-[#f8a000] text-[#17285e]'
                                                        : 'bg-[#e6f2ff] text-[#00528c]'
                                                }`}
                                            >
                                                {permCount}
                                            </span>
                                            {role.name !== 'super-admin' && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => handleDeleteRole(role, e)}
                                                    title={`Hapus role ${role.name}`}
                                                    className={`p-1 rounded transition-colors ${
                                                        isSelected
                                                            ? 'text-white/80 hover:text-white hover:bg-white/15'
                                                            : 'text-[#64748b] hover:text-[#e11d48] hover:bg-[#ffe4ea]'
                                                    }`}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Sisi Kanan: Matriks Menu & Permission */}
                <div className="col-span-12 lg:col-span-9">
                    <div className="bs-card">
                        <div className="bs-card-header flex-col sm:flex-row sm:items-center">
                            <div>
                                <h1 className="text-base font-bold text-[#203880] flex items-center gap-2">
                                    <span>Matriks Menu & Permission</span>
                                    {activeRole && (
                                        <span className="bs-badge bs-badge-primary uppercase">
                                            {activeRole.name}
                                        </span>
                                    )}
                                </h1>
                                <p className="text-xs font-normal text-[#64748b]">
                                    Atur hak akses antara <strong>Menu Aplikasi</strong> (baris) dan{' '}
                                    <strong>Permission</strong> (kolom) untuk role yang dipilih di samping kiri.
                                </p>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <button
                                    type="button"
                                    onClick={selectAllMatrix}
                                    className="bs-btn bs-btn-sm bs-btn-outline-primary"
                                >
                                    <CheckSquare className="w-3.5 h-3.5" />
                                    Centang Semua
                                </button>
                                <button
                                    type="button"
                                    onClick={resetDraft}
                                    disabled={!isDirty}
                                    className="bs-btn bs-btn-sm bs-btn-outline-secondary"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    Reset
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSaveMatrix}
                                    disabled={saving || !activeRole}
                                    className="bs-btn bs-btn-sm bs-btn-primary"
                                >
                                    <Save className="w-3.5 h-3.5" />
                                    {saving ? 'Menyimpan...' : 'Simpan Matriks'}
                                </button>
                            </div>
                        </div>

                        <div className="bs-card-body space-y-3">
                            {/* Active Role Info Banner */}
                            {activeRole && (
                                <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 rounded bg-[#f8fafd] border border-[#dbe3f0] text-xs">
                                    <div>
                                        Mengatur matriks permission untuk role:{' '}
                                        <strong className="text-[#203880] uppercase">{activeRole.name}</strong> (
                                        <span className="font-semibold text-[#0068b0]">{draftPerms.length}</span>{' '}
                                        dari {allPermissions.length} permission aktif)
                                    </div>
                                    {isDirty && (
                                        <span className="bs-badge bs-badge-warning">
                                            Ada perubahan belum disimpan
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Matrix Table: Menu (Rows) x Permission Actions (Columns) */}
                            <div className="bs-table-responsive">
                                <table className="bs-table">
                                    <thead>
                                        <tr>
                                            <th className="min-w-[210px]">Menu / Modul Aplikasi</th>
                                            {PERMISSION_COLUMNS.map((col) => (
                                                <th key={col.key} className="text-center min-w-[125px]">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <label className="inline-flex items-center gap-1.5 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={isColumnAllChecked(col.key)}
                                                                onChange={() => toggleColumnAll(col.key)}
                                                                className="w-3.5 h-3.5 accent-[#203880] cursor-pointer"
                                                            />
                                                            <span>{col.label}</span>
                                                        </label>
                                                        <span className="text-[10px] font-normal text-[#64748b]">
                                                            {col.sub}
                                                        </span>
                                                    </div>
                                                </th>
                                            ))}
                                            <th className="text-center min-w-[100px]">Semua Akses Menu</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {MENU_MATRIX_ROWS.map((row) => {
                                            const Icon = row.icon;
                                            const allRowChecked = isRowAllChecked(row);
                                            return (
                                                <tr key={row.key}>
                                                    <td>
                                                        <div className="flex items-start gap-2.5">
                                                            <div className="w-8 h-8 rounded bg-[#e6f2ff] text-[#203880] flex items-center justify-center shrink-0 mt-0.5">
                                                                <Icon className="w-4 h-4" />
                                                            </div>
                                                            <div>
                                                                <div className="font-semibold text-[#203880] text-sm">
                                                                    {row.menu}
                                                                </div>
                                                                <div className="text-[11px] text-[#64748b] leading-snug">
                                                                    {row.desc}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {PERMISSION_COLUMNS.map((col) => {
                                                        const permName = row.permissions[col.key];
                                                        if (!permName) {
                                                            return (
                                                                <td
                                                                    key={col.key}
                                                                    className="text-center align-middle text-[#cbd5e1] bg-[#f8fafd]/50"
                                                                >
                                                                    —
                                                                </td>
                                                            );
                                                        }
                                                        const checked = draftPerms.includes(permName);
                                                        return (
                                                            <td
                                                                key={col.key}
                                                                className="text-center align-middle"
                                                            >
                                                                <label className="inline-flex flex-col items-center gap-1 cursor-pointer select-none py-1 px-2 rounded hover:bg-[#eef4ff]">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={checked}
                                                                        onChange={() =>
                                                                            togglePermission(permName)
                                                                        }
                                                                        className="w-4 h-4 accent-[#203880] cursor-pointer"
                                                                    />
                                                                    <code
                                                                        className={`text-[10px] px-1.5 py-0.5 rounded ${
                                                                            checked
                                                                                ? 'bg-[#e0f7f4] text-[#006e5d] font-semibold'
                                                                                : 'bg-[#f1f5f9] text-[#64748b]'
                                                                        }`}
                                                                    >
                                                                        {permName}
                                                                    </code>
                                                                </label>
                                                            </td>
                                                        );
                                                    })}

                                                    <td className="text-center align-middle bg-[#f8fafd]/60">
                                                        <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs font-medium text-[#203880]">
                                                            <input
                                                                type="checkbox"
                                                                checked={allRowChecked}
                                                                onChange={() => toggleRowAll(row)}
                                                                className="w-4 h-4 accent-[#008a75] cursor-pointer"
                                                            />
                                                            <span>Semua</span>
                                                        </label>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Tambah Role Baru */}
            {showNewRoleModal && (
                <div className="bs-modal-backdrop" onClick={() => setShowNewRoleModal(false)}>
                    <div className="bs-modal-dialog max-w-md" onClick={(e) => e.stopPropagation()}>
                        <div className="bs-modal-header">
                            <h3 className="font-bold text-sm text-[#203880]">Tambah Role Baru</h3>
                            <button
                                type="button"
                                onClick={() => setShowNewRoleModal(false)}
                                className="text-[#64748b] hover:text-[#1e293b]"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateRole}>
                            <div className="bs-modal-body space-y-3">
                                <div>
                                    <label className="bs-form-label">Nama Role *</label>
                                    <input
                                        type="text"
                                        value={newRoleName}
                                        onChange={(e) => setNewRoleName(e.target.value)}
                                        required
                                        placeholder="Contoh: mentor-pendamping atau koordinator"
                                        className="bs-form-control"
                                    />
                                    <div className="bs-form-text">
                                        Spasi akan otomatis diubah menjadi tanda hubung (<em>slug</em>).
                                    </div>
                                </div>

                                <div>
                                    <label className="bs-form-label">Salin Permission Awal Dari (Opsional)</label>
                                    <select
                                        value={copyFromRoleId}
                                        onChange={(e) => setCopyFromRoleId(e.target.value)}
                                        className="bs-form-select"
                                    >
                                        <option value="">-- Mulai dengan permission kosong --</option>
                                        {roles.map((r) => (
                                            <option key={r.id} value={r.id}>
                                                {r.name} ({r.permissions?.length || 0} permission)
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="bs-modal-footer">
                                <button
                                    type="button"
                                    onClick={() => setShowNewRoleModal(false)}
                                    className="bs-btn bs-btn-sm bs-btn-outline-secondary"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={creatingRole}
                                    className="bs-btn bs-btn-sm bs-btn-primary"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    {creatingRole ? 'Menyimpan...' : 'Buat Role'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
