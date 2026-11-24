export function formatRupiah(value) {
    const num = Number(value) || 0;
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(num);
}

export function parseCurrencyDigits(value) {
    return String(value ?? '').replace(/\D/g, '');
}

export function formatCurrencyThousand(value) {
    const digits = parseCurrencyDigits(value).replace(/^0+(?=\d)/, '');
    if (!digits) return '';
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function safeOrderUrl(contact) {
    const raw = String(contact || '').trim();
    if (/^https?:\/\//i.test(raw)) {
        return raw;
    }
    const digits = raw.replace(/\D/g, '');
    if (digits.startsWith('0')) {
        return `https://wa.me/62${digits.slice(1)}`;
    }
    return `https://wa.me/${digits}`;
}

export function formatDateTime(iso) {
    if (!iso) return '-';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(d);
}

const CATEGORY_THUMBNAILS = {
    Kuliner: '/images/etalase/kuliner.webp',
    Fashion: '/images/etalase/fashion.webp',
    'Jasa kreatif': '/images/etalase/jasa-kreatif.webp',
    Kecantikan: '/images/etalase/kecantikan.webp',
    Kerajinan: '/images/etalase/kerajinan.webp',
    Teknologi: '/images/etalase/teknologi.webp',
};

export function getCategoryThumbnail(kategori) {
    return CATEGORY_THUMBNAILS[kategori] || '/images/etalase/default.webp';
}

export function getProductThumbnail(product) {
    const custom = String(product?.thumbnail || '').trim();
    if (custom) {
        return custom.replace(/\.svg$/i, '.webp');
    }
    return getCategoryThumbnail(product?.kategori);
}
