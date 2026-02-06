import type { ReactNode } from "react";

interface ChartWrapperProps {
    title: string;
    children: ReactNode;
    height?: number;
}

export function ChartWrapper({ title, children, height = 300 }: ChartWrapperProps) {
    return (
        <div className="bg-white border border-slate-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-slate-800 mb-4 border-b border-slate-100 pb-2">{title}</h3>
            <div style={{ height }} className="w-full text-xs">
                {children}
            </div>
        </div>
    );
}
