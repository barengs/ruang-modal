import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    Activity,
    Briefcase,
    Database,
    ExternalLink,
    LayoutDashboard,
    LogOut,
    Menu,
    Shield,
    Store,
    TrendingUp,
    Users,
    X,
} from 'lucide-react';
import { hasPermission, logoutUser } from '../store/slices/authSlice';

export default function AdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const menuItems = [
        { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, perm: 'dashboard.view', end: true },
        { to: '/admin/modal', label: 'Ruang Modal', icon: Briefcase, perm: 'modal.view' },
        { to: '/admin/tumbuh', label: 'Ruang Tumbuh', icon: TrendingUp, perm: 'tumbuh.view' },
        { to: '/admin/pasar', label: 'Ruang Pasar', icon: Store, perm: 'pasar.view' },
        { to: '/admin/monitoring', label: 'Monitoring', icon: Activity, perm: 'monitoring.view' },
        { to: '/admin/master-data', label: 'Master Data', icon: Database, perm: 'master.manage' },
        { to: '/admin/users', label: 'Manajemen User', icon: Users, perm: 'users.manage' },
        { to: '/admin/roles', label: 'Role Management', icon: Shield, perm: 'roles.manage' },
    ].filter((item) => hasPermission(user, item.perm));

    const handleLogout = async () => {
        await dispatch(logoutUser());
        navigate('/login');
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#f3f6fb]">
            {/* Top Brand Spectrum Bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[#203880] via-[#0068b0] to-[#f8a000] sticky top-0 z-50" />

            {/* Top Navbar */}
            <header className="bg-white text-[#203880] h-15 px-4 flex items-center justify-between sticky top-1.5 z-40 border-b border-[#dbe3f0] shadow-xs">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setSidebarOpen((v) => !v)}
                        className="lg:hidden p-1.5 rounded border border-[#dbe3f0] text-[#203880] hover:bg-[#eef4ff]"
                    >
                        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                    <Link to="/admin" className="flex items-center gap-2.5 text-[#203880] no-underline">
                        <img
                            src="/images/logo-dt.webp"
                            alt="Logo SMA Double Track"
                            className="h-9 sm:h-10 w-auto object-contain"
                        />
                        <div className="hidden sm:block pl-2.5 border-l border-[#dbe3f0] leading-tight">
                            <div className="font-bold text-sm text-[#203880]">Panel Pengelola</div>
                            <div className="text-[11px] font-semibold text-[#f8a000]">
                                Ekosistem Alumni Double Track
                            </div>
                        </div>
                    </Link>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        to="/"
                        className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium text-[#0068b0] bg-[#eef4ff] hover:bg-[#dbeafe]"
                    >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Portal Publik
                    </Link>
                    <div className="text-right hidden sm:block leading-tight">
                        <div className="text-xs font-bold text-[#203880]">{user?.name}</div>
                        <div className="text-[11px] font-medium text-[#0068b0]">{user?.roles?.join(', ')}</div>
                    </div>
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="bs-btn bs-btn-sm bg-[#ffe4ea] text-[#be123c] border-[#fecdd6] hover:bg-[#e11d48] hover:text-white hover:border-[#e11d48]"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        Keluar
                    </button>
                </div>
            </header>

            {/* Body with Bootstrap-style Sidebar + Main */}
            <div className="flex flex-1 relative">
                {/* Sidebar */}
                <aside
                    className={`${
                        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } lg:translate-x-0 fixed lg:static inset-y-16 left-0 z-30 w-60 bg-[#203880] text-white border-r border-[#17285e] transition-transform duration-200 flex flex-col`}
                >
                    <div className="p-3.5 border-b border-white/10 bg-[#17285e]/60">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-[#ffc010]">
                            Navigasi Modul
                        </div>
                    </div>

                    <nav className="py-1 flex-1">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    end={item.end}
                                    onClick={() => setSidebarOpen(false)}
                                    className={({ isActive }) =>
                                        `flex items-center gap-2.5 px-4 py-3 text-sm font-medium transition-colors ${
                                            isActive
                                                ? 'bg-[#0068b0] text-white border-l-4 border-[#f8a000]'
                                                : 'text-[#dbeafe] hover:bg-white/10 hover:text-white'
                                        }`
                                    }
                                >
                                    <Icon className="w-4 h-4 shrink-0" />
                                    {item.label}
                                </NavLink>
                            );
                        })}
                    </nav>

                    <div className="p-3 border-t border-white/10 bg-[#17285e]/60 text-[11px] text-[#bfd9f2]">
                        Auth: JWT • RBAC: Spatie Permission
                    </div>
                </aside>

                {/* Mobile Backdrop */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/40 z-20 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Main Content Area */}
                <main className="flex-1 p-4 md:p-6 min-w-0">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
