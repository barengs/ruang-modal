import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Check, CheckCircle2, Clock, HelpCircle, Mail, MapPin, MessageSquare, Phone, Send } from 'lucide-react';
import { fetchPublicMasterOptions } from '../../store/slices/publicSlice';

const INITIAL_CONTACT = {
    nama: '',
    email: '',
    whatsapp: '',
    subjek: '',
    pesan: '',
};

export default function KontakPage() {
    const dispatch = useDispatch();
    const { masterOptions } = useSelector((state) => state.publicData);
    const [form, setForm] = useState(INITIAL_CONTACT);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        dispatch(fetchPublicMasterOptions());
    }, [dispatch]);

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
        setForm(INITIAL_CONTACT);
    };

    const faqs = [
        {
            q: 'Siapa saja yang dapat mengajukan layanan di portal ini?',
            a: 'Seluruh alumni SMA penyelenggara program Double Track yang telah menyelesaikan pelatihan keterampilan vokasional.',
        },
        {
            q: 'Apakah pengajuan Ruang Modal otomatis disetujui?',
            a: 'Setiap pengajuan akan melalui tahapan verifikasi dan kurasi oleh tim pengelola berdasarkan kelayakan rencana usaha atau kesiapan kerja.',
        },
        {
            q: 'Bagaimana cara memantau status pengajuan saya?',
            a: 'Simpan kode pengajuan yang muncul setelah mengirim formulir. Tim pengelola akan menghubungi Anda melalui WhatsApp atau email yang terdaftar.',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Compact Full-Bleed Hero Banner (Matching Beranda Style) */}
            <section className="w-screen relative left-1/2 -translate-x-1/2 bg-[#243271] text-white py-8 md:py-10 overflow-hidden shadow-sm">
                <div
                    className="pointer-events-none absolute -top-20 -left-20 w-72 h-72 rounded-full opacity-20 blur-3xl"
                    style={{ background: 'radial-gradient(circle, #38bdf8 0%, transparent 70%)' }}
                />
                <div
                    className="pointer-events-none absolute -bottom-16 right-1/4 w-80 h-80 rounded-full opacity-20 blur-3xl"
                    style={{ background: 'radial-gradient(circle, #0d4cc4 0%, transparent 70%)' }}
                />

                <div className="bs-container relative z-10">
                    <div className="grid grid-cols-12 items-center gap-6">
                        <div className="col-span-12 lg:col-span-8 space-y-3">
                            <p className="text-xs sm:text-sm font-medium text-white/95 tracking-wide">
                                Layanan Bantuan &amp; Konsultasi{' '}
                                <span className="text-[#ffb703] font-bold">Sekretariat Double Track</span>
                            </p>
                            <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight tracking-tight text-white">
                                Kontak &amp; Pusat Bantuan Pengelola
                            </h1>
                            <p className="text-xs sm:text-sm text-[#dbeafe] leading-relaxed max-w-2xl">
                                Punya pertanyaan seputar pengajuan Ruang Modal, jadwal mentoring Ruang Tumbuh, atau
                                kurasi etalase Ruang Pasar? Hubungi tim pengelola melalui Live Chat atau kanal resmi di
                                bawah ini.
                            </p>
                            <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1">
                                {[
                                    'Respon Cepat via Live Chat',
                                    'Helpdesk WhatsApp & Email',
                                    'Senin – Jumat (08.00 – 16.00 WIB)',
                                ].map((item) => (
                                    <li
                                        key={item}
                                        className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-white"
                                    >
                                        <span className="w-4 h-4 rounded-full bg-[#14b8a6] text-white inline-flex items-center justify-center shrink-0">
                                            <Check className="w-3 h-3 stroke-[3]" />
                                        </span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="col-span-12 lg:col-span-4 flex lg:justify-end">
                            <div className="w-full sm:w-auto min-w-[260px] bg-[#1a2563]/90 backdrop-blur-md border border-white/30 rounded-xl p-4 shadow-xl space-y-3">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <div className="text-[11px] text-[#cbd5e1] font-medium">
                                            Status Helpdesk Alumni
                                        </div>
                                        <div className="text-sm font-extrabold text-white flex items-center gap-1.5 mt-0.5">
                                            <span className="w-2.5 h-2.5 rounded-full bg-[#34d399] animate-pulse" />
                                            Siap Melayani Konsultasi
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => window.dispatchEvent(new CustomEvent('dt-open-live-chat'))}
                                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#f26722] to-[#f9841a] hover:from-[#e05815] hover:to-[#eb770e] text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
                                >
                                    <MessageSquare className="w-4 h-4" />
                                    Mulai Live Chat Real-Time
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="bs-row">
                {/* Informasi Kontak */}
                <div className="col-span-12 lg:col-span-5 space-y-4">
                    <div className="bs-card">
                        <div className="bs-card-header">
                            <span>Informasi Sekretariat Pengelola</span>
                        </div>
                        <div className="bs-card-body space-y-4 text-sm">
                            <div className="flex items-start gap-3">
                                <div className="w-9 h-9 rounded bg-[#e7f1ff] text-[#0068b0] flex items-center justify-center shrink-0">
                                    <MapPin className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="font-semibold text-[#203880]">Alamat Sekretariat</div>
                                    <p className="text-xs text-[#6c757d] mt-0.5 leading-relaxed">
                                        Pusat Pengelola Program SMA Double Track
                                        <br />
                                        Surabaya, Jawa Timur, Indonesia
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-9 h-9 rounded bg-[#d1e7dd] text-[#198754] flex items-center justify-center shrink-0">
                                    <Phone className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="font-semibold text-[#203880]">Telepon / WhatsApp Helpdesk</div>
                                    <p className="text-xs text-[#6c757d] mt-0.5">+62 812-3456-7890 (Chat Layanan Alumni)</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-9 h-9 rounded bg-[#fff3cd] text-[#f59e0b] flex items-center justify-center shrink-0">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="font-semibold text-[#203880]">Surat Elektronik (Email)</div>
                                    <p className="text-xs text-[#6c757d] mt-0.5">ekosistem.alumni@doubletrack.sch.id</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-9 h-9 rounded bg-[#e9ecef] text-[#495057] flex items-center justify-center shrink-0">
                                    <Clock className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="font-semibold text-[#203880]">Jam Operasional Layanan</div>
                                    <p className="text-xs text-[#6c757d] mt-0.5">
                                        Senin – Jumat: 08.00 – 16.00 WIB
                                        <br />
                                        Sabtu, Minggu & Hari Libur Nasional: Tutup
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* FAQ Singkat */}
                    <div className="bs-card">
                        <div className="bs-card-header">
                            <span className="inline-flex items-center gap-2">
                                <HelpCircle className="w-4 h-4 text-[#0068b0]" />
                                Pertanyaan Umum (FAQ)
                            </span>
                        </div>
                        <div className="bs-card-body space-y-3">
                            {faqs.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="p-3 rounded border border-[#dee2e6] bg-[#fcfcfd] space-y-1"
                                >
                                    <div className="font-semibold text-xs text-[#203880]">{item.q}</div>
                                    <p className="text-xs text-[#6c757d] leading-relaxed">{item.a}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Form Kirim Pesan */}
                <div className="col-span-12 lg:col-span-7">
                    <div className="bs-card">
                        <div className="bs-card-header">
                            <div>
                                <h2 className="text-base font-bold text-[#203880]">Kirim Pesan atau Pertanyaan</h2>
                                <p className="text-xs font-normal text-[#6c757d]">
                                    Isi formulir berikut untuk menyampaikan pertanyaan, kendala teknis, atau saran.
                                </p>
                            </div>
                        </div>
                        <div className="bs-card-body">
                            {submitted && (
                                <div className="bs-alert bs-alert-success mb-4">
                                    <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                                    <div>
                                        <div className="font-semibold">Pesan Anda berhasil dikirim!</div>
                                        <div className="text-xs mt-0.5">
                                            Terima kasih telah menghubungi kami. Tim pengelola akan menindaklanjuti pesan
                                            Anda melalui email atau WhatsApp.
                                        </div>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="bs-row">
                                    <div className="col-span-12 md:col-span-6">
                                        <label className="bs-form-label">Nama Lengkap *</label>
                                        <input
                                            name="nama"
                                            value={form.nama}
                                            onChange={handleChange}
                                            required
                                            placeholder="Masukkan nama lengkap"
                                            className="bs-form-control"
                                        />
                                    </div>
                                    <div className="col-span-12 md:col-span-6">
                                        <label className="bs-form-label">Email *</label>
                                        <input
                                            name="email"
                                            type="email"
                                            value={form.email}
                                            onChange={handleChange}
                                            required
                                            placeholder="nama@email.com"
                                            className="bs-form-control"
                                        />
                                    </div>
                                    <div className="col-span-12 md:col-span-6">
                                        <label className="bs-form-label">Nomor WhatsApp *</label>
                                        <input
                                            name="whatsapp"
                                            value={form.whatsapp}
                                            onChange={handleChange}
                                            required
                                            placeholder="08xxxxxxxxxx"
                                            className="bs-form-control"
                                        />
                                    </div>
                                    <div className="col-span-12 md:col-span-6">
                                        <label className="bs-form-label">Topik / Subjek *</label>
                                        <select
                                            name="subjek"
                                            value={form.subjek}
                                            onChange={handleChange}
                                            required
                                            className="bs-form-select"
                                        >
                                            <option value="">Pilih Topik</option>
                                            {(masterOptions?.topik_kontak || []).map((topik) => (
                                                <option key={topik} value={topik}>
                                                    {topik}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="bs-form-label">Isi Pesan / Pertanyaan *</label>
                                    <textarea
                                        name="pesan"
                                        rows="5"
                                        value={form.pesan}
                                        onChange={handleChange}
                                        required
                                        placeholder="Tuliskan pertanyaan atau detail kendala yang Anda alami (sertakan kode pengajuan bila ada)..."
                                        className="bs-form-control"
                                    />
                                </div>

                                <div className="pt-1">
                                    <button type="submit" className="bs-btn bs-btn-primary">
                                        <Send className="w-4 h-4" />
                                        Kirim Pesan
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
