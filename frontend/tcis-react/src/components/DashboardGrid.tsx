import type { ReactNode } from "react";
import { cn } from "../lib/utils";

interface DashboardGridProps {
    children: ReactNode;
    cols?: 1 | 2 | 3 | 4;
    className?: string;
}

export function DashboardGrid({ children, cols = 3, className }: DashboardGridProps) {
    const colMap = {
        1: "grid-cols-1",
        2: "grid-cols-1 md:grid-cols-2",
        3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    };

    return (
        <div className={cn("grid gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500", colMap[cols], className)}>
            {children}
        </div>
    );
}

interface DashboardWidgetProps {
    children: ReactNode;
    colSpan?: 1 | 2 | 3 | 4;
    className?: string;
    title?: string;
    subtitle?: string;
}

export function DashboardWidget({ children, colSpan = 1, className, title, subtitle }: DashboardWidgetProps) {
    const spanMap = {
        1: "col-span-1",
        2: "col-span-1 md:col-span-2",
        3: "col-span-1 md:col-span-2 lg:col-span-3",
        4: "col-span-1 md:col-span-2 lg:col-span-4",
    };

    return (
        <div className={cn(
            "bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden flex flex-col",
            spanMap[colSpan],
            className
        )}>
            {(title || subtitle) && (
                <div className="mb-6">
                    {title && <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{title}</h3>}
                    {subtitle && <p className="text-xs text-slate-500 font-medium mt-0.5 line-clamp-1 uppercase tracking-wider">{subtitle}</p>}
                </div>
            )}
            <div className="flex-1">
                {children}
            </div>
        </div>
    );
}
