import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useLeads } from "../hooks/useLeads";
import { useAppStore } from "../store/useAppStore";
import { MetricCard } from "../components/MetricCard";
import { DataTable, type Column } from "../components/DataTable";
import { DashboardGrid, DashboardWidget } from "../components/DashboardGrid";
import { CardSkeleton } from "../components/ui/skeletons/CardSkeleton";
import { ChartSkeleton } from "../components/ui/skeletons/ChartSkeleton";
import {
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    ZAxis,
    Tooltip,
    ResponsiveContainer
} from "recharts";
import { Users, Target, Activity, Award, Download, UserPlus, FilterX } from "lucide-react";
import { ExpansionTargets } from "../components/ExpansionTargets";
import type { ExpansionTarget } from "../components/ExpansionTargets";
import { exportToCSV } from "../utils/ExportUtility";
import { LeadCreationModal } from "../components/LeadCreationModal";
import { QueryErrorState } from "../components/ui/QueryErrorState";
import { EmptyState } from "../components/ui/EmptyState";
import type { Lead } from "../api/types";

export default function LeadsDashboard() {
    const { data: rawLeads, isLoading, error, refetch } = useLeads();
    const filters = useAppStore((state) => state.filters);
    const resetFilters = useAppStore((state) => state.resetFilters);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const leads = useMemo(() => {
        if (!rawLeads) return [];
        return rawLeads.filter(l => {
            const sectorMatch = filters.sectors.length === 0 || filters.sectors.includes(l.sector);
            const regionMatch = filters.regions.length === 0 || filters.regions.includes(l.region || "");
            const scoreMatch = l.lead_score >= filters.minScore && l.lead_score <= filters.maxScore;
            const searchMatch = !filters.searchQuery ||
                l.company.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
                l.sector.toLowerCase().includes(filters.searchQuery.toLowerCase());

            return sectorMatch && regionMatch && scoreMatch && searchMatch && l.status !== 'converted';
        });
    }, [rawLeads, filters]);

    const metrics = useMemo(() => {
        if (!leads.length) return { qualified: 0, hotTargets: 0, avgScore: "0.0", mfgCore: 0 };
        return {
            qualified: leads.length,
            hotTargets: leads.filter((l) => l.lead_score >= 75).length,
            avgScore: (leads.reduce((a, b) => a + b.lead_score, 0) / leads.length).toFixed(1),
            mfgCore: leads.filter((l) => l.sector === "manufacturing").length,
        };
    }, [leads]);

    const hotTargets = useMemo<ExpansionTarget[]>(() => {
        return leads
            .filter(l => l.lead_score >= 70)
            .sort((a, b) => b.lead_score - a.lead_score)
            .slice(0, 5)
            .map(l => ({
                id: l.id.toString(),
                name: l.company,
                score: l.lead_score,
                subtext: `${l.sector} • ${l.city || 'Regional'}`
            }));
    }, [leads]);

    const columns: Column<Lead>[] = [
        {
            header: "Company",
            accessor: (l) => <Link to={`/leads/${l.id}`} className="font-bold text-slate-900 hover:text-indigo-600 transition-colors">{l.company}</Link>,
            sortable: true,
            sortKey: "company"
        },
        {
            header: "Location",
            accessor: (l) => <span>{l.city || 'N/A'}, {l.region || 'N/A'}</span>
        },
        {
            header: "Sector",
            accessor: (l) => <span className="capitalize px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-600">{l.sector}</span>,
            sortable: true,
            sortKey: "sector"
        },
        {
            header: "Score",
            sortable: true,
            sortKey: "lead_score",
            accessor: (l) => (
                <div className="flex items-center gap-2">
                    <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full ${l.lead_score >= 80 ? 'bg-emerald-500' : l.lead_score >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`}
                            style={{ width: `${l.lead_score}%` }}
                        />
                    </div>
                    <span className="font-black text-slate-700 w-6">{l.lead_score}</span>
                </div>
            )
        },
        {
            header: "Status",
            accessor: (l) => (
                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-black border ${l.status === 'new' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-600 border-slate-100'
                    }`}>
                    {l.status}
                </span>
            )
        }
    ];


    return (
        <div className="space-y-8 pb-12">
            {/* Dashboard Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Leads Dashboard</h1>
                    <p className="text-slate-500 font-medium">Deterministic scoring for high-fidelity conversion targets.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={resetFilters}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
                    >
                        <FilterX size={14} /> Reset
                    </button>
                    <button
                        onClick={() => exportToCSV(leads, "TCIS_Leads")}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
                    >
                        <Download size={14} /> Export
                    </button>
                    <button
                        onClick={() => setIsCreateOpen(true)}
                        className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95"
                    >
                        <UserPlus size={14} /> Add Target
                    </button>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <QueryErrorState
                    error={error as Error}
                    onRetry={() => refetch()}
                />
            )}

            {/* Empty State */}
            {!isLoading && !error && leads.length === 0 && (
                <EmptyState
                    icon={Users}
                    title="No leads found"
                    description="No leads match your current filters. Try adjusting your search criteria or add a new lead to get started."
                    action={{
                        label: "Add New Lead",
                        onClick: () => setIsCreateOpen(true)
                    }}
                />
            )}

            {/* Metrics Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {isLoading ? (
                    <>
                        <CardSkeleton />
                        <CardSkeleton />
                        <CardSkeleton />
                        <CardSkeleton />
                    </>
                ) : (
                    <>
                        <MetricCard label="Active Targets" value={metrics.qualified} sub="In pipeline" icon={Users} />
                        <MetricCard label="Hot Targets" value={metrics.hotTargets} sub="Score > 75" icon={Target} />
                        <MetricCard label="Avg Quality" value={metrics.avgScore} sub="Index" icon={Activity} />
                        <MetricCard label="Manufacturing" value={metrics.mfgCore} sub="Sector Core" icon={Award} />
                    </>
                )}
            </div>

            {/* Main Content Grid */}
            <DashboardGrid cols={3}>
                <DashboardWidget colSpan={2} title="Qualified Intelligence Feed" subtitle="Ranked by deterministic conversion probability">
                    <DataTable data={leads} columns={columns} isLoading={isLoading} />
                </DashboardWidget>

                <div className="space-y-6">
                    <DashboardWidget title="Lead Distribution" subtitle="Sector vs Quality Mapping">
                        {isLoading ? (
                            <ChartSkeleton height={260} />
                        ) : (
                            <ResponsiveContainer width="100%" height={260}>
                                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                                    <XAxis type="number" dataKey="lead_score" name="Score" domain={[0, 100]} stroke="#94a3b8" fontSize={10} tickLine={false} />
                                    <YAxis type="category" dataKey="sector" name="Sector" stroke="#94a3b8" width={60} fontSize={10} tickLine={false} />
                                    <ZAxis type="number" dataKey="lead_score" range={[50, 400]} />
                                    <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ borderColor: '#f1f5f9', borderRadius: '12px', fontSize: '10px' }} />
                                    <Scatter name="Leads" data={leads} fill="#0f172a" />
                                </ScatterChart>
                            </ResponsiveContainer>
                        )}
                    </DashboardWidget>

                    <ExpansionTargets
                        title="Top Priority Targets"
                        items={hotTargets}
                        maxHeight={350}
                    />
                </div>
            </DashboardGrid>

            {/* Modals */}
            <LeadCreationModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onSuccess={() => refetch()}
            />
        </div>
    );
}
