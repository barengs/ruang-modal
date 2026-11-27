import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    CheckCircle2,
    ExternalLink,
    MessageCircle,
    Phone,
    RefreshCw,
    RotateCcw,
    Search,
    Send,
    Trash2,
    User,
} from 'lucide-react';
import api from '../../api/axios';
import ConfirmModal from '../../components/ConfirmModal';
import { formatDateTime, safeOrderUrl } from '../../utils/format';

const QUICK_REPLIES = [
    'Halo! Ada yang bisa kami bantu terkait layanan Ruang Alumni SMA Double Track?',
    'Pengajuan Anda telah kami terima dan sedang dalam tahap verifikasi tim pengelola.',
    'Silakan klik baris pengajuan Anda pada tabel Riwayat untuk melihat catatan detail dari admin.',
    'Terima kasih atas konfirmasinya, data Anda segera kami tindak lanjuti.',
];

function notifyChatChannel() {
    try {
        if (typeof BroadcastChannel !== 'undefined') {
            const bc = new BroadcastChannel('dt_live_chat');
            bc.postMessage({ type: 'chat_updated', ts: Date.now() });
            bc.close();
        }
    } catch {
        // ignore
    }
}

export default function AdminChatPage() {
    const [searchParams] = useSearchParams();
    const requestedSessionId = Number(searchParams.get('session')) || null;
    const [sessions, setSessions] = useState([]);
    const [totalUnread, setTotalUnread] = useState(0);
    const [activeId, setActiveId] = useState(requestedSessionId);
    const [activeSession, setActiveSession] = useState(null);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('semua');
    const [replyText, setReplyText] = useState('');
    const [sending, setSending] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, session: null });

    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (requestedSessionId) {
            setActiveId(requestedSessionId);
        }
    }, [requestedSessionId]);

    const fetchSessions = useCallback(async () => {
        try {
            const { data } = await api.get('/admin/chats');
            setSessions(data.data || []);
            setTotalUnread(data.total_unread || 0);
        } catch {
            // ignore
        }
    }, []);

    const fetchActiveSession = useCallback(async (id) => {
        if (!id) return;
        try {
            const { data } = await api.get(`/admin/chats/${id}`);
            setActiveSession(data.data);
            setSessions((prev) => {
                const hadUnread = prev.some((s) => s.id === id && s.unread_admin_count > 0);
                if (hadUnread) {
                    notifyChatChannel();
                }
                return prev.map((s) => (s.id === id ? { ...s, unread_admin_count: 0 } : s));
            });
        } catch {
            // ignore
        }
    }, []);

    // Initial load
    useEffect(() => {
        fetchSessions();
    }, [fetchSessions]);

    // Auto-select first session when sessions load
    useEffect(() => {
        if (sessions.length > 0 && !activeId) {
            setActiveId(sessions[0].id);
        }
    }, [sessions, activeId]);

    // Load active session details & poll every 2.5s for real-time updates
    useEffect(() => {
        if (activeId) {
            fetchActiveSession(activeId);
        }
        const timer = setInterval(() => {
            fetchSessions();
            if (activeId) {
                fetchActiveSession(activeId);
            }
        }, 2500);
        return () => clearInterval(timer);
    }, [activeId, fetchSessions, fetchActiveSession]);

    // Listen to BroadcastChannel for instant cross-tab updates
    useEffect(() => {
        let bc = null;
        try {
            if (typeof BroadcastChannel !== 'undefined') {
                bc = new BroadcastChannel('dt_live_chat');
                bc.onmessage = () => {
                    fetchSessions();
                    if (activeId) {
                        fetchActiveSession(activeId);
                    }
                };
            }
        } catch {
            // ignore
        }
        return () => {
            if (bc) bc.close();
        };
    }, [activeId, fetchSessions, fetchActiveSession]);

    // Auto-scroll to latest message
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [activeSession?.id, activeSession?.messages?.length]);

    const filteredSessions = useMemo(() => {
        return sessions.filter((s) => {
            if (filterStatus === 'unread' && !(s.unread_admin_count > 0)) return false;
            if (filterStatus === 'aktif' && s.status !== 'aktif') return false;
            if (filterStatus === 'selesai' && s.status !== 'selesai') return false;

            if (search.trim()) {
                const q = search.trim().toLowerCase();
                const matchName = (s.guest_name || '').toLowerCase().includes(q);
                const matchSchool = (s.guest_sekolah || '').toLowerCase().includes(q);
                const matchTopik = (s.topik || '').toLowerCase().includes(q);
                const matchWa = (s.guest_whatsapp || '').toLowerCase().includes(q);
                return matchName || matchSchool || matchTopik || matchWa;
            }
            return true;
        });
    }, [sessions, filterStatus, search]);

    const handleSendReply = async (e) => {
        e.preventDefault();
        if (!replyText.trim() || !activeSession || sending) return;
        const text = replyText.trim();
        setReplyText('');
        setSending(true);
        try {
            const { data } = await api.post(`/admin/chats/${activeSession.id}/messages`, {
                message: text,
            });
            setActiveSession(data.data);
            fetchSessions();
            notifyChatChannel();
        } catch (err) {
            setReplyText(text);
            toast.error(err.response?.data?.message || 'Gagal mengirim balasan chat.');
        } finally {
            setSending(false);
        }
    };

    const handleToggleStatus = async () => {
        if (!activeSession) return;
        const nextStatus = activeSession.status === 'aktif' ? 'selesai' : 'aktif';
        try {
            const { data } = await api.patch(`/admin/chats/${activeSession.id}/status`, {
                status: nextStatus,
            });
            setActiveSession(data.data);
            fetchSessions();
            notifyChatChannel();
            toast.success(`Status percakapan diubah menjadi ${nextStatus}.`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Gagal memperbarui status chat.');
        }
    };

    const handleDeleteSession = (sessionToDelete) => {
        setConfirmDelete({ isOpen: true, session: sessionToDelete });
    };

    const handleConfirmDeleteSession = async () => {
        if (!confirmDelete.session) return;
        const sessionToDelete = confirmDelete.session;
        setConfirmDelete({ isOpen: false, session: null });
        try {
            await api.delete(`/admin/chats/${sessionToDelete.id}`);
            const remaining = sessions.filter((s) => s.id !== sessionToDelete.id);
            setSessions(remaining);
            if (activeId === sessionToDelete.id) {
                setActiveId(remaining[0]?.id || null);
                setActiveSession(null);
            }
            notifyChatChannel();
            toast.success('Percakapan live chat berhasil dihapus.');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Gagal menghapus percakapan live chat.');
        }
    };

    return (
        <div className="space-y-4">
            <div className="bs-row items-start">
                {/* Left Column: Session List */}
                <div className="col-span-12 lg:col-span-4">
                    <div className="bs-card">
                        <div className="bs-card-header">
                            <span className="inline-flex items-center gap-2 text-sm">
                                <MessageCircle className="w-4 h-4 text-[#0068b0]" />
                                Daftar Percakapan
                            </span>
                            <div className="flex items-center gap-1.5">
                                {totalUnread > 0 && (
                                    <span className="bs-badge bs-badge-danger">
                                        {totalUnread} Belum Dibaca
                                    </span>
                                )}
                                <button
                                    type="button"
                                    onClick={() => {
                                        fetchSessions();
                                        if (activeId) fetchActiveSession(activeId);
                                    }}
                                    className="p-1 rounded text-[#64748b] hover:text-[#203880] hover:bg-[#eef4ff]"
                                    title="Segarkan"
                                >
                                    <RefreshCw className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>

                        {/* Search & Filter Toolbar */}
                        <div className="p-3 border-b border-[#dbe3f0] bg-[#f8fafd] space-y-2">
                            <div className="relative">
                                <Search className="w-3.5 h-3.5 text-[#64748b] absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari alumni, sekolah, topik..."
                                    className="bs-form-control pl-8 py-1.5 text-xs"
                                />
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {[
                                    { key: 'semua', label: 'Semua' },
                                    { key: 'unread', label: 'Belum Dibaca' },
                                    { key: 'aktif', label: 'Aktif' },
                                    { key: 'selesai', label: 'Selesai' },
                                ].map((tab) => (
                                    <button
                                        key={tab.key}
                                        type="button"
                                        onClick={() => setFilterStatus(tab.key)}
                                        className={`px-2.5 py-1 rounded text-[11px] font-semibold cursor-pointer transition-colors ${
                                            filterStatus === tab.key
                                                ? 'bg-[#203880] text-white'
                                                : 'bg-white text-[#475569] border border-[#dbe3f0] hover:bg-[#eef4ff]'
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Conversation Items */}
                        <div className="divide-y divide-[#dbe3f0] max-h-[520px] overflow-y-auto">
                            {filteredSessions.length === 0 ? (
                                <div className="p-6 text-center text-xs text-[#64748b]">
                                    Tidak ada percakapan ditemukan.
                                </div>
                            ) : (
                                filteredSessions.map((s) => {
                                    const isSelected = s.id === activeId;
                                    const lastMsg = s.latest_message?.message || 'Percakapan dimulai';
                                    return (
                                        <div
                                            key={s.id}
                                            onClick={() => setActiveId(s.id)}
                                            className={`p-3.5 cursor-pointer transition-colors ${
                                                isSelected
                                                    ? 'bg-[#203880] text-white border-l-4 border-l-[#f8a000]'
                                                    : 'bg-white text-[#1e293b] hover:bg-[#eef4ff]'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0">
                                                    <div
                                                        className={`font-semibold text-sm truncate ${
                                                            isSelected ? 'text-white' : 'text-[#203880]'
                                                        }`}
                                                    >
                                                        {s.guest_name}
                                                    </div>
                                                    <div
                                                        className={`text-[11px] truncate ${
                                                            isSelected ? 'text-[#dbeafe]' : 'text-[#64748b]'
                                                        }`}
                                                    >
                                                        {s.guest_sekolah || 'Alumni Double Track'}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    <span
                                                        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                                            isSelected
                                                                ? 'bg-white/15 text-[#ffc010]'
                                                                : 'bg-[#e6f2ff] text-[#00528c]'
                                                        }`}
                                                    >
                                                        {s.topik}
                                                    </span>
                                                    {s.unread_admin_count > 0 && (
                                                        <span className="px-1.5 py-0.5 rounded-full bg-[#e11d48] text-white text-[10px] font-bold">
                                                            {s.unread_admin_count}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <p
                                                className={`text-xs truncate mt-1.5 ${
                                                    isSelected ? 'text-white/90' : 'text-[#475569]'
                                                }`}
                                            >
                                                {lastMsg}
                                            </p>

                                            <div
                                                className={`flex items-center justify-between text-[10px] mt-1.5 ${
                                                    isSelected ? 'text-[#bfd9f2]' : 'text-[#64748b]'
                                                }`}
                                            >
                                                <span>{formatDateTime(s.last_message_at || s.created_at)}</span>
                                                <span className="uppercase font-semibold">{s.status}</span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Active Real-Time Chat Room */}
                <div className="col-span-12 lg:col-span-8">
                    <div className="bs-card min-h-[580px] flex flex-col">
                        {!activeSession ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-sm text-[#64748b]">
                                <MessageCircle className="w-10 h-10 text-[#cbd5e1] mb-2" />
                                <div>Pilih salah satu percakapan di sisi kiri untuk membalas pesan pengguna.</div>
                            </div>
                        ) : (
                            <>
                                {/* Chat Room Header */}
                                <div className="bs-card-header flex-col sm:flex-row sm:items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-[#e6f2ff] text-[#203880] flex items-center justify-center font-bold">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h2 className="text-base font-bold text-[#203880]">
                                                    {activeSession.guest_name}
                                                </h2>
                                                <span className="bs-badge bs-badge-info">
                                                    {activeSession.topik}
                                                </span>
                                                <span
                                                    className={`bs-badge ${
                                                        activeSession.status === 'aktif'
                                                            ? 'bs-badge-success'
                                                            : 'bs-badge-secondary'
                                                    }`}
                                                >
                                                    {activeSession.status === 'aktif' ? 'Aktif' : 'Selesai'}
                                                </span>
                                            </div>
                                            <div className="text-xs font-normal text-[#64748b] flex items-center gap-2 flex-wrap mt-0.5">
                                                <span>
                                                    Sekolah:{' '}
                                                    <strong>{activeSession.guest_sekolah || '-'}</strong>
                                                </span>
                                                {activeSession.guest_whatsapp && (
                                                    <>
                                                        <span>•</span>
                                                        <a
                                                            href={safeOrderUrl(activeSession.guest_whatsapp)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 text-[#0068b0] hover:underline font-medium"
                                                        >
                                                            <Phone className="w-3 h-3" />
                                                            {activeSession.guest_whatsapp}
                                                            <ExternalLink className="w-3 h-3" />
                                                        </a>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={handleToggleStatus}
                                            className={`bs-btn bs-btn-sm ${
                                                activeSession.status === 'aktif'
                                                    ? 'bs-btn-success'
                                                    : 'bs-btn-outline-primary'
                                            }`}
                                        >
                                            {activeSession.status === 'aktif' ? (
                                                <>
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                    Tandai Selesai
                                                </>
                                            ) : (
                                                <>
                                                    <RotateCcw className="w-3.5 h-3.5" />
                                                    Buka Kembali
                                                </>
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteSession(activeSession)}
                                            className="bs-btn bs-btn-sm bs-btn-outline-danger"
                                            title="Hapus Percakapan"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Messages Thread */}
                                <div className="p-4 space-y-3 overflow-y-auto flex-1 bg-[#f3f6fb] max-h-[390px] min-h-[340px]">
                                    {(activeSession.messages || []).map((msg) => {
                                        const isAdmin = msg.sender_type === 'admin';
                                        return (
                                            <div
                                                key={msg.id}
                                                className={`flex flex-col ${
                                                    isAdmin ? 'items-end' : 'items-start'
                                                }`}
                                            >
                                                <div className="text-[11px] text-[#64748b] mb-1 px-1">
                                                    <strong>{msg.sender_name}</strong> (
                                                    {isAdmin ? 'Admin' : 'Pengguna'}) •{' '}
                                                    {formatDateTime(msg.created_at)}
                                                </div>
                                                <div
                                                    className={`max-w-[78%] px-3.5 py-2.5 rounded-lg text-xs sm:text-sm leading-relaxed shadow-2xs ${
                                                        isAdmin
                                                            ? 'bg-[#203880] text-white rounded-br-none'
                                                            : 'bg-white text-[#1e293b] border border-[#dbe3f0] rounded-bl-none'
                                                    }`}
                                                >
                                                    <p className="whitespace-pre-line break-words">
                                                        {msg.message}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Quick Reply Templates */}
                                <div className="px-4 py-2 bg-[#f8fafd] border-t border-[#dbe3f0] flex items-center gap-1.5 overflow-x-auto">
                                    <span className="text-[11px] font-semibold text-[#64748b] shrink-0">
                                        Balasan Cepat:
                                    </span>
                                    {QUICK_REPLIES.map((tpl, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => setReplyText(tpl)}
                                            className="px-2.5 py-1 rounded-full bg-white border border-[#dbe3f0] hover:border-[#0068b0] hover:bg-[#eef4ff] text-[11px] text-[#203880] whitespace-nowrap cursor-pointer transition-colors"
                                        >
                                            {tpl.length > 42 ? `${tpl.slice(0, 42)}...` : tpl}
                                        </button>
                                    ))}
                                </div>

                                {/* Reply Input Box */}
                                <form
                                    onSubmit={handleSendReply}
                                    className="p-3.5 bg-white border-t border-[#dbe3f0] flex items-center gap-2"
                                >
                                    <input
                                        type="text"
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        placeholder={`Balas pesan ke ${activeSession.guest_name}...`}
                                        className="bs-form-control"
                                    />
                                    <button
                                        type="submit"
                                        disabled={sending || !replyText.trim()}
                                        className="bs-btn bs-btn-primary shrink-0"
                                    >
                                        <Send className="w-4 h-4" />
                                        {sending ? 'Mengirim...' : 'Kirim Balasan'}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={confirmDelete.isOpen}
                onClose={() => setConfirmDelete({ isOpen: false, session: null })}
                onConfirm={handleConfirmDeleteSession}
                title="Hapus Percakapan Live Chat"
                message={`Apakah Anda yakin ingin menghapus seluruh percakapan dengan "${confirmDelete.session?.guest_name}"? Riwayat pesan tidak dapat dikembalikan.`}
                confirmText="Ya, Hapus"
                variant="danger"
            />
        </div>
    );
}
