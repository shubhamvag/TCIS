import React, { useMemo } from "react";
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Tooltip
} from "recharts";
import { Info } from "lucide-react";

interface ScoringRadarChartProps {
    breakdown: Record<string, number>;
    height?: number;
}

const VECTOR_DESCRIPTIONS: Record<string, string> = {
    // Lead Vectors
    "Sector Fit": "Matching business sector to Tally's core strengths.",
    "Size Fit": "Company size relative to ideal customer profile.",
    "Source Quality": "Confidence in lead origin (Referral vs. Cold).",
    "Module Interest": "Specific product interest expressed by the lead.",
    "Engagement Recency": "Time elapsed since last meaningful interaction.",
    // Client Vectors
    "Product Gap": "Number of core Tally products not yet installed.",
    "Recency Score": "Stagnation check: Time since last project implementation.",
    "Size/Sector Fit": "Cross-referenced ICP match for existing clients."
};

export const ScoringRadarChart: React.FC<ScoringRadarChartProps> = ({ breakdown, height = 300 }) => {
    const data = useMemo(() => {
        return Object.entries(breakdown).map(([key, value]) => ({
            subject: key,
            value: value,
            fullMark: 100,
        }));
    }, [breakdown]);

    if (Object.keys(breakdown).length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-lg">
                <Info size={24} className="mb-2" />
                <p className="text-sm font-medium">Scoring breakdown not available.</p>
            </div>
        );
    }

    return (
        <div style={{ width: '100%', height }} className="relative">
            <ResponsiveContainer>
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                    />
                    <PolarRadiusAxis
                        angle={30}
                        domain={[0, 100]}
                        tick={false}
                        axisLine={false}
                    />
                    <Tooltip
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                return (
                                    <div className="bg-white p-4 border border-slate-200 shadow-xl rounded-xl max-w-[200px]">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 pb-1 border-b border-slate-50">
                                            {payload[0].payload.subject}
                                        </p>
                                        <div className="flex items-center gap-2 my-2">
                                            <span className="text-2xl font-black text-indigo-600">
                                                {payload[0].value}%
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-500 uppercase">Weight</span>
                                        </div>
                                        <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                                            {VECTOR_DESCRIPTIONS[payload[0].payload.subject] || "Aggregated scoring vector."}
                                        </p>
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />
                    <Radar
                        name="Score Factor"
                        dataKey="value"
                        stroke="#6366f1"
                        fill="#6366f1"
                        fillOpacity={0.4}
                        strokeWidth={2}
                        animationDuration={1500}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
};
