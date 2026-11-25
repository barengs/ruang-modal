import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    CheckCircle2,
    MessageCircle,
    Minimize2,
    RotateCcw,
    Send,
    Sparkles,
    User,
} from 'lucide-react';
import api from '../api/axios';

const CHAT_TOKEN_KEY = 'dt_live_chat_session_token';
const TOPIK_OPTIONS = ['Ruang Modal', 'Ruang Tumbuh', 'Ruang Pasar', 'Umum'];

function notifyChatChannel() {
    try {
        if (typeof BroadcastChannel !== 'undefined') {
            const bc = new BroadcastChannel('dt_live_chat');
            bc.postMessage({ type: 'chat_updated', ts: Date.now() });
            bc.close();
        }
    } catch {
        // ignore if unsupported
    }
}

function formatChatTime(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return new Intl.DateTimeFormat('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
    }).format(d);
}

export default function PublicLiveChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [token, setToken] = useState(() => {
        try {
            return localStorage.getItem(CHAT_TOKEN_KEY) || '';
        } catch {
            return '';
        }
    });
    const [session, setSession] = useState(null);
    const [starting, setStarting] = useState(false);
    const [sending, setSending] = useState(false);
    const [inputMsg, setInputMsg] = useState('');
    const [startForm, setStartForm] = useState({
        guest_name: '',
        guest_sekolah: '',
        guest_whatsapp: '',
        topik: 'Ruang Modal',
        message: '',
    });

    const messagesEndRef = useRef(null);

    const fetchSession = useCallback(
        async (currentToken, markRead = false) => {
            if (!currentToken) return;
            try {
                const { data } = await api.get(`/public/chat/${currentToken}`, {
                    params: markRead ? { mark_read: 1 } : {},
                });
                setSession(data.session);
            } catch (err) {
                if (err.response?.status === 404) {
                    setToken('');
                    setSession(null);
                    try {
                        localStorage.removeItem(CHAT_TOKEN_KEY);
                    } catch {
                        // ignore
                    }
                }
            }
        },
        []
    );

    // Load initial session & poll every 2.5s for real-time updates
    useEffect(() => {
        if (!token) return;
        fetchSession(token, isOpen);
        const timer = setInterval(() => {
            fetchSession(token, isOpen);
        }, 2500);
        return () => clearInterval(timer);
    }, [token, isOpen, fetchSession]);

    // Listen to BroadcastChannel & custom open-chat event
    useEffect(() => {
        const handleOpenEvent = () => setIsOpen(true);
        window.addEventListener('dt-open-live-chat', handleOpenEvent);

        let bc = null;
        try {
            if (typeof BroadcastChannel !== 'undefined') {
                bc = new BroadcastChannel('dt_live_chat');
                bc.onmessage = () => {
                    if (token) {
                        fetchSession(token, isOpen);
                    }
                };
            }
        } catch {
            // ignore
        }

        return () => {
            window.removeEventListener('dt-open-live-chat', handleOpenEvent);
            if (bc) bc.close();
        };
    }, [token, isOpen, fetchSession]);

    // Auto-scroll to bottom when messages change or chat opens
    useEffect(() => {
        if (isOpen && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [isOpen, session?.messages?.length]);

    const handleStartChat = async (e) => {
        e.preventDefault();
        if (!startForm.guest_name.trim() || !startForm.message.trim()) return;
        setStarting(true);
        try {
            const { data } = await api.post('/public/chat/start', startForm);
            const newToken = data.session.session_token;
            setToken(newToken);
            setSession(data.session);
            try {
                localStorage.setItem(CHAT_TOKEN_KEY, newToken);
            } catch {
                // ignore
            }
            notifyChatChannel();
        } catch {
            // ignore
        } finally {
            setStarting(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputMsg.trim() || !token || sending) return;
        const text = inputMsg.trim();
        setInputMsg('');
        setSending(true);
        try {
            const { data } = await api.post(`/public/chat/${token}/messages`, {
                message: text,
            });
            setSession(data.session);
            notifyChatChannel();
        } catch {
            setInputMsg(text);
        } finally {
            setSending(false);
        }
    };

    const handleResetSession = () => {
        if (!window.confirm('Mulai sesi percakapan baru?')) return;
        setToken('');
        setSession(null);
        setStartForm((prev) => ({ ...prev, message: '' }));
        try {
            localStorage.removeItem(CHAT_TOKEN_KEY);
        } catch {
            // ignore
        }
    };

    const unreadCount = session?.unread_guest_count || 0;

    return (
        <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-3 w-[350px] sm:w-[390px] bg-white rounded-lg shadow-2xl border border-[#dbe3f0] overflow-hidden flex flex-col max-h-[540px]">
                    {/* Top Brand Header */}
                    <div className="bg-gradient-to-r from-[#203880] via-[#0068b0] to-[#1098e0] text-white px-4 py-3 border-b-3 border-[#f8a000] flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="relative w-9 h-9 rounded-full bg-white/15 border border-white/25 flex items-center justify-center">
                                <MessageCircle className="w-5 h-5 text-[#ffc010]" />
                                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#10b981] border-2 border-[#203880]" />
                            </div>
                            <div className="leading-tight">
                                <div className="font-bold text-sm">Live Chat Pengelola</div>
                                <div className="text-[11px] text-[#e6f2ff] flex items-center gap-1">
                                    <span>Helpdesk SMA Double Track</span>
                                    <span>•</span>
                                    <span className="text-[#ffc010] font-semibold">Online</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-1">
                            {session && (
                                <button
                                    type="button"
                                    onClick={handleResetSession}
                                    title="Mulai Percakapan Baru"
                                    className="p-1.5 rounded text-white/80 hover:text-white hover:bg-white/15 cursor-pointer"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                title="Tutup Jendela Chat"
                                className="p-1.5 rounded text-white/80 hover:text-white hover:bg-white/15 cursor-pointer"
                            >
                                <Minimize2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Content: Start Form OR Real-Time Conversation */}
                    {!session ? (
                        <form onSubmit={handleStartChat} className="p-4 space-y-3 overflow-y-auto text-xs">
                            <div className="p-2.5 rounded bg-[#f8fafd] border border-[#dbe3f0] text-[#475569] leading-relaxed">
                                Silakan isi identitas singkat di bawah ini untuk memulai percakapan <em>real-time</em>{' '}
                                dengan tim pengelola SMA Double Track.
                            </div>

                            <div>
                                <label className="bs-form-label text-xs">Nama Lengkap *</label>
                                <input
                                    type="text"
                                    required
                                    value={startForm.guest_name}
                                    onChange={(e) =>
                                        setStartForm((p) => ({ ...p, guest_name: e.target.value }))
                                    }
                                    placeholder="Masukkan nama Anda"
                                    className="bs-form-control text-xs py-1.5"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="bs-form-label text-xs">Asal Sekolah</label>
                                    <input
                                        type="text"
                                        value={startForm.guest_sekolah}
                                        onChange={(e) =>
                                            setStartForm((p) => ({ ...p, guest_sekolah: e.target.value }))
                                        }
                                        placeholder="SMAN 1 ..."
                                        className="bs-form-control text-xs py-1.5"
                                    />
                                </div>
                                <div>
                                    <label className="bs-form-label text-xs">No. WhatsApp</label>
                                    <input
                                        type="text"
                                        value={startForm.guest_whatsapp}
                                        onChange={(e) =>
                                            setStartForm((p) => ({ ...p, guest_whatsapp: e.target.value }))
                                        }
                                        placeholder="08xxxxxxxxxx"
                                        className="bs-form-control text-xs py-1.5"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="bs-form-label text-xs">Topik Pertanyaan</label>
                                <select
                                    value={startForm.topik}
                                    onChange={(e) =>
                                        setStartForm((p) => ({ ...p, topik: e.target.value }))
                                    }
                                    className="bs-form-select text-xs py-1.5"
                                >
                                    {TOPIK_OPTIONS.map((t) => (
                                        <option key={t} value={t}>
                                            {t}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="bs-form-label text-xs">Pesan / Pertanyaan *</label>
                                <textarea
                                    rows="3"
                                    required
                                    value={startForm.message}
                                    onChange={(e) =>
                                        setStartForm((p) => ({ ...p, message: e.target.value }))
                                    }
                                    placeholder="Tuliskan pertanyaan Anda..."
                                    className="bs-form-control text-xs py-1.5"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={starting}
                                className="bs-btn bs-btn-primary w-full py-2 text-xs font-semibold"
                            >
                                <Send className="w-3.5 h-3.5" />
                                {starting ? 'Memulai Chat...' : 'Mulai Live Chat Sekarang'}
                            </button>
                        </form>
                    ) : (
                        <>
                            {/* Session Info Sub-bar */}
                            <div className="px-3.5 py-2 bg-[#f8fafd] border-b border-[#dbe3f0] flex items-center justify-between text-[11px] text-[#64748b]">
                                <span className="inline-flex items-center gap-1.5 truncate">
                                    <User className="w-3.5 h-3.5 text-[#0068b0] shrink-0" />
                                    <strong className="text-[#203880] truncate">{session.guest_name}</strong>
                                    <span className="bs-badge bs-badge-info text-[10px] py-0 px-1.5">
                                        {session.topik}
                                    </span>
                                </span>
                                <span
                                    className={`font-semibold ${
                                        session.status === 'selesai' ? 'text-[#008a75]' : 'text-[#0068b0]'
                                    }`}
                                >
                                    {session.status === 'selesai' ? 'Selesai' : 'Aktif'}
                                </span>
                            </div>

                            {/* Messages List */}
                            <div className="p-3.5 space-y-2.5 overflow-y-auto flex-1 bg-[#f3f6fb] min-h-[260px] max-h-[340px]">
                                {(session.messages || []).map((msg) => {
                                    const isGuest = msg.sender_type === 'guest';
                                    return (
                                        <div
                                            key={msg.id}
                                            className={`flex flex-col ${
                                                isGuest ? 'items-end' : 'items-start'
                                            }`}
                                        >
                                            <div className="text-[10px] text-[#64748b] mb-0.5 px-1">
                                                {isGuest ? 'Anda' : msg.sender_name} •{' '}
                                                {formatChatTime(msg.created_at)}
                                            </div>
                                            <div
                                                className={`max-w-[82%] px-3 py-2 rounded-lg text-xs leading-relaxed shadow-2xs ${
                                                    isGuest
                                                        ? 'bg-[#203880] text-white rounded-br-none'
                                                        : 'bg-white text-[#1e293b] border border-[#dbe3f0] rounded-bl-none'
                                                }`}
                                            >
                                                <p className="whitespace-pre-line break-words">{msg.message}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Status Selesai Notice */}
                            {session.status === 'selesai' && (
                                <div className="px-3 py-1.5 bg-[#e0f7f4] border-t border-[#99e6db] text-[11px] text-[#00594b] flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                    <span>
                                        Sesi ditandai selesai. Kirim pesan di bawah jika masih ada pertanyaan.
                                    </span>
                                </div>
                            )}

                            {/* Message Input Box */}
                            <form
                                onSubmit={handleSendMessage}
                                className="p-2.5 bg-white border-t border-[#dbe3f0] flex items-center gap-2"
                            >
                                <input
                                    type="text"
                                    value={inputMsg}
                                    onChange={(e) => setInputMsg(e.target.value)}
                                    placeholder="Ketik pesan balasan..."
                                    className="bs-form-control text-xs py-2"
                                />
                                <button
                                    type="submit"
                                    disabled={sending || !inputMsg.trim()}
                                    className="bs-btn bs-btn-primary px-3 py-2 shrink-0"
                                    aria-label="Kirim Pesan"
                                >
                                    <Send className="w-3.5 h-3.5" />
                                </button>
                            </form>
                        </>
                    )}
                </div>
            )}

            {/* Floating Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen((v) => !v)}
                className="relative inline-flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#203880] hover:bg-[#17285e] text-white font-semibold text-sm shadow-lg border-2 border-[#f8a000] transition-transform hover:scale-105 cursor-pointer"
            >
                <MessageCircle className="w-5 h-5 text-[#ffc010]" />
                <span>Live Chat</span>
                {unreadCount > 0 && !isOpen && (
                    <span className="px-1.5 py-0.5 rounded-full bg-[#e11d48] text-white text-[11px] font-bold">
                        {unreadCount}
                    </span>
                )}
            </button>
        </div>
    );
}
