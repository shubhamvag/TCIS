import { Skeleton } from "../Skeleton";
import { cn } from "../../../lib/utils";

interface TableSkeletonProps {
    rows?: number;
    cols?: number;
    className?: string;
}

export function TableSkeleton({ rows = 5, cols = 4, className }: TableSkeletonProps) {
    return (
        <div className={cn("w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm", className)}>
            <div className="border-b border-slate-200 bg-slate-50/50 px-6 py-4 flex gap-4">
                {Array.from({ length: cols }).map((_, i) => (
                    <Skeleton key={`header-${i}`} className="h-4 w-24 bg-slate-200" />
                ))}
            </div>
            <div className="divide-y divide-slate-100">
                {Array.from({ length: rows }).map((_, rowIndex) => (
                    <div key={`row-${rowIndex}`} className="flex gap-4 px-6 py-4 items-center">
                        {Array.from({ length: cols }).map((_, colIndex) => (
                            <Skeleton
                                key={`cell-${rowIndex}-${colIndex}`}
                                className={cn(
                                    "h-4 w-full bg-slate-100",
                                    colIndex === 0 && "w-1/3"
                                )}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
