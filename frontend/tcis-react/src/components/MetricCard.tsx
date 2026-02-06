import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
    label: string;
    value: string | number;
    sub?: string;
    trend?: string; // e.g. "+5% vs last week"
    trendDirection?: 'up' | 'down' | 'neutral';
    icon?: LucideIcon;
}

export function MetricCard({ label, value, sub, icon: Icon }: MetricCardProps) {
    return (
        <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold uppercase text-slate-500 tracking-wide">{label}</span>
                {Icon && <Icon className="w-4 h-4 text-slate-400" />}
            </div>
            <div>
                <div className="text-2xl font-bold text-slate-900 leading-tight">{value}</div>
                {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
            </div>
        </div>
    );
}
