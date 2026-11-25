import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
    Briefcase,
    ChevronDown,
    Clock,
    FileSpreadsheet,
    Home,
    Info,
    LogIn,
    Mail,
    MapPin,
    Menu,
    MessageCircle,
    Phone,
    ShieldCheck,
    Store,
    TrendingUp,
    User,
    UserPlus,
    X,
} from 'lucide-react';
import { isAlumniUser } from '../store/slices/authSlice';
import PublicLiveChatWidget from '../components/PublicLiveChatWidget';

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
            desc: 'Form pendaftaran produk & jasa ke etalase',
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

    const hasFullBleedHero = ['/', '/etalase-pasar', '/tentang', '/kontak'].includes(
        location.pathname
    );

    return (
        <div className="min-h-screen flex flex-col bg-[#f3f6fb] overflow-x-hidden">
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
                                    Ruang Alumni
                                </div>
                                <div className="text-[11px] font-semibold text-[#f8a000]">
                                    SMA Double Track
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

                            <NavLink to="/etalase-pasar" className={navLinkClass}>
                                <Store className="w-4 h-4" />
                                Etalase Pasar
                            </NavLink>

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
                                isAlumniUser(user) ? (
                                    <Link
                                        to="/alumni"
                                        className="bs-btn bs-btn-sm bg-[#203880] text-white hover:bg-[#17285e] border-[#203880]"
                                    >
                                        <User className="w-4 h-4 text-[#ffc010]" />
                                        Dashboard Alumni
                                    </Link>
                                ) : (
                                    <Link
                                        to="/admin"
                                        className="bs-btn bs-btn-sm bg-[#008a75] text-white hover:bg-[#006e5d] border-[#008a75]"
                                    >
                                        <ShieldCheck className="w-4 h-4" />
                                        Panel Admin
                                    </Link>
                                )
                            ) : (
                                <div className="flex items-center gap-1.5">
                                    <Link
                                        to="/register"
                                        className="bs-btn bs-btn-sm bs-btn-outline-primary"
                                    >
                                        <UserPlus className="w-3.5 h-3.5" />
                                        Daftar Alumni
                                    </Link>
                                    <Link
                                        to="/login"
                                        className="bs-btn bs-btn-sm bg-[#f8a000] text-[#17285e] font-semibold hover:bg-[#e08e00] border-[#f8a000]"
                                    >
                                        <LogIn className="w-4 h-4" />
                                        Masuk
                                    </Link>
                                </div>
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
                                to="/etalase-pasar"
                                onClick={() => setMenuOpen(false)}
                                className={mobileNavLinkClass}
                            >
                                <Store className="w-4 h-4" />
                                Etalase Pasar
                            </NavLink>

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

                            {user ? (
                                <Link
                                    to={isAlumniUser(user) ? '/alumni' : '/admin'}
                                    onClick={() => setMenuOpen(false)}
                                    className="flex items-center gap-2 px-3 py-2 rounded text-sm font-semibold bg-[#f8a000] text-[#17285e] mt-2"
                                >
                                    {isAlumniUser(user) ? (
                                        <User className="w-4 h-4" />
                                    ) : (
                                        <ShieldCheck className="w-4 h-4" />
                                    )}
                                    {isAlumniUser(user) ? 'Dashboard Alumni' : 'Panel Admin'}
                                </Link>
                            ) : (
                                <div className="grid grid-cols-2 gap-2 pt-2">
                                    <Link
                                        to="/register"
                                        onClick={() => setMenuOpen(false)}
                                        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded text-xs font-semibold border border-[#203880] text-[#203880]"
                                    >
                                        <UserPlus className="w-3.5 h-3.5" />
                                        Daftar Alumni
                                    </Link>
                                    <Link
                                        to="/login"
                                        onClick={() => setMenuOpen(false)}
                                        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded text-xs font-semibold bg-[#f8a000] text-[#17285e]"
                                    >
                                        <LogIn className="w-3.5 h-3.5" />
                                        Masuk
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </nav>
            </header>

            {/* Main Content */}
            <main className={`flex-1 ${hasFullBleedHero ? 'pb-6' : 'py-6'}`}>
                <div className="bs-container">
                    <Outlet />
                </div>
            </main>

            {/* Double Track Tall Multi-Column Footer */}
            <footer className="bg-white border-t border-[#dbe3f0] text-[#475569] mt-8">
                {/* Top Brand Spectrum Line */}
                <div className="h-1 w-full bg-gradient-to-r from-[#203880] via-[#0068b0] to-[#f8a000]" />

                <div className="bs-container py-10 md:py-12">
                    <div className="bs-row gap-y-8">
                        {/* Column 1: Logo & About Program */}
                        <div className="col-span-12 lg:col-span-4 space-y-3.5 pr-0 lg:pr-6">
                            <Link to="/" className="inline-block no-underline">
                                <img
                                    src="/images/logo-footer-dt.webp"
                                    alt="Logo SMA Double Track"
                                    className="h-16 w-auto object-contain"
                                />
                            </Link>
                            <div className="space-y-1.5">
                                <div className="font-bold text-base text-[#203880]">
                                    Ruang Alumni SMA Double Track
                                </div>
                                <p className="text-xs text-[#64748b] leading-relaxed">
                                    Platform terpadu pasca-pelatihan bagi lulusan SMA Double Track untuk mengubah
                                    keterampilan vokasional menjadi penghasilan melalui fasilitasi modal usaha/alat
                                    kerja, pendampingan mentor, dan etalase pemasaran produk alumni.
                                </p>
                            </div>
                            <div className="pt-1">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#eef4ff] text-[#203880] border border-[#dbe3f0] text-[11px] font-semibold">
                                    Dari Keterampilan Menjadi Penghasilan
                                </span>
                            </div>
                        </div>

                        {/* Column 2: Layanan Pengajuan */}
                        <div className="col-span-12 sm:col-span-6 lg:col-span-3 space-y-3">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-[#203880] border-b border-[#eef2f9] pb-2">
                                Layanan Pengajuan
                            </h3>
                            <ul className="space-y-2.5 text-xs">
                                <li>
                                    <Link
                                        to="/ruang-modal"
                                        className="flex items-start gap-2 text-[#475569] hover:text-[#203880] group no-underline"
                                    >
                                        <Briefcase className="w-4 h-4 text-[#0068b0] shrink-0 mt-0.5" />
                                        <div>
                                            <div className="font-semibold text-[#203880] group-hover:underline">
                                                Ruang Modal
                                            </div>
                                            <div className="text-[11px] text-[#64748b]">
                                                Fasilitasi alat kerja & modal produksi
                                            </div>
                                        </div>
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/ruang-tumbuh"
                                        className="flex items-start gap-2 text-[#475569] hover:text-[#203880] group no-underline"
                                    >
                                        <TrendingUp className="w-4 h-4 text-[#008a75] shrink-0 mt-0.5" />
                                        <div>
                                            <div className="font-semibold text-[#203880] group-hover:underline">
                                                Ruang Tumbuh
                                            </div>
                                            <div className="text-[11px] text-[#64748b]">
                                                Pendampingan karier & mentoring usaha
                                            </div>
                                        </div>
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/ruang-pasar"
                                        className="flex items-start gap-2 text-[#475569] hover:text-[#203880] group no-underline"
                                    >
                                        <Store className="w-4 h-4 text-[#f8a000] shrink-0 mt-0.5" />
                                        <div>
                                            <div className="font-semibold text-[#203880] group-hover:underline">
                                                Ruang Pasar
                                            </div>
                                            <div className="text-[11px] text-[#64748b]">
                                                Etalase produk & jasa unggulan alumni
                                            </div>
                                        </div>
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Column 3: Navigasi Portal */}
                        <div className="col-span-12 sm:col-span-6 lg:col-span-2 space-y-3">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-[#203880] border-b border-[#eef2f9] pb-2">
                                Navigasi Portal
                            </h3>
                            <ul className="space-y-2 text-xs">
                                <li>
                                    <Link to="/" className="text-[#475569] hover:text-[#203880] hover:underline">
                                        Beranda Utama
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/etalase-pasar"
                                        className="text-[#475569] hover:text-[#203880] hover:underline"
                                    >
                                        Katalog Etalase Pasar
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/tentang" className="text-[#475569] hover:text-[#203880] hover:underline">
                                        Tentang Program
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/kontak" className="text-[#475569] hover:text-[#203880] hover:underline">
                                        Kontak & FAQ
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to={user ? '/admin' : '/login'}
                                        className="text-[#475569] hover:text-[#203880] hover:underline"
                                    >
                                        {user ? 'Panel Admin Pengelola' : 'Login Pengelola'}
                                    </Link>
                                </li>
                                <li className="pt-1">
                                    <button
                                        type="button"
                                        onClick={() => window.dispatchEvent(new CustomEvent('dt-open-live-chat'))}
                                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0068b0] hover:text-[#203880] cursor-pointer"
                                    >
                                        <MessageCircle className="w-3.5 h-3.5 text-[#f8a000]" />
                                        Buka Live Chat
                                    </button>
                                </li>
                            </ul>
                        </div>

                        {/* Column 4: Sekretariat & Kontak */}
                        <div className="col-span-12 lg:col-span-3 space-y-3">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-[#203880] border-b border-[#eef2f9] pb-2">
                                Sekretariat Pengelola
                            </h3>
                            <ul className="space-y-2.5 text-xs text-[#64748b]">
                                <li className="flex items-start gap-2">
                                    <MapPin className="w-4 h-4 text-[#0068b0] shrink-0 mt-0.5" />
                                    <span>
                                        Pusat Pengelola Program SMA Double Track, Surabaya, Jawa Timur
                                    </span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-[#008a75] shrink-0" />
                                    <span>+62 812-3456-7890 (Helpdesk Alumni)</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-[#f8a000] shrink-0" />
                                    <span>ekosistem.alumni@doubletrack.sch.id</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Clock className="w-4 h-4 text-[#203880] shrink-0 mt-0.5" />
                                    <span>Senin – Jumat: 08.00 – 16.00 WIB</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bottom Copyright Bar */}
                <div className="bg-[#203880] text-[#dbeafe] py-3.5 text-xs">
                    <div className="bs-container flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
                        <span>
                            &copy; {new Date().getFullYear()}{' '}
                            <strong className="text-white">Ruang Alumni SMA Double Track</strong>. Diselenggarakan
                            oleh Dinas Pendidikan Provinsi Jawa Timur &amp; ITS.
                        </span>
                        <span className="text-[#ffc010] font-semibold">
                            Ruang Modal • Ruang Tumbuh • Ruang Pasar
                        </span>
                    </div>
                </div>
            </footer>
            {/* Floating Real-Time Live Chat Widget */}
            <PublicLiveChatWidget />
        </div>
    );
}
