import { useMemo } from "react";
import { useApiQuery } from "../hooks/useApiQuery";
import type { TicketStats } from "../api/types";
import { MetricCard } from "../components/MetricCard";
import { ChartWrapper } from "../components/ChartWrapper";
import { LoadingState } from "../components/LoadingState";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Ticket, Clock, AlertCircle, CheckCircle } from "lucide-react";

const COLORS = ["#0f172a", "#334155", "#475569", "#64748b", "#94a3b8"];

export default function SupportAnalytics() {
    const { data: stats, loading } = useApiQuery<TicketStats>("/tickets/stats");

    const metrics = useMemo(() => {
        if (!stats) return { total: 0, active: 0 };
        const total = stats.by_type.reduce((acc, t) => acc + t.count, 0);
        const active = stats.by_status.filter(s => ['open', 'in_progress'].includes(s.status)).reduce((acc, s) => acc + s.count, 0);
        return { total, active };
    }, [stats]);

    if (loading) return <LoadingState />;
    if (!stats) return <div className="p-4 text-red-600 bg-red-50 border border-red-200 rounded">Error loading data. Please check backend connection.</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">Support Signals</h1>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <MetricCard label="Total Tickets" value={metrics.total} sub="Last 90 Days" icon={Ticket} />
                <MetricCard label="Active Operations" value={metrics.active} sub="Requiring Attention" icon={AlertCircle} />
                <MetricCard label="System Health" value="98.2%" sub="Uptime" icon={CheckCircle} />
                <MetricCard label="Avg Resolution" value="4.2d" sub="On Target" icon={Clock} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ChartWrapper title="Ticket Distribution by Type" height={350}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={stats?.by_type || []}
                                dataKey="count"
                                nameKey="type"
                                cx="50%" cy="50%"
                                outerRadius={100}
                                innerRadius={60}
                            >
                                {(stats?.by_type || []).map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="white" strokeWidth={2} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ borderColor: '#e2e8f0', fontSize: '12px' }} />
                            <Legend wrapperStyle={{ fontSize: '12px' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartWrapper>

                <ChartWrapper title="High Load Accounts" height={350}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart layout="vertical" data={stats?.top_clients || []} margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                            <XAxis type="number" hide />
                            <YAxis type="category" dataKey="company" stroke="#64748b" width={90} tick={{ fontSize: 11 }} tickLine={false} />
                            <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderColor: '#e2e8f0', fontSize: '12px' }} />
                            <Bar dataKey="ticket_count" fill="#3b82f6" barSize={20} radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartWrapper>
            </div>
        </div>
    );
}
