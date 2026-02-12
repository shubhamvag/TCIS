import { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useApiQuery } from "../hooks/useApiQuery";
import type { Lead } from "../api/types";
import { MetricCard } from "../components/MetricCard";
import { DataTable } from "../components/DataTable";
import { ChartWrapper } from "../components/ChartWrapper";
import { LoadingState } from "../components/LoadingState";
import {
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    ZAxis,
    Tooltip,
    ResponsiveContainer
} from "recharts";
import { Users, Target, Activity, Award, X, Filter, Download } from "lucide-react";

import { ExpansionTargets } from "../components/ExpansionTargets";
import type { ExpansionTarget } from "../components/ExpansionTargets";
import { FilterDrawer, type FilterState } from "../components/FilterDrawer";
import { exportToCSV } from "../utils/ExportUtility";

export default function LeadsDashboard() {
    const [searchParams, setSearchParams] = useSearchParams();
    const stateFilter = searchParams.get("state");

    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [activeFilters, setActiveFilters] = useState<FilterState>({
        sectors: [],
        minScore: 0,
        maxScore: 100,
        regions: []
    });

    const { data: rawLeads, loading } = useApiQuery<Lead[]>("/scoring/leads/ranked", {
        params: { limit: 100, state: stateFilter || undefined }
    });

    const leads = useMemo(() => {
        if (!rawLeads) return null;
        return rawLeads.filter(l => {
            const sectorMatch = activeFilters.sectors.length === 0 || activeFilters.sectors.includes(l.sector);
            const scoreMatch = l.lead_score >= activeFilters.minScore && l.lead_score <= activeFilters.maxScore;
            const regionMatch = activeFilters.regions.length === 0 || activeFilters.regions.includes(l.region || "");
            return sectorMatch && scoreMatch && regionMatch;
        });
    }, [rawLeads, activeFilters]);

    const handleExport = () => {
        if (!leads) return;
        exportToCSV(leads, "TCIS_Leads_Intelligence");
    };

    const metrics = useMemo(() => {
        if (!leads) return { qualified: 0, hotTargets: 0, avgScore: "0.0", mfgCore: 0 };
        return {
            qualified: leads.length,
            hotTargets: leads.filter((l) => l.lead_score >= 75).length,
            avgScore: leads.length > 0
                ? (leads.reduce((a, b) => a + b.lead_score, 0) / leads.length).toFixed(1)
                : "0.0",
            mfgCore: leads.filter((l) => l.sector === "manufacturing").length,
        };
    }, [leads]);

    const hotTargets = useMemo<ExpansionTarget[]>(() => {
        if (!leads) return [];
        return [...leads]
            .filter(l => l.lead_score >= 70)
            .sort((a, b) => b.lead_score - a.lead_score)
            .map(l => ({
                id: l.id.toString(),
                name: l.company,
                score: l.lead_score,
                subtext: `${l.sector} • ${l.city || 'Regional'}`
            }));
    }, [leads]);

    if (loading) return <LoadingState message="Loading leads intelligence..." />;
    if (!leads) return <div className="p-4 text-red-600 bg-red-50 border border-red-200 rounded">Error loading data. Please check backend connection.</div>;

    const columns = [
        { header: "Company", accessor: (l: Lead) => <Link to={`/leads/${l.id}`} className="font-medium text-indigo-600 hover:text-indigo-800 hover:underline transition-colors">{l.company}</Link> },
        { header: "Location", accessor: (l: Lead) => (l.city && l.region) ? <span>{l.city}, {l.region}</span> : <span className="text-slate-400">N/A</span> },
        { header: "Sector", accessor: (l: Lead) => <span className="capitalize">{l.sector}</span> },
        {
            header: "Score",
            accessor: (l: Lead) => (
                <span className={`font-bold ${l.lead_score >= 75 ? 'text-green-600' : 'text-blue-600'}`}>
                    {l.lead_score}
                </span>
            )
        },
        { header: "Strategy", accessor: (l: Lead) => l.suggested_next_action },
        {
            header: "Status",
            accessor: (l: Lead) => (
                <span className={`px-2 py-0.5 rounded text-xs uppercase font-bold border ${l.status === 'new' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                    {l.status}
                </span>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-slate-900">Leads Dashboard</h1>
                    {stateFilter && (
                        <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-bold border border-indigo-100 animate-in zoom-in duration-300">
                            State: {stateFilter}
                            <button onClick={() => setSearchParams({})} className="hover:text-indigo-900 transition-colors p-0.5" title="Clear filter">
                                <X size={14} />
                            </button>
                        </div>
                    )}
                </div>
                <div className="flex gap-3 items-center">
                    <button
                        onClick={() => setIsFilterOpen(true)}
                        className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-sm font-bold transition-all shadow-sm ${activeFilters.sectors.length > 0 || activeFilters.regions.length > 0 || activeFilters.minScore > 0 || activeFilters.maxScore < 100
                                ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                                : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300"
                            }`}
                    >
                        <Filter size={16} /> Filter Vectors
                        {(activeFilters.sectors.length > 0 || activeFilters.regions.length > 0) && (
                            <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                        )}
                    </button>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98]"
                    >
                        <Download size={16} /> Export CSV
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <MetricCard label="Qualified Leads" value={metrics.qualified} sub="+12 this week" icon={Users} />
                <MetricCard label="Hot Targets" value={metrics.hotTargets} sub="Urgent Action" icon={Target} />
                <MetricCard label="Avg Quality" value={metrics.avgScore} sub="Score Index" icon={Activity} />
                <MetricCard label="Mfg Core" value={metrics.mfgCore} sub="Sector Focus" icon={Award} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-2">
                    <DataTable data={leads || []} columns={columns} />
                </div>
                <div className="space-y-6 lg:sticky lg:top-6">
                    <ChartWrapper title="Score Distribution">
                        <ResponsiveContainer width="100%" height={240}>
                            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                                <XAxis type="number" dataKey="lead_score" name="Score" domain={[0, 100]} stroke="#94a3b8" fontSize={10} tickLine={false} />
                                <YAxis type="category" dataKey="sector" name="Sector" stroke="#94a3b8" width={60} fontSize={10} tickLine={false} />
                                <ZAxis type="number" dataKey="lead_score" range={[50, 400]} />
                                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ borderColor: '#e2e8f0', fontSize: '10px' }} />
                                <Scatter name="Leads" data={leads || []} fill="#3b82f6" />
                            </ScatterChart>
                        </ResponsiveContainer>
                    </ChartWrapper>

                    <ExpansionTargets
                        title="Top Lead Targets"
                        items={hotTargets}
                        maxHeight={300}
                    />
                </div>
            </div>

            <FilterDrawer
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                initialFilters={activeFilters}
                onApply={(f) => {
                    setActiveFilters(f);
                    setIsFilterOpen(false);
                }}
            />
        </div>
    );
}
