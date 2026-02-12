import React, { useState, useEffect } from "react";
import { Filter, X, ChevronRight, RotateCcw } from "lucide-react";

interface FilterDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (filters: FilterState) => void;
    initialFilters: FilterState;
}

export interface FilterState {
    sectors: string[];
    minScore: number;
    maxScore: number;
    regions: string[];
    status?: string;
}

const SECTOR_OPTIONS = ["manufacturing", "trading", "services"];
const REGION_OPTIONS = ["North", "South", "East", "West"];

export const FilterDrawer: React.FC<FilterDrawerProps> = ({ isOpen, onClose, onApply, initialFilters }) => {
    const [filters, setFilters] = useState<FilterState>(initialFilters);

    useEffect(() => {
        setFilters(initialFilters);
    }, [initialFilters, isOpen]);

    const handleSectorToggle = (sector: string) => {
        setFilters(prev => ({
            ...prev,
            sectors: prev.sectors.includes(sector)
                ? prev.sectors.filter(s => s !== sector)
                : [...prev.sectors, sector]
        }));
    };

    const handleReset = () => {
        setFilters({
            sectors: [],
            minScore: 0,
            maxScore: 100,
            regions: [],
            status: undefined
        });
    };

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-[999] animate-in fade-in duration-300"
                    onClick={onClose}
                />
            )}

            {/* Drawer */}
            <div className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white shadow-2xl z-[1000] border-l border-slate-200 transform transition-transform duration-500 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 rounded-lg text-white">
                            <Filter size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-slate-900 tracking-tight">Intelligence Filters</h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Refine Data Vectors</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-200 rounded-full transition-all text-slate-400 hover:text-slate-600"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-grow overflow-y-auto p-8 space-y-10 custom-scrollbar">
                    {/* Sectors */}
                    <section>
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Target Sectors</h3>
                        <div className="flex flex-wrap gap-2">
                            {SECTOR_OPTIONS.map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => handleSectorToggle(opt)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${filters.sectors.includes(opt)
                                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100'
                                        : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600'
                                        }`}
                                >
                                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Score Range */}
                    <section>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Intelligence Rank Range</h3>
                            <span className="text-xs font-black text-indigo-600">{filters.minScore} - {filters.maxScore}</span>
                        </div>
                        <div className="space-y-6 px-1">
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={filters.minScore}
                                onChange={(e) => setFilters(prev => ({ ...prev, minScore: parseInt(e.target.value) }))}
                                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={filters.maxScore}
                                onChange={(e) => setFilters(prev => ({ ...prev, maxScore: parseInt(e.target.value) }))}
                                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                        </div>
                        <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-400">
                            <span>0 (ICE)</span>
                            <span>100 (VOLCANIC)</span>
                        </div>
                    </section>

                    {/* Regions */}
                    <section>
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Geographic Zones</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {REGION_OPTIONS.map(opt => (
                                <label key={opt} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition-all">
                                    <input
                                        type="checkbox"
                                        checked={filters.regions.includes(opt)}
                                        onChange={() => {
                                            setFilters(prev => ({
                                                ...prev,
                                                regions: prev.regions.includes(opt)
                                                    ? prev.regions.filter(r => r !== opt)
                                                    : [...prev.regions, opt]
                                            }));
                                        }}
                                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span className="text-xs font-bold text-slate-700">{opt} India</span>
                                </label>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-slate-100 bg-slate-50/50 space-y-4">
                    <button
                        onClick={() => onApply(filters)}
                        className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:shadow-indigo-200 transition-all active:scale-[0.98]"
                    >
                        Apply Filter Matrix <ChevronRight size={16} />
                    </button>
                    <button
                        onClick={handleReset}
                        className="w-full py-3 bg-white text-slate-400 rounded-2xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 border border-slate-200 hover:text-slate-600 hover:border-slate-300 transition-all"
                    >
                        <RotateCcw size={14} /> Reset Vectors
                    </button>
                </div>
            </div>
        </>
    );
};
