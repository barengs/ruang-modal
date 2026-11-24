import React from 'react';

const STATUS_CLASS_MAP = {
    Disetujui: 'bs-badge-success',
    Tayang: 'bs-badge-success',
    Selesai: 'bs-badge-success',
    'Menunggu Seleksi': 'bs-badge-warning',
    'Menunggu Moderasi': 'bs-badge-warning',
    Menunggu: 'bs-badge-warning',
    'Perlu Perbaikan': 'bs-badge-info',
    Ditolak: 'bs-badge-danger',
};

export default function StatusBadge({ status }) {
    const cls = STATUS_CLASS_MAP[status] || 'bs-badge-secondary';
    return <span className={`bs-badge ${cls}`}>{status || '-'}</span>;
}
