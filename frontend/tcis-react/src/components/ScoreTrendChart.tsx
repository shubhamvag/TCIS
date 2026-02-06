import React, { useMemo } from "react";
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart
} from "recharts";
import type { ScoreHistory } from "../api/types";
import { TrendingUp, TrendingDown, Minus, Lightbulb } from "lucide-react";

interface ScoreTrendChartProps {
    data: ScoreHistory[];
    height?: number;
    entityType: 'lead' | 'client';
}

export const ScoreTrendChart: React.FC<ScoreTrendChartProps> = ({ data, height = 240, entityType }) => {
    // 1. Format and Sort Data
    const formattedData = useMemo(() => {
        return [...data]
            .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime())
            .map(item => ({
                score: item.score,
                date: new Date(item.recorded_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                fullDate: new Date(item.recorded_at).toLocaleString()
            }));
    }, [data]);

    // 2. Advanced Momentum Logic (3-point Slope)
    const analysis = useMemo(() => {
        if (data.length < 3) return null;

        // We look at the most recent 3 points to determine trajectory
        const sorted = [...data].sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime());
        const p1 = sorted[0].score;
        const p2 = sorted[1].score;
        const p3 = sorted[2].score;

        const avgSlope = ((p1 - p2) + (p2 - p3)) / 2;
        const currentScore = p1;

        // Status Definition
        let status: 'Improving' | 'Stable' | 'Declining' = 'Stable';
        if (avgSlope > 2) status = 'Improving';
        if (avgSlope < -5) status = 'Declining';

        // Strategic Recommendation
        let recommendation = "";
        if (entityType === 'lead') {
            if (currentScore > 70 && status === 'Improving') recommendation = "High Priority: Fast-track to negotiation.";
            else if (status === 'Declining') recommendation = "Warning: Cooling interest. Schedule a re-engagement call.";
            else recommendation = "Steady Lead: Maintain existing contact cycle.";
        } else {
            if (currentScore > 70 && status === 'Improving') recommendation = "Strong Upsell: Propose Expansion Pack immediately.";
            else if (status === 'Declining') recommendation = "At Risk: Review support tickets before any expansion talks.";
            else recommendation = "Healthy Account: Standard quarterly review recommended.";
        }

        return {
            slope: avgSlope.toFixed(1),
            status,
            recommendation,
            currentScore
        };
    }, [data, entityType]);

    if (data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-lg">
                <Minus size={24} className="mb-2" />
                <p className="text-sm font-medium">Historical baseline not established.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {analysis && (
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black tracking-widest uppercase border ${analysis.status === 'Improving' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                                analysis.status === 'Declining' ? "bg-rose-50 text-rose-700 border-rose-100" :
                                    "bg-slate-50 text-slate-600 border-slate-200"
                            }`}>
                            {analysis.status === 'Improving' && <TrendingUp size={14} />}
                            {analysis.status === 'Declining' && <TrendingDown size={14} />}
                            {analysis.status === 'Stable' && <Minus size={14} />}
                            {analysis.status}
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            Trajectory: {parseFloat(analysis.slope) > 0 ? "+" : ""}{analysis.slope} points / week
                        </div>
                    </div>

                    <div className="p-4 bg-indigo-50/50 border border-indigo-100/50 rounded-xl flex gap-3 items-start animate-in fade-in zoom-in duration-500">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                            <Lightbulb className="text-indigo-600" size={18} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Intelligence Signal</p>
                            <p className="text-xs font-bold text-slate-800 leading-normal">{analysis.recommendation}</p>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ width: '100%', height }} className="pt-2">
                <ResponsiveContainer>
                    <AreaChart data={formattedData}>
                        <defs>
                            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="date"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            stroke="#94a3b8"
                            dy={10}
                        />
                        <YAxis
                            hide
                            domain={[0, 100]}
                        />
                        <Tooltip
                            cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-white p-3 border border-slate-200 shadow-xl rounded-lg">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{payload[0].payload.date}</p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xl font-black text-indigo-600">{payload[0].value}</span>
                                                <span className="text-[10px] font-bold text-slate-500 uppercase">Intelligence Rank</span>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="score"
                            stroke="#6366f1"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorScore)"
                            dot={false}
                            activeDot={{ r: 6, fill: '#6366f1', strokeWidth: 0 }}
                            animationDuration={1500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
