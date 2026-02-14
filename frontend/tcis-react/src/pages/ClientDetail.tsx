import React from "react";
import { useParams, Link } from "react-router-dom";
import { useClient, useClientHistory, useClientHierarchy } from "../hooks/useClients";
import { DetailPageSkeleton } from "../components/ui/skeletons/DetailPageSkeleton";
import {
    ChevronLeft,
    Building2,
    Globe,
    Activity,
    AlertTriangle,
    Layers,
    Target
} from "lucide-react";
import { ScoreTrendChart } from "../components/ScoreTrendChart";
import { ScoringRadarChart } from "../components/ScoringRadarChart";

const ClientDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();

    // Use new React Query hooks
    const { data: client, isLoading: clientLoading } = useClient(id);
    const { data: history, isLoading: historyLoading } = useClientHistory(id);
    const { data: hierarchy } = useClientHierarchy(id);

    if (clientLoading || historyLoading) return <DetailPageSkeleton />;
    if (!client) return <div className="p-8 text-center bg-white rounded-xl border border-slate-200">Client not found.</div>;

    // Defensive check to satisfy TS and prevent runtime errors if client object exists but is incomplete
    const companyName = client.company || "Unknown Company";
    const recommendedPacks = client.recommended_packs || [];
    const scoreBreakdown = client.score_breakdown || {};

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex items-center gap-4">
                <Link to="/clients" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600">
                    <ChevronLeft size={24} />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">{companyName}</h1>
                    <div className="flex items-center gap-4 mt-1">
                        <span className="flex items-center gap-1.5 text-sm text-slate-500">
                            <Building2 size={16} />
                            {client.sector}
                        </span>
                        <span className="flex items-center gap-1.5 text-sm text-slate-500 capitalize">
                            <Globe size={16} />
                            {client.region}, {client.city}
                        </span>
                        {client.parent_id && (
                            <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-widest border border-indigo-100 flex items-center gap-1">
                                <Layers size={10} />
                                Branch Account
                            </span>
                        )}
                    </div>
                </div>
                <div className="ml-auto flex items-center gap-6">
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Upsell Potential</p>
                        <p className="text-3xl font-black text-indigo-600">
                            {client.upsell_score}
                        </p>
                    </div>
                    {client.risk_flag && (
                        <div className="text-right border-l border-slate-200 pl-6">
                            <div className="flex items-center gap-1 justify-end">
                                <AlertTriangle className="text-rose-500" size={14} />
                                <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">At Risk</p>
                            </div>
                            <p className="text-3xl font-black text-rose-600">
                                {client.risk_score}
                            </p>
                        </div>
                    )}
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Structural Intelligence Section */}
                <div className="space-y-6">
                    <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                            Corporate Footprint
                        </h3>
                        <div className="space-y-4">
                            {hierarchy?.parent && (
                                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-2">Corporate Parent</p>
                                    <Link to={`/clients/${hierarchy.parent.id}`} className="flex items-center justify-between group">
                                        <span className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors underline decoration-indigo-200">{hierarchy.parent.company}</span>
                                        <div className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] rounded font-black">{hierarchy.parent.score}</div>
                                    </Link>
                                </div>
                            )}

                            {hierarchy?.siblings && hierarchy.siblings.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Sibling Branches ({hierarchy.siblings.length})</p>
                                    <div className="grid grid-cols-1 gap-1.5">
                                        {(hierarchy.siblings || []).map((sib: any) => (
                                            <Link key={sib.id} to={`/clients/${sib.id}`} className="flex items-center justify-between p-2 rounded hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-semibold text-slate-700">{sib.company}</span>
                                                    <span className="text-[9px] text-slate-400">{sib.location}</span>
                                                </div>
                                                <span className="text-xs font-bold text-slate-500">{sib.score}</span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {!client.parent_id && (!hierarchy?.tree?.sub_branches?.length) && (
                                <div className="p-4 border-2 border-dashed border-slate-100 rounded-lg flex flex-col items-center text-center">
                                    <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 mb-2">
                                        <Layers size={16} />
                                    </div>
                                    <p className="text-xs font-bold text-slate-600">Headquarters Account</p>
                                    <p className="text-[10px] text-slate-400 mt-1">This is an independent business entity or top-level corporate parent.</p>
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                            Recommended Packs
                        </h3>
                        <div className="space-y-2">
                            {recommendedPacks.length > 0 ? (
                                recommendedPacks.map((pack: string) => (
                                    <div key={pack} className="flex justify-between items-center p-3 bg-indigo-50 text-indigo-700 rounded border border-indigo-100">
                                        <span className="text-sm font-bold">{pack}</span>
                                        <ChevronLeft size={16} className="rotate-180" />
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-slate-400 italic">No recommendations at this time.</p>
                            )}
                        </div>
                    </section>
                </div>

                {/* Upsell Analytics Section */}
                <div className="lg:col-span-2 space-y-8">
                    <section className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                            {/* Momentum Chart */}
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800">Upsell Momentum</h3>
                                        <p className="text-xs text-slate-500">Tracking willingness for product expansion.</p>
                                    </div>
                                    <Activity className="text-indigo-500" size={24} />
                                </div>
                                <ScoreTrendChart data={history || []} height={260} entityType="client" />
                            </div>

                            {/* Radar Chart (Breakdown) */}
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800">Upsell Attribution</h3>
                                        <p className="text-xs text-slate-500">Multi-vector breakdown of current potential.</p>
                                    </div>
                                    <Target className="text-indigo-500" size={24} />
                                </div>
                                <ScoringRadarChart breakdown={scoreBreakdown} height={260} />
                            </div>
                        </div>

                        {client.risk_flag && (
                            <div className="mt-8 pt-8 border-t border-rose-100">
                                <h4 className="text-xs font-bold text-rose-400 uppercase tracking-widest mb-4">Risk Warning</h4>
                                <div className="p-4 bg-rose-50 border-l-4 border-rose-500 rounded-r-lg flex gap-4">
                                    <AlertTriangle className="text-rose-600 flex-shrink-0" size={20} />
                                    <div>
                                        <p className="text-sm text-rose-900 font-bold">{client.risk_flag}</p>
                                        <p className="text-sm text-rose-800 mt-1">Multiple critical support tickets detected. Stabilize account support before initiating upsell conversations.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
};

export default ClientDetail;
