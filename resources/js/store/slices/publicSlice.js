import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const fetchPublicStats = createAsyncThunk('public/fetchStats', async () => {
    const { data } = await api.get('/public/stats');
    return data.counts;
});

export const fetchPublicMasterOptions = createAsyncThunk('public/fetchMasterOptions', async () => {
    const { data } = await api.get('/public/master-options');
    return data.options || {};
});

export const fetchPublicPasar = createAsyncThunk('public/fetchPasar', async (params = {}) => {
    const { data } = await api.get('/public/pasar', { params });
    return data.products;
});

export const fetchPublicPasarSubmissions = createAsyncThunk(
    'public/fetchPasarSubmissions',
    async (params = {}) => {
        const { data } = await api.get('/public/pasar-submissions', { params });
        return data.data;
    }
);

export const fetchPublicModal = createAsyncThunk('public/fetchModal', async (params = {}) => {
    const { data } = await api.get('/public/modal', { params });
    return data.data;
});

export const fetchPublicTumbuh = createAsyncThunk('public/fetchTumbuh', async (params = {}) => {
    const { data } = await api.get('/public/tumbuh', { params });
    return data.data;
});

const getErrorMessage = (err, fallback) => {
    const errors = err.response?.data?.errors;
    if (errors && typeof errors === 'object') {
        const first = Object.values(errors).flat()[0];
        if (first) return first;
    }
    return err.response?.data?.message || fallback;
};

export const submitModalApplication = createAsyncThunk('public/submitModal', async (payload, { rejectWithValue }) => {
    try {
        const { data } = await api.post('/public/modal', payload);
        return data;
    } catch (err) {
        return rejectWithValue(getErrorMessage(err, 'Gagal mengirim pengajuan Ruang Modal.'));
    }
});

export const submitTumbuhRequest = createAsyncThunk('public/submitTumbuh', async (payload, { rejectWithValue }) => {
    try {
        const { data } = await api.post('/public/tumbuh', payload);
        return data;
    } catch (err) {
        return rejectWithValue(getErrorMessage(err, 'Gagal mengirim permintaan Ruang Tumbuh.'));
    }
});

export const submitPasarProduct = createAsyncThunk('public/submitPasar', async (payload, { rejectWithValue }) => {
    try {
        const { data } = await api.post('/public/pasar', payload);
        return data;
    } catch (err) {
        return rejectWithValue(getErrorMessage(err, 'Gagal mengajukan produk ke Ruang Pasar.'));
    }
});

const DEFAULT_MASTER_OPTIONS = {
    jalur_pengajuan: ['Kerja', 'Usaha'],
    status_aktivitas: ['Belum bekerja', 'Sudah bekerja', 'Merintis usaha', 'Usaha berjalan'],
    jenis_bantuan: [
        'Peralatan kerja',
        'Modal produksi/bahan baku',
        'Mesin/peralatan usaha',
        'Peralatan pemasaran',
        'Kombinasi',
    ],
    kompetensi_dt: [
        'Tata Boga',
        'Tata Busana',
        'Tata Kecantikan',
        'Multimedia & Desain Grafis',
        'Teknik Kendaraan Ringan',
        'Teknik Listrik & Elektronika',
        'Teknologi Informasi & Web',
        'Kriya & Kerajinan',
    ],
    bidang_minat: [
        'Persiapan kerja',
        'Pengembangan karier',
        'Pengembangan usaha',
        'Produksi dan kualitas',
        'Legalitas usaha',
        'Branding dan pemasaran',
        'Keuangan usaha',
        'Kemitraan dan akses pasar',
    ],
    kategori_pasar: ['Kuliner', 'Fashion', 'Jasa kreatif', 'Kecantikan', 'Kerajinan', 'Teknologi', 'Lainnya'],
    topik_kontak: [
        'Pengajuan Ruang Modal',
        'Pendampingan Ruang Tumbuh',
        'Etalase Ruang Pasar',
        'Kemitraan & Kolaborasi',
        'Kendala Teknis / Lainnya',
    ],
};

const publicSlice = createSlice({
    name: 'publicData',
    initialState: {
        stats: { products: 0, modal: 0, tumbuh: 0, monitoring: 0 },
        masterOptions: DEFAULT_MASTER_OPTIONS,
        products: [],
        loadingProducts: false,
        pasarSubmissions: [],
        loadingPasarSubmissions: false,
        modalApplications: [],
        loadingModalApplications: false,
        tumbuhRequests: [],
        loadingTumbuhRequests: false,
        submitting: false,
        submitResult: null,
        submitError: null,
    },
    reducers: {
        resetSubmitState: (state) => {
            state.submitResult = null;
            state.submitError = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPublicStats.fulfilled, (state, action) => {
                state.stats = action.payload;
            })
            .addCase(fetchPublicMasterOptions.fulfilled, (state, action) => {
                state.masterOptions = {
                    ...DEFAULT_MASTER_OPTIONS,
                    ...action.payload,
                };
            })
            .addCase(fetchPublicPasar.pending, (state) => {
                state.loadingProducts = true;
            })
            .addCase(fetchPublicPasar.fulfilled, (state, action) => {
                state.loadingProducts = false;
                state.products = action.payload;
            })
            .addCase(fetchPublicPasar.rejected, (state) => {
                state.loadingProducts = false;
            })
            .addCase(fetchPublicPasarSubmissions.pending, (state) => {
                state.loadingPasarSubmissions = true;
            })
            .addCase(fetchPublicPasarSubmissions.fulfilled, (state, action) => {
                state.loadingPasarSubmissions = false;
                state.pasarSubmissions = action.payload;
            })
            .addCase(fetchPublicPasarSubmissions.rejected, (state) => {
                state.loadingPasarSubmissions = false;
            })
            .addCase(fetchPublicModal.pending, (state) => {
                state.loadingModalApplications = true;
            })
            .addCase(fetchPublicModal.fulfilled, (state, action) => {
                state.loadingModalApplications = false;
                state.modalApplications = action.payload;
            })
            .addCase(fetchPublicModal.rejected, (state) => {
                state.loadingModalApplications = false;
            })
            .addCase(fetchPublicTumbuh.pending, (state) => {
                state.loadingTumbuhRequests = true;
            })
            .addCase(fetchPublicTumbuh.fulfilled, (state, action) => {
                state.loadingTumbuhRequests = false;
                state.tumbuhRequests = action.payload;
            })
            .addCase(fetchPublicTumbuh.rejected, (state) => {
                state.loadingTumbuhRequests = false;
            })
            .addCase(submitModalApplication.fulfilled, (state, action) => {
                if (action.payload?.data) {
                    state.modalApplications = [
                        action.payload.data,
                        ...state.modalApplications.filter((item) => item.id !== action.payload.data.id),
                    ];
                }
            })
            .addCase(submitTumbuhRequest.fulfilled, (state, action) => {
                if (action.payload?.data) {
                    state.tumbuhRequests = [
                        action.payload.data,
                        ...state.tumbuhRequests.filter((item) => item.id !== action.payload.data.id),
                    ];
                }
            })
            .addCase(submitPasarProduct.fulfilled, (state, action) => {
                if (action.payload?.data) {
                    state.pasarSubmissions = [
                        action.payload.data,
                        ...state.pasarSubmissions.filter((item) => item.id !== action.payload.data.id),
                    ];
                }
            })
            .addMatcher(
                (action) =>
                    action.type.startsWith('public/submit') && action.type.endsWith('/pending'),
                (state) => {
                    state.submitting = true;
                    state.submitResult = null;
                    state.submitError = null;
                }
            )
            .addMatcher(
                (action) =>
                    action.type.startsWith('public/submit') && action.type.endsWith('/fulfilled'),
                (state, action) => {
                    state.submitting = false;
                    state.submitResult = action.payload;
                }
            )
            .addMatcher(
                (action) =>
                    action.type.startsWith('public/submit') && action.type.endsWith('/rejected'),
                (state, action) => {
                    state.submitting = false;
                    state.submitError = action.payload;
                }
            );
    },
});

export const { resetSubmitState } = publicSlice.actions;
export default publicSlice.reducer;
