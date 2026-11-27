import React, { useEffect, useState } from 'react';
import {
    AlertCircle,
    Download,
    ExternalLink,
    File,
    FileSpreadsheet,
    FileText,
    Image as ImageIcon,
    Loader2,
    Maximize2,
    Minimize2,
    RotateCcw,
    X,
    ZoomIn,
    ZoomOut,
} from 'lucide-react';

/**
 * Deteksi kategori berkas berdasarkan ekstensi
 */
function getFileType(filename = '') {
    const ext = filename.split('.').pop()?.toLowerCase() || '';

    if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'bmp'].includes(ext)) {
        return { type: 'image', ext, label: 'Gambar', color: 'bg-emerald-100 text-emerald-800' };
    }
    if (ext === 'pdf') {
        return { type: 'pdf', ext, label: 'PDF', color: 'bg-rose-100 text-rose-800' };
    }
    if (['doc', 'docx'].includes(ext)) {
        return { type: 'word', ext, label: 'Word Document', color: 'bg-blue-100 text-blue-800' };
    }
    if (['xls', 'xlsx', 'csv'].includes(ext)) {
        return { type: 'excel', ext, label: 'Spreadsheet / Excel', color: 'bg-emerald-100 text-emerald-800' };
    }
    if (['ppt', 'pptx'].includes(ext)) {
        return { type: 'powerpoint', ext, label: 'Presentasi', color: 'bg-amber-100 text-amber-800' };
    }
    if (['txt', 'log', 'json', 'md'].includes(ext)) {
        return { type: 'text', ext, label: 'Teks', color: 'bg-slate-100 text-slate-800' };
    }
    return { type: 'other', ext: ext || 'file', label: 'Dokumen', color: 'bg-slate-100 text-slate-700' };
}

export default function DocumentPreviewModal({
    isOpen,
    onClose,
    fileUrl,
    title = 'Pratinjau Dokumen Lampiran',
    filename: customFilename,
}) {
    const [zoom, setZoom] = useState(1);
    const [imgLoading, setImgLoading] = useState(true);
    const [imgError, setImgError] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Reset zoom and error states when modal opens or fileUrl changes
    useEffect(() => {
        if (isOpen) {
            setZoom(1);
            setImgLoading(true);
            setImgError(false);
            setIsFullscreen(false);
        }
    }, [isOpen, fileUrl]);

    // Keyboard listener for Escape key to close modal
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen || !fileUrl) return null;

    const filename = customFilename || fileUrl.split('/').pop() || 'dokumen-lampiran';
    const { type, ext, label, color } = getFileType(filename);

    const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
    const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
    const handleResetZoom = () => setZoom(1);

    const renderFileIcon = () => {
        switch (type) {
            case 'image':
                return <ImageIcon className="w-5 h-5 text-emerald-600" />;
            case 'pdf':
                return <FileText className="w-5 h-5 text-rose-600" />;
            case 'word':
                return <FileText className="w-5 h-5 text-blue-600" />;
            case 'excel':
                return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />;
            default:
                return <File className="w-5 h-5 text-[#0068b0]" />;
        }
    };

    return (
        <div
            className="bs-modal-backdrop z-50 p-2 sm:p-4 overflow-y-auto"
            onClick={onClose}
        >
            <div
                className={`bs-modal-dialog transition-all duration-200 flex flex-col bg-white rounded-xl shadow-2xl overflow-hidden border border-[#dbe3f0] ${
                    isFullscreen ? 'w-full h-full max-w-none max-h-none rounded-none' : 'w-full max-w-5xl h-[88vh] max-h-[92vh]'
                }`}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
            >
                {/* MODAL HEADER */}
                <div className="bs-modal-header py-3 px-4 bg-white border-b border-[#e2e8f0] flex items-center justify-between gap-3 shrink-0">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-1.5 rounded-lg bg-slate-100 shrink-0">
                            {renderFileIcon()}
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-sm text-[#203880] truncate">
                                    {title}
                                </h3>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${color}`}>
                                    {ext}
                                </span>
                            </div>
                            <p className="text-[11px] text-[#64748b] truncate font-mono mt-0.5">
                                {filename}
                            </p>
                        </div>
                    </div>

                    {/* TOOLBAR ACTIONS */}
                    <div className="flex items-center gap-1.5 shrink-0">
                        {/* Zoom Controls for Image */}
                        {type === 'image' && !imgError && (
                            <div className="hidden sm:flex items-center bg-slate-100 rounded-md p-0.5 mr-1 text-slate-700">
                                <button
                                    type="button"
                                    onClick={handleZoomOut}
                                    disabled={zoom <= 0.5}
                                    className="p-1 hover:bg-white rounded hover:shadow-xs disabled:opacity-40"
                                    title="Perkecil (Zoom Out)"
                                >
                                    <ZoomOut className="w-3.5 h-3.5" />
                                </button>
                                <span className="text-[11px] font-semibold px-1.5 font-mono">
                                    {Math.round(zoom * 100)}%
                                </span>
                                <button
                                    type="button"
                                    onClick={handleZoomIn}
                                    disabled={zoom >= 3}
                                    className="p-1 hover:bg-white rounded hover:shadow-xs disabled:opacity-40"
                                    title="Perbesar (Zoom In)"
                                >
                                    <ZoomIn className="w-3.5 h-3.5" />
                                </button>
                                {zoom !== 1 && (
                                    <button
                                        type="button"
                                        onClick={handleResetZoom}
                                        className="p-1 hover:bg-white rounded hover:shadow-xs text-xs"
                                        title="Reset Ukuran"
                                    >
                                        <RotateCcw className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Fullscreen Toggle */}
                        <button
                            type="button"
                            onClick={() => setIsFullscreen(!isFullscreen)}
                            className="bs-btn bs-btn-sm bs-btn-outline-secondary p-1.5"
                            title={isFullscreen ? 'Keluar Layar Penuh' : 'Tampilan Layar Penuh'}
                        >
                            {isFullscreen ? (
                                <Minimize2 className="w-3.5 h-3.5" />
                            ) : (
                                <Maximize2 className="w-3.5 h-3.5" />
                            )}
                        </button>

                        {/* Download Button */}
                        <a
                            href={fileUrl}
                            download={filename}
                            className="bs-btn bs-btn-sm bs-btn-outline-secondary inline-flex items-center gap-1.5 py-1 px-2.5 text-xs font-semibold"
                            title="Unduh Berkas ke Komputer"
                        >
                            <Download className="w-3.5 h-3.5" />
                            <span className="hidden md:inline">Unduh</span>
                        </a>

                        {/* Open in New Tab Button */}
                        <a
                            href={fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="bs-btn bs-btn-sm bs-btn-primary inline-flex items-center gap-1.5 py-1 px-2.5 text-xs font-semibold"
                            title="Buka Berkas di Tab Baru"
                        >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span className="hidden md:inline">Tab Baru</span>
                        </a>

                        {/* Close Modal Button */}
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-lg transition-colors ml-1"
                            title="Tutup (Esc)"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* MODAL BODY (CONTENT PREVIEW) */}
                <div className="bs-modal-body flex-1 p-0 overflow-auto bg-[#0f172a] relative flex items-center justify-center min-h-[300px]">
                    {/* 1. TAMPILAN GAMBAR */}
                    {type === 'image' && (
                        <div className="w-full h-full flex items-center justify-center p-4 overflow-auto">
                            {imgLoading && !imgError && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/60 z-10 text-white">
                                    <Loader2 className="w-8 h-8 animate-spin text-[#0068b0] mb-2" />
                                    <span className="text-xs font-medium">Memuat gambar pratinjau...</span>
                                </div>
                            )}

                            {!imgError ? (
                                <img
                                    src={fileUrl}
                                    alt={filename}
                                    style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
                                    className="max-h-full max-w-full object-contain rounded shadow-lg transition-transform duration-200 select-none"
                                    onLoad={() => setImgLoading(false)}
                                    onError={() => {
                                        setImgLoading(false);
                                        setImgError(true);
                                    }}
                                />
                            ) : (
                                <div className="p-6 bg-white rounded-xl shadow-xl max-w-md text-center space-y-3 m-4">
                                    <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                                        <AlertCircle className="w-6 h-6" />
                                    </div>
                                    <h4 className="font-bold text-sm text-[#203880]">
                                        Berkas Gambar Tidak Dapat Dimuat
                                    </h4>
                                    <p className="text-xs text-[#64748b] leading-relaxed">
                                        Berkas fisik <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[11px]">{filename}</code> tidak ditemukan di server (404) atau format gambar rusak.
                                    </p>
                                    <div className="pt-2 flex justify-center gap-2">
                                        <a
                                            href={fileUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="bs-btn bs-btn-sm bs-btn-primary inline-flex items-center gap-1 text-xs"
                                        >
                                            <ExternalLink className="w-3.5 h-3.5" /> Buka Tautan Langsung
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 2. TAMPILAN PDF */}
                    {type === 'pdf' && (
                        <div className="w-full h-full bg-[#525659] flex flex-col">
                            <iframe
                                src={`${fileUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                                title="Pratinjau Dokumen PDF"
                                className="w-full h-full border-0 flex-1"
                            />
                        </div>
                    )}

                    {/* 3. TAMPILAN DOKUMEN OFFICE (WORD, EXCEL, POWERPOINT) */}
                    {['word', 'excel', 'powerpoint'].includes(type) && (
                        <div className="w-full h-full bg-[#f8fafc] flex flex-col items-center justify-center p-6">
                            <div className="bg-white border border-[#e2e8f0] rounded-2xl shadow-xl p-8 max-w-lg w-full text-center space-y-4">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-slate-100 to-slate-200 border border-slate-200 flex items-center justify-center mx-auto shadow-inner">
                                    {type === 'word' && <FileText className="w-10 h-10 text-blue-600" />}
                                    {type === 'excel' && <FileSpreadsheet className="w-10 h-10 text-emerald-600" />}
                                    {type === 'powerpoint' && <FileText className="w-10 h-10 text-amber-600" />}
                                </div>

                                <div>
                                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-1.5 ${color}`}>
                                        {label}
                                    </span>
                                    <h4 className="font-bold text-base text-[#203880] font-mono break-all">
                                        {filename}
                                    </h4>
                                    <p className="text-xs text-[#64748b] mt-2 leading-relaxed">
                                        Format berkas <strong>.{ext.toUpperCase()}</strong> memerlukan aplikasi pengolah dokumen eksternal untuk dibuka secara interaktif.
                                    </p>
                                </div>

                                <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-left text-xs text-[#0068b0] flex items-start gap-2.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#0068b0] mt-1.5 shrink-0" />
                                    <div className="leading-relaxed">
                                        Klik <strong>Unduh Berkas</strong> untuk menyimpan dan membuka dokumen di komputer Anda, atau gunakan <strong>Buka di Tab Baru</strong>.
                                    </div>
                                </div>

                                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                                    <a
                                        href={fileUrl}
                                        download={filename}
                                        className="bs-btn bs-btn-primary w-full sm:w-auto inline-flex items-center justify-center gap-2 text-xs py-2 px-4 shadow-sm"
                                    >
                                        <Download className="w-4 h-4" />
                                        Unduh Berkas Sekarang
                                    </a>
                                    <a
                                        href={fileUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="bs-btn bs-btn-outline-secondary w-full sm:w-auto inline-flex items-center justify-center gap-2 text-xs py-2 px-4"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        Buka di Tab Baru
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 4. TAMPILAN TEKS / LAINNYA */}
                    {['text', 'other'].includes(type) && (
                        <div className="w-full h-full bg-[#f8fafc] flex flex-col">
                            {type === 'text' ? (
                                <iframe
                                    src={fileUrl}
                                    title="Pratinjau Teks"
                                    className="w-full h-full border-0 bg-white p-4 font-mono text-xs"
                                />
                            ) : (
                                <div className="flex-1 flex items-center justify-center p-6">
                                    <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-lg p-6 max-w-md w-full text-center space-y-3">
                                        <File className="w-12 h-12 text-[#0068b0] mx-auto" />
                                        <h4 className="font-bold text-sm text-[#203880] font-mono break-all">
                                            {filename}
                                        </h4>
                                        <p className="text-xs text-[#64748b]">
                                            Pratinjau langsung tidak didukung untuk tipe berkas ini. Anda dapat mengunduh atau membukanya di aplikasi bawaan.
                                        </p>
                                        <div className="pt-2 flex justify-center gap-2">
                                            <a
                                                href={fileUrl}
                                                download={filename}
                                                className="bs-btn bs-btn-primary inline-flex items-center gap-1.5 text-xs"
                                            >
                                                <Download className="w-3.5 h-3.5" /> Unduh Berkas
                                            </a>
                                            <a
                                                href={fileUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="bs-btn bs-btn-outline-secondary inline-flex items-center gap-1.5 text-xs"
                                            >
                                                <ExternalLink className="w-3.5 h-3.5" /> Buka di Tab Baru
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* MODAL FOOTER */}
                <div className="bs-modal-footer py-2.5 px-4 bg-slate-50 border-t border-[#e2e8f0] flex items-center justify-between text-xs text-[#64748b]">
                    <div className="flex items-center gap-2">
                        <span>Format: <strong>{label} (.{ext.toUpperCase()})</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bs-btn bs-btn-sm bs-btn-outline-secondary"
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
