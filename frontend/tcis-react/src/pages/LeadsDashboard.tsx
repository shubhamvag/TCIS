import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useApiQuery } from "../hooks/useApiQuery";
import type { Lead } from "../api/types";
import { MetricCard } from "../components/MetricCard";
import { DataTable } from "../components/DataTable";
import { ChartWrapper } from "../components/ChartWrapper";
import { LoadingState } from "../components/LoadingState";
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Users, Target, Activity, Award, X } from "lucide-react";

import { ExpansionTargets } from "../components/ExpansionTargets";
import type { ExpansionTarget } from "../components/ExpansionTargets";

export default function LeadsDashboard() {
    const [searchParams, setSearchParams] = useSearchParams();
    const stateFilter = searchParams.get("state");
    const { data: leads, loading } = useApiQuery<Lead[]>("/scoring/leads/ranked", {
        params: { limit: 50, state: stateFilter || undefined }
    });

    const metrics = useMemo(() => {
        if (!leads) return { qualified: 0, hotTargets: 0, avgScore: "0.0", mfgCore: 0 };
        return {
            qualified: leads.length,
            hotTargets: leads.filter((l) => l.lead_score >= 75).length,
            avgScore: (leads.reduce((a, b) => a + b.lead_score, 0) / leads.length).toFixed(1),
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
                <div className="flex gap-2">
                    <select className="bg-white border border-slate-300 text-slate-700 text-sm rounded px-3 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none">
                        <option>Last 30 Days</option>
                        <option>All Time</option>
                    </select>
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
        </div>
    );
}
