import React, { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMe, hasPermission } from './store/slices/authSlice';
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import HomePage from './pages/public/HomePage';
import RuangModalPage from './pages/public/RuangModalPage';
import RuangTumbuhPage from './pages/public/RuangTumbuhPage';
import RuangPasarPage from './pages/public/RuangPasarPage';
import TentangPage from './pages/public/TentangPage';
import KontakPage from './pages/public/KontakPage';
import LoginPage from './pages/auth/LoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminModalPage from './pages/admin/AdminModalPage';
import AdminTumbuhPage from './pages/admin/AdminTumbuhPage';
import AdminPasarPage from './pages/admin/AdminPasarPage';
import AdminMonitoringPage from './pages/admin/AdminMonitoringPage';
import AdminMasterDataPage from './pages/admin/AdminMasterDataPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminRolesPage from './pages/admin/AdminRolesPage';

function ProtectedRoute({ children, permission = null }) {
    const { token, user } = useSelector((state) => state.auth);
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    if (permission && user && !hasPermission(user, permission)) {
        return (
            <div className="bs-alert bs-alert-warning">
                Anda tidak memiliki hak akses (<code>{permission}</code>) untuk membuka halaman ini.
            </div>
        );
    }
    return children;
}

export default function App() {
    const dispatch = useDispatch();
    const { token } = useSelector((state) => state.auth);

    useEffect(() => {
        if (token) {
            dispatch(fetchMe());
        }
    }, [dispatch, token]);

    return (
        <Routes>
            {/* Public Portal Routes */}
            <Route element={<PublicLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/ruang-modal" element={<RuangModalPage />} />
                <Route path="/ruang-tumbuh" element={<RuangTumbuhPage />} />
                <Route path="/ruang-pasar" element={<RuangPasarPage />} />
                <Route path="/tentang" element={<TentangPage />} />
                <Route path="/kontak" element={<KontakPage />} />
                <Route path="/login" element={<LoginPage />} />
            </Route>

            {/* Protected Admin Panel Routes */}
            <Route
                path="/admin"
                element={
                    <ProtectedRoute>
                        <AdminLayout />
                    </ProtectedRoute>
                }
            >
                <Route
                    index
                    element={
                        <ProtectedRoute permission="dashboard.view">
                            <AdminDashboardPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="modal"
                    element={
                        <ProtectedRoute permission="modal.view">
                            <AdminModalPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="tumbuh"
                    element={
                        <ProtectedRoute permission="tumbuh.view">
                            <AdminTumbuhPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="pasar"
                    element={
                        <ProtectedRoute permission="pasar.view">
                            <AdminPasarPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="monitoring"
                    element={
                        <ProtectedRoute permission="monitoring.view">
                            <AdminMonitoringPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="master-data"
                    element={
                        <ProtectedRoute permission="master.manage">
                            <AdminMasterDataPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="users"
                    element={
                        <ProtectedRoute permission="users.manage">
                            <AdminUsersPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="roles"
                    element={
                        <ProtectedRoute permission="roles.manage">
                            <AdminRolesPage />
                        </ProtectedRoute>
                    }
                />
                <Route path="users-roles" element={<Navigate to="/admin/users" replace />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
