import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Calendar,
    CheckCircle2,
    Eye,
    Mail,
    Shield,
    Trash2,
    User,
    UserPlus,
    X,
} from 'lucide-react';
import {
    clearAdminNotice,
    createUserItem,
    deleteUserItem,
    fetchUsersList,
    updateUserRoleItem,
} from '../../store/slices/adminSlice';
import { hasPermission } from '../../store/slices/authSlice';
import DataTable from '../../components/DataTable';
import { formatDateTime } from '../../utils/format';

export default function AdminUsersPage() {
    const dispatch = useDispatch();
    const { users, roles, flash, error } = useSelector((state) => state.admin);
    const { user: currentUser } = useSelector((state) => state.auth);

    const canCreate = hasPermission(currentUser, 'users.create');
    const canUpdate = hasPermission(currentUser, 'users.update');
    const canDelete = hasPermission(currentUser, 'users.delete');

    const [showNewUser, setShowNewUser] = useState(false);
    const [detailId, setDetailId] = useState(null);
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'admin' });

    useEffect(() => {
        dispatch(fetchUsersList());
        return () => dispatch(clearAdminNotice());
    }, [dispatch]);

    const detailUser = useMemo(
        () => users.find((u) => u.id === detailId) || null,
        [users, detailId]
    );

    const roleOptions = useMemo(() => {
        const filtered = roles.map((r) => r.name).filter((name) => name !== 'alumni');
        if (filtered.length > 0) return filtered;
        return ['super-admin', 'admin', 'verifikator', 'petugas-monitoring'];
    }, [roles]);

    const handleCreateUser = async (e) => {
        e.preventDefault();
        const res = await dispatch(createUserItem(newUser));
        if (createUserItem.fulfilled.match(res)) {
            setNewUser({ name: '', email: '', password: '', role: 'admin' });
            setShowNewUser(false);
        }
    };

    const handleRoleChange = async (userId, role) => {
        await dispatch(updateUserRoleItem({ id: userId, role }));
    };

    const handleDeleteUser = async (u) => {
        if (!window.confirm(`Hapus pengguna "${u.name}" (${u.email})?`)) return;
        if (detailId === u.id) setDetailId(null);
        await dispatch(deleteUserItem(u.id));
    };

    const userColumns = useMemo(
        () => [
            {
                accessorKey: 'name',
                header: 'Nama Pengguna',
                cell: ({ row }) => (
                    <div>
                        <div className="font-semibold text-[#203880]">{row.original.name}</div>
                        <div className="text-xs text-[#64748b]">{row.original.email}</div>
                    </div>
                ),
            },
            {
                accessorKey: 'roles',
                header: 'Role Aktif',
                cell: ({ row }) => {
                    const currentRole = row.original.roles?.[0] || '';
                    return (
                        <select
                            className="bs-form-select py-1 text-xs w-48 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            value={currentRole}
                            disabled={!canUpdate}
                            onChange={(e) => handleRoleChange(row.original.id, e.target.value)}
                        >
                            {roleOptions.map((rName) => (
                                <option key={rName} value={rName}>
                                    {rName}
                                </option>
                            ))}
                        </select>
                    );
                },
            },
            {
                id: 'permCount',
                header: 'Hak Akses',
                cell: ({ row }) => (
                    <span className="bs-badge bs-badge-info">
                        {row.original.permissions?.length || 0} permission
                    </span>
                ),
            },
            {
                accessorKey: 'created_at',
                header: 'Terdaftar',
                cell: ({ getValue }) => (
                    <span className="text-xs text-[#64748b]">{formatDateTime(getValue())}</span>
                ),
            },
            {
                id: 'actions',
                header: 'Aksi',
                enableSorting: false,
                cell: ({ row }) => {
                    const isSelf = currentUser?.id === row.original.id;
                    return (
                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                onClick={() => setDetailId(row.original.id)}
                                className="bs-btn bs-btn-sm bs-btn-outline-primary"
                            >
                                <Eye className="w-3.5 h-3.5" />
                                Detail
                            </button>
                            {canDelete && !isSelf && (
                                <button
                                    type="button"
                                    onClick={() => handleDeleteUser(row.original)}
                                    className="bs-btn bs-btn-sm bs-btn-outline-danger"
                                    title="Hapus Pengguna"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    );
                },
            },
        ],
        [roleOptions, currentUser, canUpdate, canDelete]
    );

    return (
        <div className="space-y-4">
            {flash && (
                <div className="bs-alert bs-alert-success">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{flash}</span>
                </div>
            )}

            {error && <div className="bs-alert bs-alert-danger">{error}</div>}

            <div className="bs-card">
                <div className="bs-card-header">
                    <div>
                        <h1 className="text-base font-bold text-[#203880]">Manajemen User Pengelola</h1>
                        <p className="text-xs font-normal text-[#64748b]">
                            Kelola akun pengelola dan penetapan role. Klik baris pengguna untuk melihat rincian hak
                            akses.
                        </p>
                    </div>
                    {canCreate && (
                        <button
                            type="button"
                            onClick={() => setShowNewUser(true)}
                            className="bs-btn bs-btn-sm bs-btn-primary"
                        >
                            <UserPlus className="w-4 h-4" />
                            Tambah Pengguna
                        </button>
                    )}
                </div>
                <div className="bs-card-body">
                    <DataTable
                        data={users}
                        columns={userColumns}
                        searchPlaceholder="Cari nama atau email pengguna..."
                        onRowClick={(row) => setDetailId(row.id)}
                    />
                </div>
            </div>

            {/* Detail User Modal */}
            {detailUser && (
                <div className="bs-modal-backdrop" onClick={() => setDetailId(null)}>
                    <div className="bs-modal-dialog max-w-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="bs-modal-header">
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-sm text-[#203880]">Detail Akun Pengguna</h3>
                                <span className="bs-badge bs-badge-primary">
                                    {detailUser.roles?.[0] || 'Tanpa Role'}
                                </span>
                            </div>
                            <button type="button" onClick={() => setDetailId(null)}>
                                <X className="w-4 h-4 text-[#64748b]" />
                            </button>
                        </div>

                        <div className="bs-modal-body space-y-4 text-xs">
                            <div className="p-3.5 rounded border border-[#dbe3f0] bg-[#f8fafd] space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-[#64748b] inline-flex items-center gap-1.5">
                                        <User className="w-3.5 h-3.5 text-[#0068b0]" /> Nama Lengkap
                                    </span>
                                    <span className="font-bold text-[#1e293b]">{detailUser.name}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[#64748b] inline-flex items-center gap-1.5">
                                        <Mail className="w-3.5 h-3.5 text-[#0068b0]" /> Email
                                    </span>
                                    <span className="font-medium text-[#1e293b]">{detailUser.email}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[#64748b] inline-flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5 text-[#0068b0]" /> Terdaftar
                                    </span>
                                    <span className="font-medium text-[#1e293b]">
                                        {formatDateTime(detailUser.created_at)}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="font-semibold text-[#203880] flex items-center justify-between">
                                    <span className="inline-flex items-center gap-1.5">
                                        <Shield className="w-3.5 h-3.5 text-[#008a75]" />
                                        Daftar Permission Aktif
                                    </span>
                                    <span className="bs-badge bs-badge-info">
                                        {detailUser.permissions?.length || 0} permission
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-1.5 p-3 rounded border border-[#dbe3f0] bg-white">
                                    {(detailUser.permissions || []).length === 0 ? (
                                        <span className="text-[#64748b]">Tidak ada permission.</span>
                                    ) : (
                                        detailUser.permissions.map((perm) => (
                                            <span key={perm} className="bs-badge bs-badge-secondary">
                                                {perm}
                                            </span>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="bs-modal-footer">
                            <button
                                type="button"
                                onClick={() => setDetailId(null)}
                                className="bs-btn bs-btn-sm bs-btn-outline-secondary"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create User Modal */}
            {showNewUser && (
                <div className="bs-modal-backdrop">
                    <div className="bs-modal-dialog">
                        <div className="bs-modal-header">
                            <h3 className="font-bold text-sm text-[#203880]">Tambah Pengguna Pengelola</h3>
                            <button type="button" onClick={() => setShowNewUser(false)}>
                                <X className="w-4 h-4 text-[#64748b]" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateUser}>
                            <div className="bs-modal-body space-y-3">
                                <div>
                                    <label className="bs-form-label">Nama Lengkap *</label>
                                    <input
                                        value={newUser.name}
                                        onChange={(e) => setNewUser((p) => ({ ...p, name: e.target.value }))}
                                        required
                                        className="bs-form-control"
                                    />
                                </div>
                                <div>
                                    <label className="bs-form-label">Email *</label>
                                    <input
                                        type="email"
                                        value={newUser.email}
                                        onChange={(e) => setNewUser((p) => ({ ...p, email: e.target.value }))}
                                        required
                                        className="bs-form-control"
                                    />
                                </div>
                                <div>
                                    <label className="bs-form-label">Password (min. 8 karakter) *</label>
                                    <input
                                        type="password"
                                        minLength={8}
                                        value={newUser.password}
                                        onChange={(e) => setNewUser((p) => ({ ...p, password: e.target.value }))}
                                        required
                                        className="bs-form-control"
                                    />
                                </div>
                                <div>
                                    <label className="bs-form-label">Role *</label>
                                    <select
                                        value={newUser.role}
                                        onChange={(e) => setNewUser((p) => ({ ...p, role: e.target.value }))}
                                        className="bs-form-select"
                                    >
                                        {roleOptions.map((rName) => (
                                            <option key={rName} value={rName}>
                                                {rName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="bs-modal-footer">
                                <button
                                    type="button"
                                    onClick={() => setShowNewUser(false)}
                                    className="bs-btn bs-btn-sm bs-btn-outline-secondary"
                                >
                                    Batal
                                </button>
                                <button type="submit" className="bs-btn bs-btn-sm bs-btn-primary">
                                    Buat Pengguna
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
