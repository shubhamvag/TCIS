import type { ReactNode } from "react";
import { cn } from "../lib/utils";

interface Column<T> {
    header: string;
    accessor: (item: T) => ReactNode;
    className?: string; // for width or alignment
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    keyField?: keyof T;
}

export function DataTable<T>({ data, columns }: DataTableProps<T>) {
    return (
        <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            {columns.map((col, idx) => (
                                <th
                                    key={idx}
                                    className={cn(
                                        "px-4 py-3 font-semibold text-slate-700 whitespace-nowrap",
                                        col.className
                                    )}
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {data.map((row, rowIdx) => (
                            <tr key={rowIdx} className="hover:bg-slate-50 transition-colors even:bg-slate-50/50">
                                {columns.map((col, colIdx) => (
                                    <td key={colIdx} className="px-4 py-2 text-slate-600 align-middle">
                                        {col.accessor(row)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                        {data.length === 0 && (
                            <tr>
                                <td colSpan={columns.length} className="px-4 py-8 text-center text-slate-400">
                                    No records found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
