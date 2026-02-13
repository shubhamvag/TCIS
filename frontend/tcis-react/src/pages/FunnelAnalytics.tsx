import { useMemo, useState } from "react";
import { useApiQuery } from "../hooks/useApiQuery";
import { MetricCard } from "../components/MetricCard";
import { ChartWrapper } from "../components/ChartWrapper";
import { LoadingState } from "../components/LoadingState";
import { DataTable } from "../components/DataTable";
import {
    BarChart, Bar, XAxis, YAxis,
    Tooltip, ResponsiveContainer, Cell, LabelList,
    LineChart, Line, CartesianGrid
} from "recharts";
import { TrendingUp, Target, Zap, MousePointer2, CheckCircle, Users, ExternalLink } from "lucide-react";
import type { Lead } from "../api/types";

interface FunnelStage {
    stage: string;
    count: number;
    conversion_rate: number;
}

interface MonthlyYield {
    month: string;
    yield_rate: number;
}

interface FunnelData {
    stages: FunnelStage[];
    total_leads: number;
    won_count: number;
    conversion_efficiency: number;
    yield_trend: MonthlyYield[];
}

const STAGE_STATUS_MAP: Record<string, string> = {
    "New": "new",
    "Contacted": "contacted",
    "Qualified": "qualified",
    "Won": "won"
};

export default function FunnelAnalytics() {
    const { data, loading } = useApiQuery<FunnelData>("/scoring/funnel");
    const [selectedStage, setSelectedStage] = useState<string | null>(null);

    // Fetch leads for the selected stage
    const { data: leads, loading: leadsLoading } = useApiQuery<Lead[]>(
        selectedStage ? `/scoring/leads/ranked?status=${STAGE_STATUS_MAP[selectedStage as keyof typeof STAGE_STATUS_MAP]}&limit=10` : null
    );

    const chartData = useMemo(() => {
        if (!data) return [];
        return data.stages.map((s, i) => ({
            ...s,
            displayCount: s.count,
            color: i === 0 ? "#6366f1" : i === 1 ? "#818cf8" : i === 2 ? "#a5b4fc" : "#10b981",
            isSelected: selectedStage === s.stage
        }));
    }, [data, selectedStage]);

    if (loading) return <LoadingState message="Calculating funnel efficiency..." />;
    if (!data) return <div className="p-4 text-red-600">Error loading funnel data.</div>;

    const drillDownColumns = [
        {
            header: "Company",
            accessor: (l: Lead) => (
                <div className="flex flex-col">
                    <span className="font-bold text-slate-900">{l.company}</span>
                    <span className="text-[10px] text-slate-400 uppercase font-black">{l.sector}</span>
                </div>
            )
        },
        { header: "City", accessor: (l: Lead) => l.city },
        {
            header: "Score",
            accessor: (l: Lead) => (
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${(l.lead_score || 0) > 70 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                    {l.lead_score}
                </span>
            )
        },
        {
            header: "Action",
            accessor: (l: Lead) => (
                <a href={`/leads/${l.id}`} className="p-1 hover:bg-indigo-50 text-indigo-500 rounded-md transition-colors block">
                    <ExternalLink size={14} />
                </a>
            )
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 font-display">Sales Funnel Intelligence</h1>
                    <p className="text-slate-500 text-sm">Interactive analysis of pipeline conversion efficiency.</p>
                </div>
                <div className="flex gap-2">
                    <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-100 flex items-center gap-2">
                        <TrendingUp size={16} />
                        <span className="text-sm font-bold">{data.conversion_efficiency}% Total Yield</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <MetricCard label="Total Inquiries" value={data.total_leads} icon={Target} sub="Last 90 Days" />
                <MetricCard label="Conversions" value={data.won_count} icon={CheckCircle} sub="Won & Boarded" />
                <MetricCard label="Active Leads" value={data.stages[0].count + data.stages[1].count + data.stages[2].count} icon={Users} sub="Pipeline Volume" />
                <MetricCard label="Conversion Mix" value={`${data.conversion_efficiency}%`} icon={MousePointer2} sub="Yield Performance" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <ChartWrapper title="conversion Pipeline (Click Bars to Drill-Down)" height={400}>
                        <div className="h-full w-full pt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    layout="vertical"
                                    data={chartData}
                                    margin={{ top: 5, right: 40, left: 10, bottom: 5 }}
                                    onClick={(e: any) => {
                                        if (e && e.activeLabel) setSelectedStage(String(e.activeLabel));
                                    }}
                                >
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="stage"
                                        type="category"
                                        stroke="#64748b"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        width={80}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="displayCount" radius={[0, 8, 8, 0]} barSize={40} cursor="pointer">
                                        {chartData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={entry.color}
                                                stroke={entry.isSelected ? "#000" : "none"}
                                                strokeWidth={2}
                                                opacity={selectedStage ? (entry.isSelected ? 1 : 0.3) : 1}
                                            />
                                        ))}
                                        <LabelList dataKey="displayCount" position="right" offset={10} className="fill-slate-600 font-bold text-sm" />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </ChartWrapper>

                    {selectedStage && (
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 animate-in fade-in slide-in-from-bottom-2">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <span className="w-2 h-6 bg-indigo-500 rounded-full" />
                                    Top Leads in {selectedStage} Stage
                                </h3>
                                <button
                                    onClick={() => setSelectedStage(null)}
                                    className="text-xs text-slate-400 hover:text-slate-600 font-bold"
                                >
                                    Clear Selection
                                </button>
                            </div>

                            {leadsLoading ? (
                                <div className="py-12 flex justify-center">
                                    <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : (
                                <DataTable data={leads || []} columns={drillDownColumns} />
                            )}
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <ChartWrapper title="Monthly Yield Trend (%)" height={250}>
                        <div className="h-full w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data.yield_trend} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="month"
                                        tick={{ fontSize: 10, fill: '#94a3b8' }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis hide />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="yield_rate"
                                        stroke="#6366f1"
                                        strokeWidth={3}
                                        dot={{ fill: '#6366f1', strokeWidth: 2, r: 4, stroke: '#fff' }}
                                        activeDot={{ r: 6, strokeWidth: 0 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </ChartWrapper>

                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-slate-900 px-1">Phase Conversion Metrics</h3>
                        {data.stages.map((stage, i) => (
                            <div
                                key={stage.stage}
                                onClick={() => setSelectedStage(stage.stage)}
                                className={`p-4 rounded-2xl border transition-all cursor-pointer ${selectedStage === stage.stage
                                    ? "bg-indigo-50 border-indigo-500 shadow-md translate-x-1"
                                    : "bg-white border-slate-100 shadow-sm hover:border-indigo-200"
                                    } flex items-center justify-between group`}
                            >
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stage.stage} Stage</p>
                                    <p className="text-lg font-bold text-slate-900">{stage.count} Leads</p>
                                </div>
                                {i > 0 && (
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold text-indigo-500 uppercase">Conv. Rate</p>
                                        <p className="text-lg font-black text-indigo-600">{stage.conversion_rate}%</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="p-5 bg-indigo-600 rounded-3xl text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
                        <Zap className="absolute -right-4 -top-4 w-24 h-24 text-white/10 rotate-12" />
                        <h4 className="text-sm font-bold mb-1">Intelligence Insight</h4>
                        <p className="text-xs text-indigo-100 leading-relaxed">
                            Your strongest drop-off occurs between <strong>{data.stages[1].stage}</strong> and <strong>{data.stages[2].stage}</strong>.
                            Focusing on follow-up speed here could improve yield by 12%.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
