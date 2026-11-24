import React, { useMemo } from 'react';
import { Chart } from 'react-charts';

// Standar Warna Logo SMA Double Track: Navy, Amber Mandiri, Ocean Blue, Teal, Crimson, Purple
const DEFAULT_COLORS = ['#203880', '#f8a000', '#0068b0', '#00a88f', '#e11d48', '#8e24aa'];

export default function AnalyticsChart({
    series = [],
    elementType = 'bar',
    height = 280,
    colors = DEFAULT_COLORS,
}) {
    const safeData = useMemo(() => {
        if (!Array.isArray(series) || series.length === 0) {
            return [{ label: 'Data', data: [{ primary: '-', secondary: 0 }] }];
        }
        return series.map((s) => ({
            label: s.label,
            data:
                Array.isArray(s.data) && s.data.length > 0
                    ? s.data.map((d) => ({
                          primary: String(d.primary ?? '-'),
                          secondary: Number(d.secondary ?? 0),
                      }))
                    : [{ primary: '-', secondary: 0 }],
        }));
    }, [series]);

    const primaryAxis = useMemo(
        () => ({
            getValue: (datum) => datum.primary,
        }),
        []
    );

    const secondaryAxes = useMemo(
        () => [
            {
                getValue: (datum) => datum.secondary,
                elementType,
                min: 0,
            },
        ],
        [elementType]
    );

    return (
        <div className="space-y-3">
            {/* Legend */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#495057]">
                {safeData.map((s, idx) => (
                    <span key={s.label} className="inline-flex items-center gap-1.5 font-medium">
                        <span
                            className="w-3 h-3 rounded-xs inline-block"
                            style={{ backgroundColor: colors[idx % colors.length] }}
                        />
                        {s.label}
                    </span>
                ))}
            </div>

            {/* TanStack React Charts container */}
            <div style={{ height: `${height}px` }} className="w-full relative">
                <Chart
                    options={{
                        data: safeData,
                        primaryAxis,
                        secondaryAxes,
                        defaultColors: colors,
                    }}
                />
            </div>
        </div>
    );
}
