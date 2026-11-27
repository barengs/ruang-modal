/**
 * Validasi dan Utilitas Email & Formulir
 */

const COMMON_DOMAIN_TYPOS = {
    'gmai.com': 'gmail.com',
    'gmial.com': 'gmail.com',
    'gmaill.com': 'gmail.com',
    'gmail.con': 'gmail.com',
    'gamil.com': 'gmail.com',
    'yaho.com': 'yahoo.com',
    'yahooo.com': 'yahoo.com',
    'hotmial.com': 'hotmail.com',
    'hotmaill.com': 'hotmail.com',
};

// Pola RFC 5322 yang disederhanakan dan aman
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

/**
 * Validasi alamat email lengkap dengan feedback pesan dan saran perbaikan typo domain
 * @param {string} email
 * @param {object} options { required?: boolean }
 * @returns {{ valid: boolean, message: string, suggestion?: string }}
 */
export function validateEmail(email, { required = true } = {}) {
    const raw = String(email || '').trim();

    if (!raw) {
        if (!required) {
            return { valid: true, message: '' };
        }
        return {
            valid: false,
            message: 'Alamat email wajib diisi.',
        };
    }

    if (raw.includes(' ')) {
        return {
            valid: false,
            message: 'Alamat email tidak boleh mengandung spasi.',
        };
    }

    const atParts = raw.split('@');
    if (atParts.length === 1) {
        return {
            valid: false,
            message: 'Email harus mengandung tanda "@" (contoh: nama@domain.com).',
        };
    }

    if (atParts.length > 2) {
        return {
            valid: false,
            message: 'Alamat email hanya boleh memiliki satu karakter "@".',
        };
    }

    const [localPart, domainPart] = atParts;

    if (!localPart || localPart.length === 0) {
        return {
            valid: false,
            message: 'Bagian nama sebelum tanda "@" tidak boleh kosong.',
        };
    }

    if (!domainPart || domainPart.length === 0) {
        return {
            valid: false,
            message: 'Domain setelah tanda "@" belum lengkap (contoh: @domain.com atau @alumni.sch.id).',
        };
    }

    if (!domainPart.includes('.')) {
        return {
            valid: false,
            message: 'Domain email harus menyertakan ekstensi seperti .com, .id, atau .sch.id.',
        };
    }

    const domainExt = domainPart.split('.').pop();
    if (!domainExt || domainExt.length < 2) {
        return {
            valid: false,
            message: 'Ekstensi domain email minimal terdiri dari 2 huruf (contoh: .id, .com).',
        };
    }

    if (!EMAIL_REGEX.test(raw)) {
        return {
            valid: false,
            message: 'Format penulisan email tidak valid. Periksa kembali karakter yang digunakan.',
        };
    }

    // Periksa kemungkinan salah ketik pada domain populer
    const lowerDomain = domainPart.toLowerCase();
    let suggestion;
    if (COMMON_DOMAIN_TYPOS[lowerDomain]) {
        const suggestedDomain = COMMON_DOMAIN_TYPOS[lowerDomain];
        suggestion = `${localPart}@${suggestedDomain}`;
    }

    return {
        valid: true,
        message: 'Format alamat email valid.',
        suggestion,
    };
}

/**
 * Helper ringkas boolean
 * @param {string} email
 * @returns {boolean}
 */
export function isEmailValid(email) {
    return validateEmail(email).valid;
}
