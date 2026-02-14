import { Skeleton } from "../Skeleton";
import { cn } from "../../../lib/utils";

export function ChartSkeleton({ height = 300, className }: { height?: number; className?: string }) {
    return (
        <div className={cn("w-full relative overflow-hidden rounded-xl bg-slate-50/50 border border-slate-100", className)} style={{ height }}>
            <div className="absolute inset-0 flex items-end justify-between px-8 pb-4 gap-2">
                {/* Simulate bar chart bars */}
                <Skeleton className="h-1/3 w-8 bg-slate-200/50 rounded-t-sm" />
                <Skeleton className="h-2/3 w-8 bg-slate-200/50 rounded-t-sm" />
                <Skeleton className="h-1/2 w-8 bg-slate-200/50 rounded-t-sm" />
                <Skeleton className="h-3/4 w-8 bg-slate-200/50 rounded-t-sm" />
                <Skeleton className="h-2/5 w-8 bg-slate-200/50 rounded-t-sm" />
                <Skeleton className="h-full w-8 bg-slate-200/50 rounded-t-sm" />
                <Skeleton className="h-1/2 w-8 bg-slate-200/50 rounded-t-sm" />
            </div>
            {/* Shimmer overlay for extra polish */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        </div>
    );
}
