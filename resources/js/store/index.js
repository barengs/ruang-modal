import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import publicReducer from './slices/publicSlice';
import adminReducer from './slices/adminSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        publicData: publicReducer,
        admin: adminReducer,
    },
});
