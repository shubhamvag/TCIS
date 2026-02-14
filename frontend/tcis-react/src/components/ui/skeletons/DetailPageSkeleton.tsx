import { Skeleton } from "../Skeleton";

export function DetailPageSkeleton() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <header className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-48" />
                </div>
                <div className="ml-auto">
                    <Skeleton className="h-12 w-32 rounded-2xl" />
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                    {/* Contact Card */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
                        <Skeleton className="h-4 w-32 mb-4" />
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-8 w-8 rounded bg-slate-100" />
                                <div className="space-y-1">
                                    <Skeleton className="h-3 w-20" />
                                    <Skeleton className="h-4 w-32" />
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-8 w-8 rounded bg-slate-100" />
                                <div className="space-y-1">
                                    <Skeleton className="h-3 w-20" />
                                    <Skeleton className="h-4 w-40" />
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-8 w-8 rounded bg-slate-100" />
                                <div className="space-y-1">
                                    <Skeleton className="h-3 w-24" />
                                    <Skeleton className="h-4 w-36" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Engagement Card */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
                        <Skeleton className="h-4 w-40 mb-2" />
                        <Skeleton className="h-10 w-full rounded-lg bg-slate-50" />
                        <Skeleton className="h-10 w-full rounded-lg bg-slate-50" />
                        <Skeleton className="h-10 w-full rounded-lg bg-slate-50" />
                    </div>
                </div>

                {/* Right Column (Analytics) */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-xl border border-slate-200 p-8">
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                            <div className="space-y-4">
                                <Skeleton className="h-6 w-48" />
                                <Skeleton className="h-[260px] w-full rounded-xl bg-slate-50" />
                            </div>
                            <div className="space-y-4">
                                <Skeleton className="h-6 w-48" />
                                <Skeleton className="h-[260px] w-full rounded-full bg-slate-50" />
                            </div>
                        </div>
                        <div className="mt-8 pt-8 border-t border-slate-100">
                            <Skeleton className="h-4 w-40 mb-4" />
                            <Skeleton className="h-16 w-full rounded-lg bg-indigo-50/50" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
