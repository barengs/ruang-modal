import React from 'react';
import { formatCurrencyThousand, parseCurrencyDigits } from '../utils/format';

/**
 * Reusable Indonesian Rupiah Currency Input
 * - mode="numeric": emits raw digit string (e.g. "2500000") via onChange({ target: { name, value } })
 * - mode="rupiah": emits formatted Rupiah string (e.g. "Rp25.000") via onChange({ target: { name, value } })
 */
export default function CurrencyInput({
    name,
    value,
    onChange,
    placeholder = '0',
    required = false,
    disabled = false,
    mode = 'numeric',
    suffix = null,
}) {
    const rawDigits = parseCurrencyDigits(value);
    const displayValue = formatCurrencyThousand(rawDigits);

    const handleInputChange = (e) => {
        const digits = parseCurrencyDigits(e.target.value).replace(/^0+(?=\d)/, '');
        const formatted = formatCurrencyThousand(digits);

        let nextValue = digits;
        if (mode === 'rupiah') {
            nextValue = formatted ? `Rp${formatted}${suffix ? ` ${suffix}` : ''}` : '';
        }

        if (onChange) {
            onChange({
                target: {
                    name,
                    value: nextValue,
                    rawDigits: digits,
                    formatted,
                },
            });
        }
    };

    return (
        <div className="flex items-stretch w-full">
            <span className="inline-flex items-center px-3 text-xs font-bold text-[#203880] bg-[#eef2f9] border border-r-0 border-[#cbd5e1] rounded-l select-none">
                Rp
            </span>
            <input
                type="text"
                inputMode="numeric"
                name={name}
                value={displayValue}
                onChange={handleInputChange}
                placeholder={placeholder}
                required={required}
                disabled={disabled}
                className={`bs-form-control rounded-l-none ${suffix ? 'rounded-r-none' : ''}`}
            />
            {suffix && (
                <span className="inline-flex items-center px-2.5 text-xs font-medium text-[#64748b] bg-[#f8fafd] border border-l-0 border-[#cbd5e1] rounded-r select-none whitespace-nowrap">
                    {suffix}
                </span>
            )}
        </div>
    );
}
