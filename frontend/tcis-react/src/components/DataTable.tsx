import { type ReactNode, useState, useMemo } from "react";
import { cn } from "../lib/utils";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { Skeleton } from "./ui/Skeleton";

export interface Column<T> {
    header: string;
    accessor: (item: T) => ReactNode;
    className?: string;
    sortKey?: keyof T;
    sortable?: boolean;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    pageSize?: number;
    isLoading?: boolean;
}

export function DataTable<T>({ data, columns, isLoading, pageSize = 5 }: DataTableProps<T>) {
    const [sortKey, setSortKey] = useState<keyof T | null>(null);
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

    const sortedData = useMemo(() => {
        if (!sortKey) return data;
        return [...data].sort((a, b) => {
            const valA = a[sortKey];
            const valB = b[sortKey];
            if (valA === valB) return 0;
            if (valA === null || valA === undefined) return 1;
            if (valB === null || valB === undefined) return -1;

            const result = valA < valB ? -1 : 1;
            return sortDir === 'asc' ? result : -result;
        });
    }, [data, sortKey, sortDir]);

    const handleSort = (key?: keyof T) => {
        if (!key) return;
        if (sortKey === key) {
            setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDir('desc');
        }
    };

    return (
        <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-200">
                            {columns.map((col, idx) => (
                                <th
                                    key={idx}
                                    onClick={() => col.sortable && handleSort(col.sortKey)}
                                    className={cn(
                                        "px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-[10px] whitespace-nowrap transition-colors",
                                        col.sortable && "cursor-pointer hover:bg-slate-100/80 hover:text-slate-900 group",
                                        col.className
                                    )}
                                >
                                    <div className="flex items-center gap-2">
                                        {col.header}
                                        {col.sortable && (
                                            <div className="text-slate-300 group-hover:text-slate-500 transition-colors">
                                                {sortKey === col.sortKey ? (
                                                    sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                                                ) : <ChevronsUpDown size={14} className="opacity-40" />}
                                            </div>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {sortedData.map((row, rowIdx) => (
                            <tr key={rowIdx} className="hover:bg-slate-50/80 transition-all group">
                                {columns.map((col, colIdx) => (
                                    <td key={colIdx} className="px-6 py-3.5 text-slate-600 align-middle">
                                        {col.accessor(row)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                        {sortedData.length === 0 && !isLoading && (
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-16 text-center text-slate-400 bg-white">
                                    <div className="flex flex-col items-center gap-2">
                                        <p className="text-sm font-medium">No results found matching your criteria.</p>
                                        <p className="text-xs">Try adjusting your global filters in the sidebar.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                        {isLoading && (
                            Array.from({ length: pageSize }).map((_, rowIndex) => (
                                <tr key={rowIndex} className="border-b border-slate-50 last:border-0 animate-in fade-in duration-300">
                                    {columns.map((_, colIndex) => (
                                        <td key={colIndex} className="px-6 py-4">
                                            <Skeleton className="h-5 w-full bg-slate-100" />
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
