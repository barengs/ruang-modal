import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const fetchDashboard = createAsyncThunk('admin/fetchDashboard', async (_, { rejectWithValue }) => {
    try {
        const { data } = await api.get('/admin/dashboard');
        return data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Gagal memuat dashboard.');
    }
});

export const fetchModalList = createAsyncThunk('admin/fetchModal', async (_, { rejectWithValue }) => {
    try {
        const { data } = await api.get('/admin/modal');
        return data.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Gagal memuat data Ruang Modal.');
    }
});

export const fetchModalItem = createAsyncThunk('admin/fetchModalItem', async (id, { rejectWithValue }) => {
    try {
        const { data } = await api.get(`/admin/modal/${id}`);
        return data.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Gagal memuat detail pengajuan Ruang Modal.');
    }
});

export const updateModalItem = createAsyncThunk('admin/updateModal', async ({ id, payload }, { rejectWithValue }) => {
    try {
        const { data } = await api.patch(`/admin/modal/${id}`, payload);
        return data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Gagal memperbarui Ruang Modal.');
    }
});

export const deleteModalItem = createAsyncThunk('admin/deleteModal', async (id, { rejectWithValue }) => {
    try {
        await api.delete(`/admin/modal/${id}`);
        return id;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Gagal menghapus data.');
    }
});

export const fetchTumbuhList = createAsyncThunk('admin/fetchTumbuh', async (_, { rejectWithValue }) => {
    try {
        const { data } = await api.get('/admin/tumbuh');
        return data.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Gagal memuat data Ruang Tumbuh.');
    }
});

export const updateTumbuhItem = createAsyncThunk('admin/updateTumbuh', async ({ id, payload }, { rejectWithValue }) => {
    try {
        const { data } = await api.patch(`/admin/tumbuh/${id}`, payload);
        return data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Gagal memperbarui Ruang Tumbuh.');
    }
});

export const deleteTumbuhItem = createAsyncThunk('admin/deleteTumbuh', async (id, { rejectWithValue }) => {
    try {
        await api.delete(`/admin/tumbuh/${id}`);
        return id;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Gagal menghapus data.');
    }
});

export const fetchPasarList = createAsyncThunk('admin/fetchPasar', async (_, { rejectWithValue }) => {
    try {
        const { data } = await api.get('/admin/pasar');
        return data.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Gagal memuat data Ruang Pasar.');
    }
});

export const updatePasarItem = createAsyncThunk('admin/updatePasar', async ({ id, payload }, { rejectWithValue }) => {
    try {
        const { data } = await api.patch(`/admin/pasar/${id}`, payload);
        return data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Gagal memperbarui Ruang Pasar.');
    }
});

export const deletePasarItem = createAsyncThunk('admin/deletePasar', async (id, { rejectWithValue }) => {
    try {
        await api.delete(`/admin/pasar/${id}`);
        return id;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Gagal menghapus produk.');
    }
});

export const fetchMonitoringList = createAsyncThunk('admin/fetchMonitoring', async (_, { rejectWithValue }) => {
    try {
        const { data } = await api.get('/admin/monitoring');
        return data.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Gagal memuat data Monitoring.');
    }
});

export const createMonitoringItem = createAsyncThunk('admin/createMonitoring', async (payload, { rejectWithValue }) => {
    try {
        const { data } = await api.post('/admin/monitoring', payload);
        return data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Gagal menyimpan monitoring.');
    }
});

export const deleteMonitoringItem = createAsyncThunk('admin/deleteMonitoring', async (id, { rejectWithValue }) => {
    try {
        await api.delete(`/admin/monitoring/${id}`);
        return id;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Gagal menghapus monitoring.');
    }
});

export const fetchMasterOptionsList = createAsyncThunk(
    'admin/fetchMasterOptions',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await api.get('/admin/master-options');
            return data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Gagal memuat master data.');
        }
    }
);

export const createMasterOptionItem = createAsyncThunk(
    'admin/createMasterOption',
    async (payload, { rejectWithValue }) => {
        try {
            const { data } = await api.post('/admin/master-options', payload);
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Gagal menambahkan master data.');
        }
    }
);

export const updateMasterOptionItem = createAsyncThunk(
    'admin/updateMasterOption',
    async ({ id, payload }, { rejectWithValue }) => {
        try {
            const { data } = await api.patch(`/admin/master-options/${id}`, payload);
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Gagal memperbarui master data.');
        }
    }
);

export const deleteMasterOptionItem = createAsyncThunk(
    'admin/deleteMasterOption',
    async (id, { rejectWithValue }) => {
        try {
            const { data } = await api.delete(`/admin/master-options/${id}`);
            return { id, message: data.message };
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Gagal menghapus master data.');
        }
    }
);

export const fetchAlumniList = createAsyncThunk('admin/fetchAlumniList', async (_, { rejectWithValue }) => {
    try {
        const { data } = await api.get('/admin/alumni');
        return data.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Gagal memuat data alumni.');
    }
});

export const createAlumniItem = createAsyncThunk('admin/createAlumni', async (payload, { rejectWithValue }) => {
    try {
        const { data } = await api.post('/admin/alumni', payload);
        return data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Gagal menambahkan data alumni.');
    }
});

export const updateAlumniItem = createAsyncThunk(
    'admin/updateAlumni',
    async ({ id, payload }, { rejectWithValue }) => {
        try {
            const { data } = await api.patch(`/admin/alumni/${id}`, payload);
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Gagal memperbarui data alumni.');
        }
    }
);

export const deleteAlumniItem = createAsyncThunk('admin/deleteAlumni', async (id, { rejectWithValue }) => {
    try {
        await api.delete(`/admin/alumni/${id}`);
        return id;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Gagal menghapus data alumni.');
    }
});

export const fetchUsersList = createAsyncThunk('admin/fetchUsersList', async (_, { rejectWithValue }) => {
    try {
        const { data } = await api.get('/admin/users');
        return {
            users: data.data,
            availableRoles: data.available_roles || [],
        };
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Gagal memuat daftar pengguna.');
    }
});

export const fetchRolesList = createAsyncThunk('admin/fetchRolesList', async (_, { rejectWithValue }) => {
    try {
        const { data } = await api.get('/admin/roles');
        return {
            roles: data.roles,
            allPermissions: data.all_permissions,
        };
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Gagal memuat daftar role & permission.');
    }
});

export const deleteUserItem = createAsyncThunk('admin/deleteUser', async (id, { rejectWithValue }) => {
    try {
        await api.delete(`/admin/users/${id}`);
        return id;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Gagal menghapus pengguna.');
    }
});

export const fetchUsersAndRoles = createAsyncThunk('admin/fetchUsersAndRoles', async (_, { rejectWithValue }) => {
    try {
        const [usersRes, rolesRes] = await Promise.all([
            api.get('/admin/users'),
            api.get('/admin/roles'),
        ]);
        return {
            users: usersRes.data.data,
            roles: rolesRes.data.roles,
            allPermissions: rolesRes.data.all_permissions,
        };
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Gagal memuat pengguna dan role.');
    }
});

export const createUserItem = createAsyncThunk('admin/createUser', async (payload, { rejectWithValue }) => {
    try {
        const { data } = await api.post('/admin/users', payload);
        return data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Gagal membuat pengguna.');
    }
});

export const updateUserRoleItem = createAsyncThunk('admin/updateUserRole', async ({ id, role }, { rejectWithValue }) => {
    try {
        const { data } = await api.patch(`/admin/users/${id}/role`, { role });
        return data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Gagal mengubah role.');
    }
});

export const createRoleItem = createAsyncThunk('admin/createRole', async (payload, { rejectWithValue }) => {
    try {
        const { data } = await api.post('/admin/roles', payload);
        return data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Gagal menambahkan role baru.');
    }
});

export const deleteRoleItem = createAsyncThunk('admin/deleteRole', async (id, { rejectWithValue }) => {
    try {
        await api.delete(`/admin/roles/${id}`);
        return id;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Gagal menghapus role.');
    }
});

export const updateRolePermissionsItem = createAsyncThunk(
    'admin/updateRolePermissions',
    async ({ id, permissions }, { rejectWithValue }) => {
        try {
            const { data } = await api.patch(`/admin/roles/${id}/permissions`, { permissions });
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Gagal memperbarui permission.');
        }
    }
);

const adminSlice = createSlice({
    name: 'admin',
    initialState: {
        dashboard: null,
        modal: [],
        tumbuh: [],
        pasar: [],
        monitoring: [],
        masterOptions: [],
        alumni: [],
        users: [],
        roles: [],
        allPermissions: [],
        loading: false,
        flash: null,
        error: null,
    },
    reducers: {
        clearAdminNotice: (state) => {
            state.flash = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchDashboard.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDashboard.fulfilled, (state, action) => {
                state.loading = false;
                state.dashboard = action.payload;
            })
            .addCase(fetchDashboard.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchModalList.fulfilled, (state, action) => {
                state.modal = action.payload;
            })
            .addCase(fetchModalItem.fulfilled, (state, action) => {
                const item = action.payload;
                const idx = state.modal.findIndex((m) => m.id === item.id);
                if (idx >= 0) {
                    state.modal[idx] = item;
                } else {
                    state.modal.unshift(item);
                }
            })
            .addCase(updateModalItem.fulfilled, (state, action) => {
                state.modal = state.modal.map((item) =>
                    item.id === action.payload.data.id ? action.payload.data : item
                );
                state.flash = action.payload.message;
            })
            .addCase(deleteModalItem.fulfilled, (state, action) => {
                state.modal = state.modal.filter((item) => item.id !== action.payload);
                state.flash = 'Pengajuan Ruang Modal berhasil dihapus.';
            })
            .addCase(fetchTumbuhList.fulfilled, (state, action) => {
                state.tumbuh = action.payload;
            })
            .addCase(updateTumbuhItem.fulfilled, (state, action) => {
                state.tumbuh = state.tumbuh.map((item) =>
                    item.id === action.payload.data.id ? action.payload.data : item
                );
                state.flash = action.payload.message;
            })
            .addCase(deleteTumbuhItem.fulfilled, (state, action) => {
                state.tumbuh = state.tumbuh.filter((item) => item.id !== action.payload);
                state.flash = 'Permintaan Ruang Tumbuh berhasil dihapus.';
            })
            .addCase(fetchPasarList.fulfilled, (state, action) => {
                state.pasar = action.payload;
            })
            .addCase(updatePasarItem.fulfilled, (state, action) => {
                state.pasar = state.pasar.map((item) =>
                    item.id === action.payload.data.id ? action.payload.data : item
                );
                state.flash = action.payload.message;
            })
            .addCase(deletePasarItem.fulfilled, (state, action) => {
                state.pasar = state.pasar.filter((item) => item.id !== action.payload);
                state.flash = 'Produk Ruang Pasar berhasil dihapus.';
            })
            .addCase(fetchMonitoringList.fulfilled, (state, action) => {
                state.monitoring = action.payload;
            })
            .addCase(createMonitoringItem.fulfilled, (state, action) => {
                state.monitoring = [action.payload.data, ...state.monitoring];
                state.flash = action.payload.message;
            })
            .addCase(deleteMonitoringItem.fulfilled, (state, action) => {
                state.monitoring = state.monitoring.filter((item) => item.id !== action.payload);
                state.flash = 'Data monitoring berhasil dihapus.';
            })
            .addCase(fetchMasterOptionsList.fulfilled, (state, action) => {
                state.masterOptions = action.payload;
            })
            .addCase(createMasterOptionItem.fulfilled, (state, action) => {
                state.masterOptions = [...state.masterOptions, action.payload.data];
                state.flash = action.payload.message;
            })
            .addCase(updateMasterOptionItem.fulfilled, (state, action) => {
                state.masterOptions = state.masterOptions.map((item) =>
                    item.id === action.payload.data.id ? action.payload.data : item
                );
                state.flash = action.payload.message;
            })
            .addCase(deleteMasterOptionItem.fulfilled, (state, action) => {
                state.masterOptions = state.masterOptions.filter((item) => item.id !== action.payload.id);
                state.flash = action.payload.message;
            })
            .addCase(fetchUsersAndRoles.fulfilled, (state, action) => {
                state.users = action.payload.users;
                state.roles = action.payload.roles;
                state.allPermissions = action.payload.allPermissions;
            })
            .addCase(fetchUsersList.fulfilled, (state, action) => {
                state.users = action.payload.users;
                if (action.payload.availableRoles.length > 0) {
                    state.roles = action.payload.availableRoles.map((r) => ({
                        id: r.id,
                        name: r.name,
                        permissions: [],
                    }));
                }
            })
            .addCase(fetchAlumniList.fulfilled, (state, action) => {
                state.alumni = action.payload;
            })
            .addCase(createAlumniItem.fulfilled, (state, action) => {
                state.alumni = [action.payload.data, ...state.alumni];
                state.flash = action.payload.message;
            })
            .addCase(updateAlumniItem.fulfilled, (state, action) => {
                state.alumni = state.alumni.map((a) =>
                    a.id === action.payload.data.id ? action.payload.data : a
                );
                state.flash = action.payload.message;
            })
            .addCase(deleteAlumniItem.fulfilled, (state, action) => {
                state.alumni = state.alumni.filter((a) => a.id !== action.payload);
                state.flash = 'Data akun alumni berhasil dihapus.';
            })
            .addCase(fetchRolesList.fulfilled, (state, action) => {
                state.roles = action.payload.roles;
                state.allPermissions = action.payload.allPermissions;
            })
            .addCase(deleteUserItem.fulfilled, (state, action) => {
                state.users = state.users.filter((u) => u.id !== action.payload);
                state.flash = 'Pengguna berhasil dihapus.';
            })
            .addCase(createUserItem.fulfilled, (state, action) => {
                state.users = [action.payload.data, ...state.users];
                state.flash = action.payload.message;
            })
            .addCase(updateUserRoleItem.fulfilled, (state, action) => {
                state.users = state.users.map((u) =>
                    u.id === action.payload.data.id ? { ...u, ...action.payload.data } : u
                );
                state.flash = action.payload.message;
            })
            .addCase(updateRolePermissionsItem.fulfilled, (state, action) => {
                state.roles = state.roles.map((r) =>
                    r.id === action.payload.data.id ? action.payload.data : r
                );
                state.flash = action.payload.message;
            })
            .addCase(createRoleItem.fulfilled, (state, action) => {
                state.roles = [...state.roles, action.payload.data];
                state.flash = action.payload.message;
            })
            .addCase(createRoleItem.rejected, (state, action) => {
                state.error = action.payload;
            })
            .addCase(deleteRoleItem.fulfilled, (state, action) => {
                state.roles = state.roles.filter((r) => r.id !== action.payload);
                state.flash = 'Role berhasil dihapus.';
            })
            .addCase(deleteRoleItem.rejected, (state, action) => {
                state.error = action.payload;
            });
    },
});

export const { clearAdminNotice } = adminSlice.actions;
export default adminSlice.reducer;
