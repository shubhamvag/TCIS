import { Skeleton } from "../Skeleton";
import { cn } from "../../../lib/utils";

export function CardSkeleton({ className }: { className?: string }) {
    return (
        <div className={cn("p-6 rounded-2xl border border-slate-100 bg-white shadow-sm space-y-4", className)}>
            <div className="flex justify-between items-start">
                <div className="space-y-2">
                    <Skeleton className="h-3 w-20 bg-slate-100" />
                    <Skeleton className="h-8 w-16 bg-slate-200" />
                </div>
                <Skeleton className="h-10 w-10 rounded-full bg-slate-50" />
            </div>
            <Skeleton className="h-3 w-24 bg-slate-50" />
        </div>
    );
}
