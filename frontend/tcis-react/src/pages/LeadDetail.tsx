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
    Activity,
    ShieldCheck,
    CheckCircle2,
    ArrowUpRight,
    CheckCircle,
    XCircle,
    RotateCcw,
    ThumbsUp
} from "lucide-react";
import { ConversionModal } from "../components/ConversionModal";
import { api } from "../api/client";
import { useNavigate } from "react-router-dom";

const LeadDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: lead, loading: leadLoading } = useApiQuery<Lead>(`/leads/${id}`);
    const { data: history, loading: historyLoading } = useApiQuery<ScoreHistory[]>(`/scoring/history/lead/${id}`);

    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const handleConvert = async (data: any) => {
        if (!id) return;
        setIsSubmitting(true);
        try {
            const response = await api.convertLead(parseInt(id), data);
            // On success, we navigate to the new client detail page
            navigate(`/clients/${response.data.id}`);
        } catch (error) {
            console.error("Conversion failed:", error);
            alert("Failed to convert lead. Please try again.");
            setIsSubmitting(false);
        }
    };

    const handleStatusUpdate = async (newStatus: string) => {
        if (!id) return;
        setIsSubmitting(true);
        try {
            await api.updateLead(parseInt(id), { status: newStatus });
            // Refresh state since we are using useApiQuery which doesn't auto-poll
            window.location.reload();
        } catch (error) {
            console.error("Status update failed:", error);
            alert("Failed to update status. Please try again.");
            setIsSubmitting(false);
        }
    };

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
                <div className="ml-auto flex items-center gap-6">
                    {lead.status === 'converted' ? (
                        <div className="flex items-center gap-3 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-2xl border border-emerald-100 italic font-medium animate-in slide-in-from-right duration-500">
                            <CheckCircle2 size={18} />
                            <span>Converted to Client</span>
                            <Link to={`/clients/${lead.client_id}`} className="ml-2 p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-100">
                                <ArrowUpRight size={16} />
                            </Link>
                        </div>
                    ) : (
                        lead.status === 'won' && (
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-2xl text-sm font-bold shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-[0.98] animate-in zoom-in duration-300"
                            >
                                <ShieldCheck size={18} /> Promote to Client
                            </button>
                        )
                    )}
                    <div className="text-right border-l border-slate-100 pl-6">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Current Score</p>
                        <p className={`text-3xl font-black ${lead.lead_score >= 75 ? 'text-emerald-600' : 'text-indigo-600'}`}>
                            {lead.lead_score}
                        </p>
                    </div>
                </div>
            </header>

            <ConversionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                leadName={lead.name}
                leadCompany={lead.company}
                isSubmitting={isSubmitting}
                onConfirm={handleConvert}
            />

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

                    {/* NEW: Status Management Section */}
                    {lead.status !== 'converted' && (
                        <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm animate-in fade-in slide-in-from-bottom duration-500">
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                                Pipeline Actions
                            </h3>
                            <div className="grid grid-cols-1 gap-2">
                                {lead.status === 'new' && (
                                    <button
                                        disabled={isSubmitting}
                                        onClick={() => handleStatusUpdate('contacted')}
                                        className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-100 transition-all disabled:opacity-50"
                                    >
                                        <Activity size={16} className="text-blue-500" /> Mark as Contacted
                                    </button>
                                )}
                                {(lead.status === 'contacted' || lead.status === 'new') && (
                                    <button
                                        disabled={isSubmitting}
                                        onClick={() => handleStatusUpdate('qualified')}
                                        className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-100 transition-all disabled:opacity-50"
                                    >
                                        <CheckCircle size={16} className="text-indigo-500" /> Qualify Lead
                                    </button>
                                )}
                                {(lead.status === 'qualified' || lead.status === 'contacted' || lead.status === 'proposal' || lead.status === 'negotiation') && (
                                    <div className="flex gap-2">
                                        <button
                                            disabled={isSubmitting}
                                            onClick={() => handleStatusUpdate('won')}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-sm font-bold hover:bg-emerald-100 transition-all disabled:opacity-50"
                                        >
                                            <ThumbsUp size={16} /> Mark as Won
                                        </button>
                                        <button
                                            disabled={isSubmitting}
                                            onClick={() => handleStatusUpdate('lost')}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-sm font-bold hover:bg-rose-100 transition-all disabled:opacity-50"
                                        >
                                            <XCircle size={16} /> Mark as Lost
                                        </button>
                                    </div>
                                )}
                                {(lead.status === 'won' || lead.status === 'lost') && (
                                    <button
                                        disabled={isSubmitting}
                                        onClick={() => handleStatusUpdate('qualified')}
                                        className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-100 transition-all disabled:opacity-50"
                                    >
                                        <RotateCcw size={16} className="text-slate-500" /> Re-open to Qualified
                                    </button>
                                )}
                            </div>
                        </section>
                    )}
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
