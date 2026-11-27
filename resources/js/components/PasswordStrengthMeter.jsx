import React, { useMemo } from 'react';
import { Check, CheckCircle2, ShieldCheck, X } from 'lucide-react';

export function evaluatePasswordStrength(password = '') {
    const val = String(password || '');

    const rules = [
        {
            id: 'length',
            label: 'Minimal 8 karakter',
            valid: val.length >= 8,
        },
        {
            id: 'case',
            label: 'Kombinasi huruf besar (A-Z) & kecil (a-z)',
            valid: /[a-z]/.test(val) && /[A-Z]/.test(val),
        },
        {
            id: 'number',
            label: 'Mengandung angka (0-9)',
            valid: /[0-9]/.test(val),
        },
        {
            id: 'symbol',
            label: 'Mengandung simbol / karakter khusus (!@#$%^&*)',
            valid: /[^A-Za-z0-9]/.test(val),
        },
    ];

    if (!val) {
        return {
            score: 0,
            level: 0,
            label: 'Belum diisi',
            color: 'bg-slate-200 text-slate-500',
            barColor: 'bg-slate-200',
            rules,
        };
    }

    const passedCount = rules.filter((r) => r.valid).length;
    const isLongEnough = val.length >= 8;

    let score = 0;
    let label = 'Sangat Lemah';
    let color = 'text-rose-600 bg-rose-50 border-rose-200';
    let barColor = 'bg-rose-500';

    if (!isLongEnough) {
        score = 1;
        label = 'Sangat Lemah (kurang dari 8 karakter)';
        color = 'text-rose-600 bg-rose-50 border-rose-200';
        barColor = 'bg-rose-500';
    } else if (passedCount === 1) {
        score = 1;
        label = 'Lemah';
        color = 'text-rose-600 bg-rose-50 border-rose-200';
        barColor = 'bg-rose-500';
    } else if (passedCount === 2) {
        score = 2;
        label = 'Sedang / Cukup';
        color = 'text-amber-700 bg-amber-50 border-amber-200';
        barColor = 'bg-amber-500';
    } else if (passedCount === 3) {
        score = 3;
        label = 'Kuat';
        color = 'text-[#0068b0] bg-blue-50 border-blue-200';
        barColor = 'bg-[#0068b0]';
    } else if (passedCount >= 4) {
        score = 4;
        label = 'Sangat Kuat';
        color = 'text-emerald-700 bg-emerald-50 border-emerald-200';
        barColor = 'bg-emerald-600';
    }

    return {
        score,
        level: score,
        label,
        color,
        barColor,
        rules,
    };
}

export default function PasswordStrengthMeter({ password = '', showRules = true }) {
    const analysis = useMemo(() => evaluatePasswordStrength(password), [password]);

    if (!password) {
        return null;
    }

    return (
        <div className="space-y-2 mt-1.5 animate-fadeIn text-xs">
            {/* Header Level Kesulitan */}
            <div className="flex items-center justify-between gap-2">
                <span className="text-[#64748b] font-medium inline-flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#0068b0]" />
                    Level Kesulitan:
                </span>
                <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold border ${analysis.color}`}
                >
                    {analysis.label}
                </span>
            </div>

            {/* Segmented Strength Bar (4 segments) */}
            <div className="grid grid-cols-4 gap-1.5">
                {[1, 2, 3, 4].map((step) => {
                    const isActive = analysis.score >= step;
                    return (
                        <div
                            key={step}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                                isActive ? analysis.barColor : 'bg-slate-200'
                            }`}
                        />
                    );
                })}
            </div>

            {/* Kriteria Checklist Real-time */}
            {showRules && (
                <div className="p-2.5 rounded-md bg-[#f8fafd] border border-[#e2e8f0] space-y-1.5 text-[11px]">
                    <div className="font-semibold text-[#203880] mb-1">
                        Kriteria Keamanan Kata Sandi:
                    </div>
                    {analysis.rules.map((rule) => (
                        <div
                            key={rule.id}
                            className={`flex items-center gap-1.5 transition-colors ${
                                rule.valid ? 'text-emerald-700 font-semibold' : 'text-slate-500'
                            }`}
                        >
                            {rule.valid ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            ) : (
                                <span className="w-3.5 h-3.5 flex items-center justify-center text-slate-400 font-bold">
                                    •
                                </span>
                            )}
                            <span>{rule.label}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
