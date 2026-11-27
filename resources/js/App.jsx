import React, { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { fetchMe, hasPermission } from './store/slices/authSlice';
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import HomePage from './pages/public/HomePage';
import RuangModalPage from './pages/public/RuangModalPage';
import RuangTumbuhPage from './pages/public/RuangTumbuhPage';
import RuangPasarPage from './pages/public/RuangPasarPage';
import EtalasePasarPage from './pages/public/EtalasePasarPage';
import TentangPage from './pages/public/TentangPage';
import KontakPage from './pages/public/KontakPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import AlumniDashboardPage from './pages/alumni/AlumniDashboardPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminModalPage from './pages/admin/AdminModalPage';
import AdminModalDetailPage from './pages/admin/AdminModalDetailPage';
import AdminTumbuhPage from './pages/admin/AdminTumbuhPage';
import AdminPasarPage from './pages/admin/AdminPasarPage';
import AdminMonitoringPage from './pages/admin/AdminMonitoringPage';
import AdminChatPage from './pages/admin/AdminChatPage';
import AdminMasterDataPage from './pages/admin/AdminMasterDataPage';
import AdminAlumniPage from './pages/admin/AdminAlumniPage';
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
        <>
            <ToastContainer
                position="top-right"
                autoClose={4000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />
            <Routes>
                {/* Public Portal Routes */}
            <Route element={<PublicLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/ruang-modal" element={<RuangModalPage />} />
                <Route path="/ruang-tumbuh" element={<RuangTumbuhPage />} />
                <Route path="/ruang-pasar" element={<RuangPasarPage />} />
                <Route path="/etalase-pasar" element={<EtalasePasarPage />} />
                <Route path="/tentang" element={<TentangPage />} />
                <Route path="/kontak" element={<KontakPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/alumni" element={<AlumniDashboardPage />} />
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
                    path="modal/:id"
                    element={
                        <ProtectedRoute permission="modal.view">
                            <AdminModalDetailPage />
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
                    path="chat"
                    element={
                        <ProtectedRoute permission="chat.manage">
                            <AdminChatPage />
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
                    path="alumni"
                    element={
                        <ProtectedRoute permission="alumni.view">
                            <AdminAlumniPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="users"
                    element={
                        <ProtectedRoute permission="users.view">
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
        </>
    );
}
