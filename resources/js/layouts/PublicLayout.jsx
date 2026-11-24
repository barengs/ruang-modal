import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
    Briefcase,
    ChevronDown,
    FileSpreadsheet,
    Home,
    Info,
    LogIn,
    Menu,
    Phone,
    ShieldCheck,
    Store,
    TrendingUp,
    X,
} from 'lucide-react';

export default function PublicLayout() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileDropdownOpen, setMobileDropdownOpen] = useState(true);
    const dropdownRef = useRef(null);
    const location = useLocation();
    const { user } = useSelector((state) => state.auth);

    const pengajuanItems = [
        {
            to: '/ruang-modal',
            label: 'Ruang Modal',
            desc: 'Fasilitasi alat kerja & modal usaha',
            icon: Briefcase,
            iconColor: 'text-[#203880]',
        },
        {
            to: '/ruang-tumbuh',
            label: 'Ruang Tumbuh',
            desc: 'Pendampingan & konsultasi mentor',
            icon: TrendingUp,
            iconColor: 'text-[#008a75]',
        },
        {
            to: '/ruang-pasar',
            label: 'Ruang Pasar',
            desc: 'Pendaftaran produk & etalase alumni',
            icon: Store,
            iconColor: 'text-[#f8a000]',
        },
    ];

    const isPengajuanActive = pengajuanItems.some((item) => location.pathname.startsWith(item.to));

    useEffect(() => {
        setDropdownOpen(false);
        setMenuOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const navLinkClass = ({ isActive }) =>
        `inline-flex items-center gap-1.5 px-3 py-2 rounded text-sm font-medium transition-colors ${
            isActive
                ? 'bg-[#203880] text-white shadow-2xs'
                : 'text-[#203880] hover:bg-[#eef4ff] hover:text-[#0068b0]'
        }`;

    const mobileNavLinkClass = ({ isActive }) =>
        `flex items-center gap-2 px-3 py-2 rounded text-sm font-medium ${
            isActive ? 'bg-[#203880] text-white' : 'text-[#203880] hover:bg-[#eef4ff]'
        }`;

    return (
        <div className="min-h-screen flex flex-col bg-[#f3f6fb]">
            {/* Double Track Signature Navbar */}
            <header className="sticky top-0 z-40 bg-white border-b border-[#dbe3f0] shadow-xs">
                {/* Top Brand Spectrum Bar (Navy -> Ocean Blue -> Amber Gold) */}
                <div className="h-1.5 w-full bg-gradient-to-r from-[#203880] via-[#0068b0] to-[#f8a000]" />

                <nav className="bs-container">
                    <div className="flex items-center justify-between h-16">
                        <Link to="/" className="flex items-center gap-3 no-underline">
                            <img
                                src="/images/logo-dt.webp"
                                alt="Logo SMA Double Track"
                                className="h-10 sm:h-11 w-auto object-contain"
                            />
                            <div className="hidden sm:block pl-3 border-l border-[#dbe3f0] leading-tight">
                                <div className="font-bold text-sm text-[#203880] tracking-tight">
                                    Ekosistem Alumni
                                </div>
                                <div className="text-[11px] font-semibold text-[#f8a000]">
                                    SMA Double Track Mandiri
                                </div>
                            </div>
                        </Link>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex items-center gap-1">
                            <NavLink to="/" end className={navLinkClass}>
                                <Home className="w-4 h-4" />
                                Beranda
                            </NavLink>

                            {/* Dropdown Pengajuan */}
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    type="button"
                                    onClick={() => setDropdownOpen((prev) => !prev)}
                                    aria-expanded={dropdownOpen}
                                    aria-haspopup="true"
                                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded text-sm font-medium transition-colors cursor-pointer ${
                                        isPengajuanActive || dropdownOpen
                                            ? 'bg-[#203880] text-white shadow-2xs'
                                            : 'text-[#203880] hover:bg-[#eef4ff] hover:text-[#0068b0]'
                                    }`}
                                >
                                    <FileSpreadsheet className="w-4 h-4" />
                                    Pengajuan
                                    <ChevronDown
                                        className={`w-4 h-4 transition-transform duration-150 ${
                                            dropdownOpen ? 'rotate-180' : ''
                                        }`}
                                    />
                                </button>

                                {dropdownOpen && (
                                    <div className="absolute left-0 mt-1.5 w-64 rounded-md bg-white text-[#1e293b] shadow-lg border border-[#dbe3f0] py-1.5 z-50">
                                        <div className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#64748b] border-b border-[#eef2f9]">
                                            Layanan Pengajuan Alumni
                                        </div>
                                        {pengajuanItems.map((item) => {
                                            const Icon = item.icon;
                                            return (
                                                <NavLink
                                                    key={item.to}
                                                    to={item.to}
                                                    onClick={() => setDropdownOpen(false)}
                                                    className={({ isActive }) =>
                                                        `flex items-start gap-2.5 px-3.5 py-2.5 text-sm transition-colors ${
                                                            isActive
                                                                ? 'bg-[#eef4ff] text-[#203880] font-semibold border-l-3 border-[#f8a000]'
                                                                : 'text-[#1e293b] hover:bg-[#f8fafd]'
                                                        }`
                                                    }
                                                >
                                                    <Icon className={`w-4 h-4 ${item.iconColor} shrink-0 mt-0.5`} />
                                                    <div className="leading-tight">
                                                        <div>{item.label}</div>
                                                        <div className="text-[11px] font-normal text-[#64748b] mt-0.5">
                                                            {item.desc}
                                                        </div>
                                                    </div>
                                                </NavLink>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            <NavLink to="/tentang" className={navLinkClass}>
                                <Info className="w-4 h-4" />
                                Tentang
                            </NavLink>

                            <NavLink to="/kontak" className={navLinkClass}>
                                <Phone className="w-4 h-4" />
                                Kontak
                            </NavLink>

                            <div className="w-px h-6 bg-[#dbe3f0] mx-2" />

                            {user ? (
                                <Link
                                    to="/admin"
                                    className="bs-btn bs-btn-sm bg-[#008a75] text-white hover:bg-[#006e5d] border-[#008a75]"
                                >
                                    <ShieldCheck className="w-4 h-4" />
                                    Panel Admin
                                </Link>
                            ) : (
                                <Link
                                    to="/login"
                                    className="bs-btn bs-btn-sm bg-[#f8a000] text-[#17285e] font-semibold hover:bg-[#e08e00] border-[#f8a000]"
                                >
                                    <LogIn className="w-4 h-4" />
                                    Login Pengelola
                                </Link>
                            )}
                        </div>

                        {/* Mobile Toggle */}
                        <button
                            type="button"
                            onClick={() => setMenuOpen((v) => !v)}
                            className="md:hidden p-2 rounded border border-[#dbe3f0] text-[#203880] hover:bg-[#eef4ff]"
                            aria-label="Toggle Menu"
                        >
                            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>

                    {/* Mobile Collapse Menu */}
                    {menuOpen && (
                        <div className="md:hidden pb-4 pt-2 border-t border-[#dbe3f0] space-y-1">
                            <NavLink
                                to="/"
                                end
                                onClick={() => setMenuOpen(false)}
                                className={mobileNavLinkClass}
                            >
                                <Home className="w-4 h-4" />
                                Beranda
                            </NavLink>

                            {/* Mobile Pengajuan Collapse */}
                            <div className="rounded bg-[#f8fafd] border border-[#eef2f9]">
                                <button
                                    type="button"
                                    onClick={() => setMobileDropdownOpen((prev) => !prev)}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded text-sm font-medium ${
                                        isPengajuanActive ? 'text-[#203880] font-semibold' : 'text-[#203880]'
                                    }`}
                                >
                                    <span className="flex items-center gap-2">
                                        <FileSpreadsheet className="w-4 h-4 text-[#0068b0]" />
                                        Pengajuan
                                    </span>
                                    <ChevronDown
                                        className={`w-4 h-4 transition-transform ${
                                            mobileDropdownOpen ? 'rotate-180' : ''
                                        }`}
                                    />
                                </button>

                                {mobileDropdownOpen && (
                                    <div className="pl-4 pr-2 pb-2 space-y-1">
                                        {pengajuanItems.map((item) => {
                                            const Icon = item.icon;
                                            return (
                                                <NavLink
                                                    key={item.to}
                                                    to={item.to}
                                                    onClick={() => setMenuOpen(false)}
                                                    className={mobileNavLinkClass}
                                                >
                                                    <Icon className="w-4 h-4" />
                                                    {item.label}
                                                </NavLink>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            <NavLink
                                to="/tentang"
                                onClick={() => setMenuOpen(false)}
                                className={mobileNavLinkClass}
                            >
                                <Info className="w-4 h-4" />
                                Tentang
                            </NavLink>

                            <NavLink
                                to="/kontak"
                                onClick={() => setMenuOpen(false)}
                                className={mobileNavLinkClass}
                            >
                                <Phone className="w-4 h-4" />
                                Kontak
                            </NavLink>

                            <Link
                                to={user ? '/admin' : '/login'}
                                onClick={() => setMenuOpen(false)}
                                className="flex items-center gap-2 px-3 py-2 rounded text-sm font-semibold bg-[#f8a000] text-[#17285e] mt-2"
                            >
                                {user ? <ShieldCheck className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                                {user ? 'Panel Admin' : 'Login Pengelola'}
                            </Link>
                        </div>
                    )}
                </nav>
            </header>

            {/* Main Content */}
            <main className="flex-1 py-6">
                <div className="bs-container">
                    <Outlet />
                </div>
            </main>

            {/* Double Track Branded Footer */}
            <footer className="bg-white border-t border-[#dbe3f0] py-5 text-xs text-[#64748b]">
                <div className="bs-container flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <img
                            src="/images/logo-dt.webp"
                            alt="Logo SMA Double Track"
                            className="h-8 w-auto object-contain"
                        />
                        <span>
                            <strong className="text-[#203880]">Ekosistem Alumni SMA Double Track</strong> — Dari
                            keterampilan menjadi penghasilan.
                        </span>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap justify-center">
                        <Link to="/tentang" className="hover:text-[#203880] font-medium hover:underline">
                            Tentang
                        </Link>
                        <span>•</span>
                        <Link to="/kontak" className="hover:text-[#203880] font-medium hover:underline">
                            Kontak
                        </Link>
                        <span>•</span>
                        <span className="text-[#203880] font-medium">
                            Ruang Modal • Ruang Tumbuh • Ruang Pasar
                        </span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
