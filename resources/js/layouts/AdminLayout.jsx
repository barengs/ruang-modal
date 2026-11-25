import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    Activity,
    Bell,
    Briefcase,
    Database,
    ExternalLink,
    GraduationCap,
    LayoutDashboard,
    LogOut,
    Menu,
    MessageCircle,
    Shield,
    Store,
    TrendingUp,
    Users,
    X,
} from 'lucide-react';
import api from '../api/axios';
import { hasPermission, logoutUser } from '../store/slices/authSlice';
import { formatDateTime } from '../utils/format';

export default function AdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [bellOpen, setBellOpen] = useState(false);
    const [chatSessions, setChatSessions] = useState([]);
    const [totalUnreadChat, setTotalUnreadChat] = useState(0);
    const bellRef = useRef(null);
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const canManageChat = hasPermission(user, 'chat.manage');

    const fetchUnreadChats = useCallback(async () => {
        if (!canManageChat) return;
        try {
            const { data } = await api.get('/admin/chats');
            setChatSessions(data.data || []);
            setTotalUnreadChat(data.total_unread || 0);
        } catch {
            // ignore
        }
    }, [canManageChat]);

    useEffect(() => {
        if (!canManageChat) return;
        fetchUnreadChats();
        const timer = setInterval(fetchUnreadChats, 4000);

        let bc = null;
        try {
            if (typeof BroadcastChannel !== 'undefined') {
                bc = new BroadcastChannel('dt_live_chat');
                bc.onmessage = () => {
                    fetchUnreadChats();
                };
            }
        } catch {
            // ignore
        }

        return () => {
            clearInterval(timer);
            if (bc) bc.close();
        };
    }, [canManageChat, fetchUnreadChats]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (bellRef.current && !bellRef.current.contains(e.target)) {
                setBellOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const unreadChatList = chatSessions.filter((s) => s.unread_admin_count > 0);

    const menuItems = [
        { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, perm: 'dashboard.view', end: true },
        { to: '/admin/modal', label: 'Ruang Modal', icon: Briefcase, perm: 'modal.view' },
        { to: '/admin/tumbuh', label: 'Ruang Tumbuh', icon: TrendingUp, perm: 'tumbuh.view' },
        { to: '/admin/pasar', label: 'Ruang Pasar', icon: Store, perm: 'pasar.view' },
        { to: '/admin/monitoring', label: 'Monitoring', icon: Activity, perm: 'monitoring.view' },
        { to: '/admin/chat', label: 'Live Chat', icon: MessageCircle, perm: 'chat.manage' },
        { to: '/admin/master-data', label: 'Master Data', icon: Database, perm: 'master.manage' },
        { to: '/admin/alumni', label: 'Data Alumni', icon: GraduationCap, perm: 'users.manage' },
        { to: '/admin/users', label: 'Data Pengelola', icon: Users, perm: 'users.manage' },
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

                    {/* Bell Notification for New Unread Live Chats */}
                    {canManageChat && (
                        <div className="relative" ref={bellRef}>
                            <button
                                type="button"
                                onClick={() => setBellOpen((prev) => !prev)}
                                className="relative p-2 rounded-full text-[#203880] hover:bg-[#eef4ff] transition-colors cursor-pointer"
                                title="Notifikasi Live Chat"
                                aria-label="Notifikasi Live Chat"
                            >
                                <Bell className="w-5 h-5" />
                                {totalUnreadChat > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#e11d48] text-white text-[10px] font-bold flex items-center justify-center shadow-2xs">
                                        {totalUnreadChat > 99 ? '99+' : totalUnreadChat}
                                    </span>
                                )}
                            </button>

                            {bellOpen && (
                                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-md shadow-xl border border-[#dbe3f0] overflow-hidden z-50">
                                    <div className="px-3.5 py-2.5 bg-[#f8fafd] border-b border-[#dbe3f0] flex items-center justify-between">
                                        <span className="font-bold text-xs text-[#203880] flex items-center gap-1.5">
                                            <MessageCircle className="w-3.5 h-3.5 text-[#0068b0]" />
                                            Notifikasi Chat Baru
                                        </span>
                                        {totalUnreadChat > 0 ? (
                                            <span className="bs-badge bs-badge-danger">
                                                {totalUnreadChat} Belum Dibaca
                                            </span>
                                        ) : (
                                            <span className="bs-badge bs-badge-secondary">Semua Terbaca</span>
                                        )}
                                    </div>

                                    <div className="max-h-72 overflow-y-auto divide-y divide-[#eef2f9]">
                                        {unreadChatList.length === 0 ? (
                                            <div className="p-5 text-center text-xs text-[#64748b]">
                                                Tidak ada pesan chat baru yang belum dibaca.
                                            </div>
                                        ) : (
                                            unreadChatList.map((s) => (
                                                <button
                                                    key={s.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setBellOpen(false);
                                                        navigate(`/admin/chat?session=${s.id}`);
                                                    }}
                                                    className="w-full text-left px-3.5 py-3 hover:bg-[#eef4ff] transition-colors flex items-start justify-between gap-2.5 cursor-pointer"
                                                >
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="font-semibold text-xs text-[#203880] truncate">
                                                                {s.guest_name}
                                                            </span>
                                                            <span className="px-1.5 py-0.2 rounded bg-[#e6f2ff] text-[#00528c] text-[10px] font-semibold">
                                                                {s.topik}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-[#475569] truncate mt-0.5">
                                                            {s.latest_message?.message || 'Pesan baru masuk'}
                                                        </p>
                                                        <div className="text-[10px] text-[#64748b] mt-0.5">
                                                            {formatDateTime(s.last_message_at || s.created_at)}
                                                        </div>
                                                    </div>
                                                    <span className="px-1.5 py-0.5 rounded-full bg-[#e11d48] text-white text-[10px] font-bold shrink-0 mt-0.5">
                                                        {s.unread_admin_count}
                                                    </span>
                                                </button>
                                            ))
                                        )}
                                    </div>

                                    <div className="px-3.5 py-2 bg-[#f8fafd] border-t border-[#dbe3f0] text-center">
                                        <Link
                                            to="/admin/chat"
                                            onClick={() => setBellOpen(false)}
                                            className="text-xs font-semibold text-[#0068b0] hover:text-[#203880] hover:underline"
                                        >
                                            Buka Ruang Live Chat &rarr;
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

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
                                        `flex items-center justify-between gap-2.5 px-4 py-3 text-sm font-medium transition-colors ${
                                            isActive
                                                ? 'bg-[#0068b0] text-white border-l-4 border-[#f8a000]'
                                                : 'text-[#dbeafe] hover:bg-white/10 hover:text-white'
                                        }`
                                    }
                                >
                                    <span className="flex items-center gap-2.5">
                                        <Icon className="w-4 h-4 shrink-0" />
                                        {item.label}
                                    </span>
                                    {item.to === '/admin/chat' && totalUnreadChat > 0 && (
                                        <span className="px-1.5 py-0.5 rounded-full bg-[#e11d48] text-white text-[10px] font-bold">
                                            {totalUnreadChat}
                                        </span>
                                    )}
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
