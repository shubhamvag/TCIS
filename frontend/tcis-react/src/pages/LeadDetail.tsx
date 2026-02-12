import React from "react";
import { useParams, Link } from "react-router-dom";
import { useApiQuery } from "../hooks/useApiQuery";
import type { Lead, ScoreHistory } from "../api/types";
import { ScoreTrendChart } from "../components/ScoreTrendChart";
import { ScoringRadarChart } from "../components/ScoringRadarChart";
import { LoadingState } from "../components/LoadingState";
import {
    ChevronLeft,
    Building2,
    Mail,
    Phone,
    Globe,
    Users,
    Target,
    Activity
} from "lucide-react";

const LeadDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { data: lead, loading: leadLoading } = useApiQuery<Lead>(`/leads/${id}`);
    const { data: history, loading: historyLoading } = useApiQuery<ScoreHistory[]>(`/scoring/history/lead/${id}`);

    if (leadLoading || historyLoading) return <LoadingState message="Fetching lead profile..." />;
    if (!lead) return <div className="p-8 text-center bg-white rounded-xl border border-slate-200">Lead not found.</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex items-center gap-4">
                <Link to="/" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600">
                    <ChevronLeft size={24} />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">{lead.company}</h1>
                    <div className="flex items-center gap-4 mt-1">
                        <span className="flex items-center gap-1.5 text-sm text-slate-500">
                            <Building2 size={16} />
                            {lead.sector}
                        </span>
                        <span className="flex items-center gap-1.5 text-sm text-slate-500 capitalize">
                            <Globe size={16} />
                            {lead.region}, {lead.city}
                        </span>
                    </div>
                </div>
                <div className="ml-auto flex items-center gap-3">
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Current Score</p>
                        <p className={`text-3xl font-black ${lead.lead_score >= 75 ? 'text-emerald-600' : 'text-indigo-600'}`}>
                            {lead.lead_score}
                        </p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Information Card */}
                <div className="space-y-6">
                    <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                            Contact Information
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 group">
                                <div className="p-2 bg-slate-50 rounded text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-colors">
                                    <Users size={18} />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 font-medium">Primary Contact</p>
                                    <p className="text-sm font-semibold text-slate-700">{lead.name}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 group">
                                <div className="p-2 bg-slate-50 rounded text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-colors">
                                    <Mail size={18} />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 font-medium">Email Address</p>
                                    <p className="text-sm font-semibold text-slate-700">{lead.email || "N/A"}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 group">
                                <div className="p-2 bg-slate-50 rounded text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-colors">
                                    <Phone size={18} />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 font-medium">Phone Number</p>
                                    <p className="text-sm font-semibold text-slate-700">{lead.phone || "N/A"}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                            Engagement Context
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-slate-50">
                                <span className="text-sm text-slate-500">Source</span>
                                <span className="text-sm font-bold text-slate-700 capitalize">{lead.source}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-slate-50">
                                <span className="text-sm text-slate-500">Company Size</span>
                                <span className="text-sm font-bold text-slate-700 capitalize">{lead.size}</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-sm text-slate-500">Current Status</span>
                                <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase">{lead.status}</span>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Scoring Analytics Card */}
                <div className="lg:col-span-2 space-y-8">
                    <section className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                            {/* Momentum Chart */}
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800">Score Momentum</h3>
                                        <p className="text-xs text-slate-500">Tracking intelligence score variance over time.</p>
                                    </div>
                                    <Activity className="text-indigo-500" size={24} />
                                </div>
                                <ScoreTrendChart data={history || []} height={260} entityType="lead" />
                            </div>

                            {/* Radar Chart (Breakdown) */}
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800">Scoring Attribution</h3>
                                        <p className="text-xs text-slate-500">Multi-vector breakdown of current rank.</p>
                                    </div>
                                    <Target className="text-indigo-500" size={24} />
                                </div>
                                <ScoringRadarChart breakdown={lead.score_breakdown || {}} height={260} />
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-slate-100">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Strategic Recommendation</h4>
                            <div className="p-4 bg-indigo-50/50 border-l-4 border-indigo-500 rounded-r-lg">
                                <div className="flex gap-4">
                                    <Target className="text-indigo-600 flex-shrink-0" size={20} />
                                    <p className="text-sm text-indigo-900 font-medium leading-relaxed">
                                        {lead.suggested_next_action}.
                                        {lead.lead_score >= 80 ? " This lead is showing high thermal activity. Prioritize immediate face-to-face meeting." : " Monitor digital engagement signals before next outreach."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default LeadDetail;
