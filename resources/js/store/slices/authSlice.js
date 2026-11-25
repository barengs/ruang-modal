import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../api/axios';

const savedToken = localStorage.getItem('dt_jwt_token');
const savedUser = (() => {
    try {
        const raw = localStorage.getItem('dt_jwt_user');
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
})();

export const registerUser = createAsyncThunk('auth/register', async (payload, { rejectWithValue }) => {
    try {
        const { data } = await api.post('/auth/register', payload);
        localStorage.setItem('dt_jwt_token', data.access_token);
        localStorage.setItem('dt_jwt_user', JSON.stringify(data.user));
        return data;
    } catch (err) {
        const firstValErr = err.response?.data?.errors
            ? Object.values(err.response.data.errors)[0]?.[0]
            : null;
        return rejectWithValue(
            firstValErr || err.response?.data?.message || 'Gagal mendaftarkan akun alumni.'
        );
    }
});

export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
    try {
        const { data } = await api.post('/auth/login', credentials);
        localStorage.setItem('dt_jwt_token', data.access_token);
        localStorage.setItem('dt_jwt_user', JSON.stringify(data.user));
        return data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Gagal login. Periksa email dan kata sandi.');
    }
});

export const socialLoginUser = createAsyncThunk('auth/socialLogin', async (payload, { rejectWithValue }) => {
    try {
        const { data } = await api.post('/auth/social', payload);
        localStorage.setItem('dt_jwt_token', data.access_token);
        localStorage.setItem('dt_jwt_user', JSON.stringify(data.user));
        return data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Gagal masuk menggunakan akun sosial.');
    }
});

export const fetchMe = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
    try {
        const { data } = await api.get('/auth/me');
        localStorage.setItem('dt_jwt_user', JSON.stringify(data.user));
        return data.user;
    } catch (err) {
        localStorage.removeItem('dt_jwt_token');
        localStorage.removeItem('dt_jwt_user');
        return rejectWithValue(err.response?.data?.message || 'Sesi berakhir.');
    }
});

export const updateAlumniProfile = createAsyncThunk(
    'auth/updateAlumniProfile',
    async (payload, { rejectWithValue }) => {
        try {
            const { data } = await api.patch('/alumni/profile', payload);
            localStorage.setItem('dt_jwt_user', JSON.stringify(data.user));
            return data.user;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Gagal memperbarui profil.');
        }
    }
);

export const logoutUser = createAsyncThunk('auth/logout', async () => {
    try {
        await api.post('/auth/logout');
    } catch {
        // Ignore network errors on logout
    } finally {
        localStorage.removeItem('dt_jwt_token');
        localStorage.removeItem('dt_jwt_user');
    }
});

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        token: savedToken || null,
        user: savedUser,
        loading: false,
        error: null,
    },
    reducers: {
        clearAuthError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                state.token = action.payload.access_token;
                state.user = action.payload.user;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.token = action.payload.access_token;
                state.user = action.payload.user;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(socialLoginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(socialLoginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.token = action.payload.access_token;
                state.user = action.payload.user;
            })
            .addCase(socialLoginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchMe.fulfilled, (state, action) => {
                state.user = action.payload;
            })
            .addCase(fetchMe.rejected, (state) => {
                state.token = null;
                state.user = null;
            })
            .addCase(updateAlumniProfile.fulfilled, (state, action) => {
                state.user = action.payload;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.token = null;
                state.user = null;
                state.error = null;
            });
    },
});

export const { clearAuthError } = authSlice.actions;

export const hasPermission = (user, permission) => {
    if (!user) return false;
    if (user.roles?.includes('super-admin')) return true;
    return user.permissions?.includes(permission) ?? false;
};

export const isAlumniUser = (user) => {
    if (!user) return false;
    if (user.is_alumni) return true;
    if (user.roles?.includes('alumni')) return true;
    return (user.permissions?.length || 0) === 0 && !user.roles?.includes('super-admin');
};

export default authSlice.reducer;
