import { useState } from "react";
import { X, Send, Globe, Zap, CheckCircle2, AlertCircle } from "lucide-react";
import axios from "axios";

interface MarketingSimulatorProps {
    isOpen: boolean;
    onClose: () => void;
}

export function MarketingSimulator({ isOpen, onClose }: MarketingSimulatorProps) {
    const [formData, setFormData] = useState({
        name: "",
        company: "",
        email: "",
        phone: "",
        sector: "manufacturing",
        city: "",
        region: "",
        interested_modules: "tally",
    });

    const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
    const [lastResponse, setLastResponse] = useState<any>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("submitting");

        try {
            const response = await axios.post("http://127.0.0.1:8000/api/leads/", formData, {
                headers: {
                    "X-TCIS-API-Key": "tcis_sim_2026_marketing_hub"
                }
            });
            setLastResponse(response.data);
            setStatus("success");
            // Auto-reset after 3 seconds
            setTimeout(() => setStatus("idle"), 3000);
        } catch (error: any) {
            console.error("Simulation failed:", error);
            setStatus("error");
            setLastResponse(error.response?.data?.detail || "Connection Error");
        }
    };

    return (
        <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl z-50 border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-500">
            <header className="bg-slate-900 px-6 py-6 text-white">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">
                        <Zap size={10} /> External Channel
                    </div>
                    <button onClick={onClose} className="hover:bg-white/10 p-1 rounded transition-colors">
                        <X size={18} />
                    </button>
                </div>
                <h2 className="text-xl font-bold">Marketing Simulator</h2>
                <p className="text-slate-400 text-xs mt-1">Simulate your public website's contact form.</p>
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-[11px] text-slate-500 font-mono">
                    <p className="font-bold text-slate-700 mb-1">Target Endpoint:</p>
                    <p>POST /api/leads/</p>
                    <p className="mt-1 font-bold text-slate-700">Auth Header:</p>
                    <p>X-TCIS-API-Key: tcis_sim...hub</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Contact Name</label>
                        <input
                            required
                            type="text"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                            placeholder="e.g. Rajesh Kumar"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Company Name</label>
                        <input
                            required
                            type="text"
                            value={formData.company}
                            onChange={e => setFormData({ ...formData, company: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                            placeholder="e.g. Rajesh Textiles Ltd"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">City</label>
                            <input
                                required
                                type="text"
                                value={formData.city}
                                onChange={e => setFormData({ ...formData, city: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                placeholder="Indore"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Region</label>
                            <input
                                required
                                type="text"
                                value={formData.region}
                                onChange={e => setFormData({ ...formData, region: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                placeholder="MP"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Interested In</label>
                        <select
                            value={formData.interested_modules}
                            onChange={e => setFormData({ ...formData, interested_modules: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                        >
                            <option value="tally">Tally Prime Base</option>
                            <option value="tally,mis">Tally + MIS Reports</option>
                            <option value="tally,hrms">Tally + HRMS Suite</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={status === "submitting"}
                        className={`w-full py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg ${status === "success"
                                ? "bg-emerald-600 text-white shadow-emerald-100"
                                : status === "error"
                                    ? "bg-rose-600 text-white shadow-rose-100"
                                    : "bg-indigo-600 text-white shadow-indigo-100 hover:bg-indigo-700"
                            }`}
                    >
                        {status === "submitting" ? (
                            "Sending to TCIS..."
                        ) : status === "success" ? (
                            <><CheckCircle2 size={16} /> Lead Ingested!</>
                        ) : status === "error" ? (
                            <><AlertCircle size={16} /> Blocked</>
                        ) : (
                            <><Send size={16} /> Send Web Inquiry</>
                        )}
                    </button>
                </form>

                {status === "success" && (
                    <div className="animate-in zoom-in duration-300">
                        <h4 className="text-[10px] font-bold text-emerald-600 uppercase mb-2">Live Response Body</h4>
                        <pre className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-[10px] text-emerald-800 overflow-x-auto">
                            {JSON.stringify(lastResponse, null, 2)}
                        </pre>
                    </div>
                )}

                {status === "error" && (
                    <div className="animate-in zoom-in duration-300">
                        <h4 className="text-[10px] font-bold text-rose-600 uppercase mb-2">Gatekeeper Response</h4>
                        <p className="bg-rose-50 border border-rose-100 p-4 rounded-xl text-[10px] text-rose-800">
                            {typeof lastResponse === 'string' ? lastResponse : JSON.stringify(lastResponse)}
                        </p>
                    </div>
                )}
            </div>

            <footer className="p-6 bg-slate-50 border-t border-slate-200">
                <div className="flex items-center gap-3 text-slate-400">
                    <Globe size={20} />
                    <p className="text-[10px] leading-tight">
                        This simulator uses <span className="text-slate-900 font-bold">direct REST calls</span> to simulate production traffic from
                        meta-vision.com to your secure backend.
                    </p>
                </div>
            </footer>
        </div>
    );
}
