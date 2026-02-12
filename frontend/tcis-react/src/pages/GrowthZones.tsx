import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useApiQuery } from "../hooks/useApiQuery";
import type { GeoSummary, MarketAnomaly } from "../api/types";
import { LoadingState } from "../components/LoadingState";
import India from "@react-map/india";
import {
    Map as MapIcon,
    TrendingUp,
    Compass,
    Users,
    AlertCircle,
    CheckCircle2,
    Target
} from "lucide-react";
import { ExpansionTargets } from "../components/ExpansionTargets";
import { LocalErrorBoundary } from "../components/LocalErrorBoundary";

const GrowthZones: React.FC = () => {
    const [sector, setSector] = useState<string>("all");
    const { data: geo, loading } = useApiQuery<GeoSummary>("/scoring/geo/summary", { params: { sector: sector === "all" ? undefined : sector } });
    const { data: anomalies } = useApiQuery<MarketAnomaly[]>("/scoring/anomalies");
    const [selectedStateName, setSelectedStateName] = useState<string | null>(null);

    const stateColors = useMemo(() => {
        if (!geo) return {};
        const colors: Record<string, string> = {};
        Object.entries(geo.states).forEach(([name, metrics]) => {
            const density = metrics.opportunity_density;
            if (density >= 75) colors[name] = "#10b981"; // emerald-500
            else if (density >= 45) colors[name] = "#6366f1"; // indigo-500
            else if (density >= 20) colors[name] = "#f59e0b"; // amber-500
            else colors[name] = "#f1f5f9"; // slate-100
        });
        return colors;
    }, [geo]);

    const activeState = selectedStateName ? geo?.states[selectedStateName] : null;

    if (loading) return <LoadingState message="Connecting to India Geographic Intelligence..." />;
    if (!geo) return <div className="p-8 text-center text-rose-600 bg-rose-50 rounded-2xl border border-rose-100 font-bold">Failed to load Market Intelligence.</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-700 h-full flex flex-col">
            <header className="flex justify-between items-end bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex-shrink-0">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 rounded-xl">
                        <MapIcon className="text-indigo-600" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Market Explorer</h1>
                        <p className="text-slate-500 text-sm font-medium mt-1 uppercase tracking-widest flex items-center gap-2">
                            India Geocentric Analytics
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        </p>
                    </div>
                </div>
                <div className="flex gap-4 items-center">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">State Search</span>
                        <select
                            value={selectedStateName || ""}
                            onChange={(e) => setSelectedStateName(e.target.value || null)}
                            className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer min-w-[160px]"
                        >
                            <option value="">All States</option>
                            {Object.keys(geo?.states || {}).sort().map(name => (
                                <option key={name} value={name}>{name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Sector Slicing</span>
                        <select
                            value={sector}
                            onChange={(e) => setSector(e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer min-w-[140px]"
                        >
                            <option value="all">Pan-India View</option>
                            <option value="manufacturing">Manufacturing</option>
                            <option value="trading">Trading</option>
                            <option value="services">Services</option>
                        </select>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-grow min-h-0">
                <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm relative overflow-hidden group flex flex-col">
                    <div className="absolute top-6 left-8 flex flex-col gap-1 z-10">
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1">Scale: Opportunity Density</span>
                        <div className="flex gap-4 items-center">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                                <span className="w-3 h-3 rounded bg-[#10b981]"></span> High (75%+)
                            </div>
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                                <span className="w-3 h-3 rounded bg-[#6366f1]"></span> Growth (45%+)
                            </div>
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                                <span className="w-3 h-3 rounded bg-[#f59e0b]"></span> Emerging
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center items-center py-4 bg-slate-50/20 rounded-2xl relative flex-grow min-h-0">
                        <div className="w-full h-full flex items-center justify-center dashboard-map-container">
                            <LocalErrorBoundary message="Map engine failed to initialize. Please check regional data coordinates.">
                                <India
                                    type="select-single"
                                    size={550}
                                    mapColor="#f8fafc"
                                    strokeColor="#cbd5e1"
                                    strokeWidth={1}
                                    hoverColor="#e2e8f0"
                                    selectColor="#4f46e5"
                                    cityColors={stateColors}
                                    hints={true}
                                    onSelect={(name) => setSelectedStateName(name)}
                                />
                            </LocalErrorBoundary>
                        </div>

                        <style dangerouslySetInnerHTML={{
                            __html: `
                            .dashboard-map-container svg {
                                filter: drop-shadow(0 20px 25px rgb(0 0 0 / 0.1));
                                transition: all 0.5s ease;
                                max-height: 100%;
                                width: auto;
                            }
                            .dashboard-map-container path {
                                transition: all 0.3s ease;
                                cursor: pointer;
                            }
                            .dashboard-map-container path:hover {
                                transform: scale(1.01);
                                filter: brightness(1.05);
                            }
                        `}} />
                    </div>

                    {geo.unmapped.count > 0 && (
                        <div className="absolute bottom-6 left-8 flex items-center gap-2 bg-rose-50 px-3 py-1.5 rounded-full border border-rose-100 text-[10px] font-bold text-rose-600 uppercase tracking-widest">
                            <AlertCircle size={12} />
                            {geo.unmapped.count} Accounts Unmapped
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col overflow-hidden border-t-8 border-t-indigo-600 transition-all h-full">
                    {!selectedStateName ? (
                        <div className="flex flex-col h-full overflow-hidden">
                            <div className="flex flex-col items-center justify-center p-8 text-slate-400 text-center space-y-6 flex-grow">
                                <div className="p-6 bg-indigo-50 rounded-full text-indigo-200">
                                    <Compass size={64} className="animate-spin-slow" />
                                </div>
                                <div>
                                    <p className="font-black text-slate-900 text-xl tracking-tight">Market Radar</p>
                                    <p className="text-xs text-slate-500 mt-2 leading-relaxed max-w-[240px]">
                                        Select a state on the map to unlock deep-dive geographic intelligence.
                                    </p>
                                </div>
                            </div>

                            {/* Market Velocity Section */}
                            {anomalies && anomalies.some(a => a.anomaly_flag) && (
                                <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex-shrink-0">
                                    <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <TrendingUp size={14} /> High Velocity Alerts
                                    </h3>
                                    <div className="space-y-3">
                                        {anomalies.filter(a => a.anomaly_flag).slice(0, 3).map(anomaly => (
                                            <div
                                                key={anomaly.region_name}
                                                onClick={() => setSelectedStateName(anomaly.region_name)}
                                                className="bg-white p-3 rounded-xl border border-indigo-100 shadow-sm flex items-center justify-between cursor-pointer hover:border-indigo-300 transition-all group"
                                            >
                                                <div>
                                                    <p className="text-xs font-bold text-slate-800">{anomaly.region_name}</p>
                                                    <p className="text-[9px] text-emerald-600 font-bold">+{anomaly.velocity_score}% Growth Pulse</p>
                                                </div>
                                                <Target size={14} className="text-indigo-400 group-hover:text-indigo-600" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col h-full animate-in slide-in-from-right-8 duration-500 overflow-hidden">
                            <div className="p-8 pb-4 border-b border-slate-50 flex-shrink-0">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${activeState?.risk_level === 'HIGH' ? 'bg-rose-500 border-rose-200' : 'bg-emerald-500 border-emerald-200'} border-2 shadow-sm`}></div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{activeState?.region} Zone</span>
                                    </div>
                                    <button
                                        onClick={() => setSelectedStateName(null)}
                                        className="text-[10px] font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest"
                                    >
                                        Reset View
                                    </button>
                                </div>
                                <h2 className="text-3xl font-black text-slate-900 tracking-tighter">{selectedStateName}</h2>

                                {anomalies?.find(a => a.region_name === selectedStateName && a.anomaly_flag) && (
                                    <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded text-[9px] font-black uppercase tracking-widest animate-bounce-subtle">
                                        <TrendingUp size={10} /> High Velocity Zone
                                    </div>
                                )}

                                <div className="mt-6 flex flex-col gap-2">
                                    <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Opportunity Index</span>
                                        <span className="text-xl font-black text-indigo-600">{activeState?.opportunity_density || 0}%</span>
                                    </div>
                                    <div className={`p-4 rounded-xl border-2 flex items-center gap-3 ${activeState?.recommended_action === 'EXPAND' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-indigo-50 border-indigo-100 text-indigo-800'
                                        }`}>
                                        <Target size={20} className="mb-0.5" />
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Strategic Pulse</p>
                                            <p className="text-xs font-black truncate max-w-[140px]">{activeState?.recommended_action === 'EXPAND' ? 'Aggressive Market Capture' : 'Client Quality Retention'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-grow overflow-y-auto p-8 pt-4 space-y-8 custom-scrollbar">
                                <div className="grid grid-cols-2 gap-4">
                                    <Link
                                        to={`/?state=${selectedStateName}`}
                                        className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group transition-all hover:bg-white hover:shadow-md block hover:border-indigo-200"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <Users size={16} className="text-slate-400 transition-colors group-hover:text-indigo-500" />
                                            <CheckCircle2 size={12} className="text-emerald-500" />
                                        </div>
                                        <p className="text-2xl font-black text-slate-800">{activeState?.client_count || 0}</p>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Growth Clients</p>
                                    </Link>
                                    <Link
                                        to={`/clients?state=${selectedStateName}`}
                                        className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group transition-all hover:bg-white hover:shadow-md block hover:border-indigo-200"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <TrendingUp size={16} className="text-slate-400 transition-colors group-hover:text-indigo-500" />
                                            <span className="text-[10px] font-black text-indigo-500">+{activeState?.lead_count || 0}</span>
                                        </div>
                                        <p className="text-2xl font-black text-slate-800">{activeState?.avg_lead_score || 0}</p>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Market Quality</p>
                                    </Link>
                                </div>

                                <ExpansionTargets
                                    title="Regional Clusters"
                                    items={activeState?.top_cities.map(city => ({
                                        id: city.name,
                                        name: city.name,
                                        score: city.avg_quality,
                                        subtext: `${city.count} Target Units`
                                    })) || []}
                                    maxHeight={300}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GrowthZones;
