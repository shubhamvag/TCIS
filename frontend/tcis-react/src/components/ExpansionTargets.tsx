import React from "react";
import { TrendingUp, ArrowRight } from "lucide-react";

export interface ExpansionTarget {
    id: string;
    name: string;
    score: number;
    subtext?: string;
}

interface ExpansionTargetsProps {
    title: string;
    items: ExpansionTarget[];
    maxHeight?: number | string;
    onItemClick?: (item: ExpansionTarget) => void;
    emptyMessage?: string;
}

export const ExpansionTargets: React.FC<ExpansionTargetsProps> = ({
    title,
    items,
    maxHeight = 400,
    onItemClick,
    emptyMessage = "No high-potential targets identified."
}) => {
    return (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col overflow-hidden transition-all hover:shadow-md h-full">
            {/* Header - Fixed */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                <div className="flex items-center gap-2">
                    <TrendingUp size={16} className="text-indigo-500" />
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">{title}</h3>
                </div>
                <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full border border-indigo-100">
                    {items.length} Units
                </span>
            </div>

            {/* List - Scrollable */}
            <div
                style={{ maxHeight }}
                className="overflow-y-auto overflow-x-hidden divide-y divide-slate-50 custom-scrollbar flex-grow"
            >
                {items.length > 0 ? (
                    items.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => onItemClick?.(item)}
                            className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer group flex flex-col gap-2`}
                        >
                            <div className="flex justify-between items-start gap-3">
                                <div className="min-w-0 flex-grow">
                                    <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors" title={item.name}>
                                        {item.name}
                                    </h4>
                                    {item.subtext && (
                                        <p className="text-[10px] text-slate-400 font-medium truncate uppercase tracking-widest mt-0.5">
                                            {item.subtext}
                                        </p>
                                    )}
                                </div>
                                <div className="flex flex-col items-end flex-shrink-0">
                                    <span className={`text-xs font-black ${item.score >= 70 ? 'text-emerald-600' : 'text-slate-600'}`}>
                                        {item.score}%
                                    </span>
                                </div>
                            </div>

                            {/* Score Bar */}
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden relative">
                                <div
                                    className={`h-full rounded-full transition-all duration-1000 ease-out ${item.score >= 75 ? 'bg-emerald-500' :
                                            item.score >= 45 ? 'bg-indigo-500' : 'bg-amber-500'
                                        }`}
                                    style={{ width: `${item.score}%` }}
                                />
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-12 px-6 text-center text-slate-400">
                        <p className="text-xs italic">{emptyMessage}</p>
                    </div>
                )}
            </div>

            {/* Footer - Optional action */}
            {items.length > 0 && (
                <div className="p-3 bg-slate-50/50 border-t border-slate-100">
                    <button className="w-full py-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] hover:text-indigo-600 flex items-center justify-center gap-2 transition-all">
                        Deep Analytics <ArrowRight size={12} />
                    </button>
                </div>
            )}
        </div>
    );
};
