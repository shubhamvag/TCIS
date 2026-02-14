import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useClients } from "../hooks/useClients";
import { useAppStore } from "../store/useAppStore";
import { MetricCard } from "../components/MetricCard";
import { DataTable, type Column } from "../components/DataTable";
import { DashboardGrid, DashboardWidget } from "../components/DashboardGrid";
import { TrendingUp, AlertTriangle, Building, Briefcase, Download, UserPlus, FilterX } from "lucide-react";
import { ExpansionTargets } from "../components/ExpansionTargets";
import type { ExpansionTarget } from "../components/ExpansionTargets";
import { exportToCSV } from "../utils/ExportUtility";
import { ClientCreationModal } from "../components/ClientCreationModal";
import { CardSkeleton } from "../components/ui/skeletons/CardSkeleton";
import { QueryErrorState } from "../components/ui/QueryErrorState";
import { EmptyState } from "../components/ui/EmptyState";
import type { Client } from "../api/types";

export default function ClientsDashboard() {
    const { data: rawClients, isLoading, error, refetch } = useClients();
    const filters = useAppStore((state) => state.filters);
    const resetFilters = useAppStore((state) => state.resetFilters);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const clients = useMemo(() => {
        if (!rawClients) return [];
        return rawClients.filter(c => {
            const sectorMatch = filters.sectors.length === 0 || filters.sectors.includes(c.sector);
            const scoreMatch = c.upsell_score >= filters.minScore && c.upsell_score <= filters.maxScore;
            const regionMatch = filters.regions.length === 0 || filters.regions.includes(c.region || "");
            const searchMatch = !filters.searchQuery ||
                c.company.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
                c.sector.toLowerCase().includes(filters.searchQuery.toLowerCase());

            return sectorMatch && scoreMatch && regionMatch && searchMatch;
        });
    }, [rawClients, filters]);

    const metrics = useMemo(() => {
        if (!clients.length) return { base: 0, avgUpsell: "0.0", highYield: 0, riskActive: 0 };
        return {
            base: clients.length,
            avgUpsell: (clients.reduce((acc, c) => acc + c.upsell_score, 0) / clients.length).toFixed(1),
            highYield: clients.filter(c => c.upsell_score >= 70).length,
            riskActive: clients.filter(c => c.risk_score >= 50).length,
        };
    }, [clients]);

    const expansionItems = useMemo<ExpansionTarget[]>(() => {
        return clients
            .sort((a, b) => b.upsell_score - a.upsell_score)
            .slice(0, 8)
            .map(c => ({
                id: c.id.toString(),
                name: c.company,
                score: c.upsell_score,
                subtext: `${c.sector} • ${c.city}`
            }));
    }, [clients]);

    const columns: Column<Client>[] = [
        {
            header: "Company",
            accessor: (c) => (
                <div className="flex flex-col">
                    <Link to={`/clients/${c.id}`} className="font-bold text-slate-900 hover:text-indigo-600 transition-colors">{c.company}</Link>
                    {c.parent_id && <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest mt-0.5">Branch Account</span>}
                </div>
            ),
            sortable: true,
            sortKey: "company"
        },
        {
            header: "Location",
            accessor: (c) => (c.city && c.region) ? <span className="text-slate-600">{c.city}, {c.region}</span> : <span className="text-slate-400">-</span>
        },
        {
            header: "Industry",
            accessor: (c) => <span className="capitalize px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-600">{c.sector}</span>,
            sortable: true,
            sortKey: "sector"
        },
        {
            header: "Upsell Opp",
            sortable: true,
            sortKey: "upsell_score",
            accessor: (c) => (
                <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div className={`h-full ${c.upsell_score >= 70 ? 'bg-blue-600' : 'bg-blue-400'}`} style={{ width: `${c.upsell_score}%` }}></div>
                    </div>
                    <span className="text-xs font-black text-slate-700">{c.upsell_score}</span>
                </div>
            )
        },
        { header: "Recommended", accessor: (c) => <span className="text-slate-500 text-[10px] font-medium truncate max-w-[120px] inline-block">{c.recommended_packs.join(", ") || "None"}</span> },
        {
            header: "Risk",
            sortable: true,
            sortKey: "risk_score",
            accessor: (c) => c.risk_flag ? (
                <div className="flex items-center gap-1 text-rose-600 font-bold text-xs bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                    <AlertTriangle className="w-3 h-3" />
                    {c.risk_score}
                </div>
            ) : <span className="text-slate-300">-</span>
        }
    ];


    return (
        <div className="space-y-8 pb-12">
            {/* Dashboard Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Clients Dashboard</h1>
                    <p className="text-slate-500 font-medium">Account health monitoring and upsell intelligence.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={resetFilters}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
                    >
                        <FilterX size={14} /> Reset
                    </button>
                    <button
                        onClick={() => exportToCSV(clients, "TCIS_Clients_Intelligence")}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
                    >
                        <Download size={14} /> Export
                    </button>
                    <button
                        onClick={() => setIsCreateOpen(true)}
                        className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95"
                    >
                        <UserPlus size={14} /> Add Client
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
            {!isLoading && !error && clients.length === 0 && (
                <EmptyState
                    icon={Building}
                    title="No clients found"
                    description="No clients match your current filters. Try adjusting your search criteria or add a new client to get started."
                    action={{
                        label: "Add New Client",
                        onClick: () => setIsCreateOpen(true)
                    }}
                />
            )}

            {/* Main Content Grid */}
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
                        <MetricCard label="Total Accounts" value={metrics.base} icon={Building} />
                        <MetricCard label="Avg Upsell Score" value={metrics.avgUpsell} icon={TrendingUp} />
                        <MetricCard label="High Yield" value={metrics.highYield} icon={Briefcase} />
                        <MetricCard label="At Risk" value={metrics.riskActive} icon={AlertTriangle} />
                    </>
                )}
            </div>

            {/* Main Content Grid */}
            <DashboardGrid cols={3}>
                <DashboardWidget colSpan={2} title="Client Portfolio" subtitle="Active Accounts & Health Status">
                    <DataTable data={clients} columns={columns} isLoading={isLoading} />
                </DashboardWidget>

                <div className="space-y-6 lg:sticky lg:top-6">
                    <ExpansionTargets
                        title="Expansion Targets"
                        items={expansionItems}
                        maxHeight="calc(100vh - 200px)"
                    />
                </div>
            </DashboardGrid>

            {/* Modals */}
            <ClientCreationModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onSuccess={() => refetch()}
            />
        </div>
    );
}
