import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useApiQuery } from "../hooks/useApiQuery";
import type { Client } from "../api/types";
import { MetricCard } from "../components/MetricCard";
import { DataTable } from "../components/DataTable";
import { LoadingState } from "../components/LoadingState";
import { TrendingUp, AlertTriangle, Building, Briefcase, X } from "lucide-react";

import { ExpansionTargets } from "../components/ExpansionTargets";
import type { ExpansionTarget } from "../components/ExpansionTargets";

export default function ClientsDashboard() {
    const [searchParams, setSearchParams] = useSearchParams();
    const stateFilter = searchParams.get("state");
    const { data: clients, loading } = useApiQuery<Client[]>("/scoring/clients/ranked", {
        params: { limit: 50, state: stateFilter || undefined }
    });

    const metrics = useMemo(() => {
        if (!clients) return { base: 0, avgUpsell: "0.0", highYield: 0, riskActive: 0 };
        return {
            base: clients.length,
            avgUpsell: (clients.reduce((acc, c) => acc + c.upsell_score, 0) / clients.length).toFixed(1),
            highYield: clients.filter(c => c.upsell_score >= 70).length,
            riskActive: clients.filter(c => c.risk_score >= 50).length,
        };
    }, [clients]);

    const expansionItems = useMemo<ExpansionTarget[]>(() => {
        if (!clients) return [];
        return [...clients]
            .sort((a, b) => b.upsell_score - a.upsell_score)
            .map(c => ({
                id: c.id.toString(),
                name: c.company,
                score: c.upsell_score,
                subtext: `${c.sector} • ${c.city}`
            }));
    }, [clients]);

    if (loading) return <LoadingState message="Loading client intelligence..." />;
    if (!clients) return <div className="p-4 text-red-600 bg-red-50 border border-red-200 rounded">Error loading data. Please check backend connection.</div>;

    const columns = [
        {
            header: "Company",
            accessor: (c: Client) => (
                <div className="flex flex-col">
                    <Link to={`/clients/${c.id}`} className="font-medium text-indigo-600 hover:text-indigo-800 hover:underline transition-colors">{c.company}</Link>
                    {c.parent_id && <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest mt-0.5">Branch Account</span>}
                </div>
            )
        },
        { header: "Location", accessor: (c: Client) => (c.city && c.region) ? <span className="text-slate-600">{c.city}, {c.region}</span> : <span className="text-slate-400">-</span> },
        { header: "Industry", accessor: (c: Client) => <span className="capitalize">{c.sector}</span> },
        {
            header: "Upsell Opp",
            accessor: (c: Client) => (
                <div className="flex items-center gap-2">
                    <div className={`w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden`}>
                        <div className="h-full bg-blue-500" style={{ width: `${c.upsell_score}%` }}></div>
                    </div>
                    <span className="text-xs font-semibold text-slate-700">{c.upsell_score}</span>
                </div>
            )
        },
        { header: "Recommended", accessor: (c: Client) => <span className="text-slate-500 text-xs truncate max-w-[150px] inline-block">{c.recommended_packs.join(", ") || "None"}</span> },
        {
            header: "Risk",
            accessor: (c: Client) => c.risk_flag ? (
                <div className="flex items-center gap-1 text-red-600 font-bold text-xs">
                    <AlertTriangle className="w-3 h-3" />
                    {c.risk_score}
                </div>
            ) : <span className="text-slate-400">-</span>
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold text-slate-900">Clients Dashboard</h1>
                {stateFilter && (
                    <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-bold border border-indigo-100 animate-in zoom-in duration-300">
                        State: {stateFilter}
                        <button onClick={() => setSearchParams({})} className="hover:text-indigo-900 transition-colors p-0.5" title="Clear filter">
                            <X size={14} />
                        </button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <MetricCard label="Total Accounts" value={metrics.base} icon={Building} />
                <MetricCard label="Avg Upsell Score" value={metrics.avgUpsell} icon={TrendingUp} />
                <MetricCard label="High Yield" value={metrics.highYield} icon={Briefcase} />
                <MetricCard label="At Risk" value={metrics.riskActive} icon={AlertTriangle} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-2">
                    <DataTable data={clients || []} columns={columns} />
                </div>
                <div className="lg:sticky lg:top-6">
                    <ExpansionTargets
                        title="Expansion Targets"
                        items={expansionItems}
                        maxHeight="calc(100vh - 300px)"
                    />
                </div>
            </div>
        </div>
    );
}
