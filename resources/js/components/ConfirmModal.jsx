import React from 'react';
import { AlertTriangle, HelpCircle, Info, Loader2, X } from 'lucide-react';

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title = 'Konfirmasi Tindakan',
    message = 'Apakah Anda yakin ingin melanjutkan tindakan ini?',
    confirmText = 'Ya, Lanjutkan',
    cancelText = 'Batal',
    variant = 'danger', // 'danger' | 'warning' | 'primary'
    loading = false,
}) {
    if (!isOpen) return null;

    const iconMap = {
        danger: <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />,
        warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
        primary: <HelpCircle className="w-5 h-5 text-[#0068b0] shrink-0" />,
        info: <Info className="w-5 h-5 text-[#0068b0] shrink-0" />,
    };

    const confirmBtnClass = {
        danger: 'bs-btn bs-btn-sm bs-btn-danger',
        warning: 'bs-btn bs-btn-sm bs-btn-warning text-white',
        primary: 'bs-btn bs-btn-sm bs-btn-primary',
    }[variant] || 'bs-btn bs-btn-sm bs-btn-danger';

    return (
        <div className="bs-modal-backdrop" onClick={loading ? undefined : onClose}>
            <div
                className="bs-modal-dialog max-w-md shadow-2xl animate-fadeIn"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
            >
                <div className="bs-modal-header">
                    <h3 className="font-bold text-sm text-[#203880] flex items-center gap-2">
                        {iconMap[variant] || iconMap.primary}
                        <span>{title}</span>
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="text-[#6c757d] hover:text-[#212529] p-1 disabled:opacity-50"
                        aria-label="Tutup"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="bs-modal-body text-xs text-[#495057] leading-relaxed py-4">
                    {typeof message === 'string' ? (
                        <p className="whitespace-pre-line">{message}</p>
                    ) : (
                        message
                    )}
                </div>

                <div className="bs-modal-footer">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="bs-btn bs-btn-sm bs-btn-outline-secondary"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className={`${confirmBtnClass} inline-flex items-center gap-1.5`}
                    >
                        {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
