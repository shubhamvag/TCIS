import React, { useState, useEffect } from "react";
import { api } from "../api/client";
import type { ScoringConfig } from "../api/types";
import {
    Settings,
    Save,
    RefreshCcw,
    Sliders,
    Building2,
    Briefcase,
    Globe,
    AlertCircle
} from "lucide-react";
import { MetricCard } from "../components/MetricCard";

const AdminPanel: React.FC = () => {
    const [configs, setConfigs] = useState<ScoringConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<string>("sector");
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    useEffect(() => {
        fetchConfigs();
    }, []);

    const fetchConfigs = async () => {
        setLoading(true);
        try {
            const response = await api.getScoringConfigs();
            setConfigs(response.data);
        } catch (error) {
            console.error("Failed to fetch configs", error);
            setMessage({ type: "error", text: "Failed to load scoring configurations." });
        } finally {
            setLoading(false);
        }
    };

    const handleWeightChange = (key: string, value: number) => {
        setConfigs(prev => prev.map(c => c.key === key ? { ...c, value } : c));
    };

    const saveWeight = async (key: string, value: number) => {
        setSaving(true);
        try {
            await api.updateScoringConfig(key, value);
            setMessage({ type: "success", text: "Weight updated successfully!" });
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            console.error("Failed to save weight", error);
            setMessage({ type: "error", text: "Failed to update weight." });
        } finally {
            setSaving(false);
        }
    };

    const categories = [
        { id: "sector", label: "Sector Weights", icon: Building2 },
        { id: "size", label: "Size Weights", icon: Briefcase },
        { id: "source", label: "Source Weights", icon: Globe },
    ];

    const filteredConfigs = configs.filter(c => c.category === activeTab);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <Settings className="text-indigo-600" size={32} />
                        Intelligence Admin
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Tune the deterministic scoring engine weights in real-time.
                    </p>
                </div>
                <button
                    onClick={fetchConfigs}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
                >
                    <RefreshCcw size={18} />
                    Refresh
                </button>
            </header>

            {message && (
                <div className={`p-4 rounded-lg flex items-center gap-3 ${message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"
                    }`}>
                    <AlertCircle size={20} />
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard
                    label="Active Rules"
                    value={configs.length.toString()}
                    icon={Sliders}
                    sub="All dynamic"
                />
                <MetricCard
                    label="Engine Mode"
                    value="Deterministic"
                    icon={Briefcase}
                />
                <MetricCard
                    label="Last Calibrated"
                    value="Just now"
                    icon={RefreshCcw}
                />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="flex border-b border-slate-200">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveTab(cat.id)}
                            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors border-b-2 ${activeTab === cat.id
                                ? "border-indigo-600 text-indigo-600 bg-indigo-50/30"
                                : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                                }`}
                        >
                            <cat.icon size={18} />
                            {cat.label}
                        </button>
                    ))}
                </div>

                <div className="p-6">
                    {loading ? (
                        <div className="py-12 flex justify-center items-center gap-3 text-slate-400">
                            <RefreshCcw className="animate-spin" />
                            Loading configurations...
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {filteredConfigs.map(cfg => (
                                <div key={cfg.key} className="flex flex-col gap-4 p-4 border border-slate-100 rounded-lg hover:border-indigo-100 hover:bg-slate-50/50 transition-all">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold text-slate-800">{cfg.label}</h3>
                                            <p className="text-xs text-slate-400 font-mono mt-0.5">{cfg.key}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl font-bold text-indigo-600">
                                                {cfg.value.toFixed(2)}
                                            </span>
                                            <button
                                                onClick={() => saveWeight(cfg.key, cfg.value)}
                                                disabled={saving}
                                                className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                                                title="Save internal weight"
                                            >
                                                <Save size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <input
                                            type="range"
                                            min="0"
                                            max="1.5"
                                            step="0.05"
                                            value={cfg.value}
                                            onChange={(e) => handleWeightChange(cfg.key, parseFloat(e.target.value))}
                                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                        />
                                        <span className="text-xs font-medium text-slate-400 w-12 text-right">0.0 - 1.5</span>
                                    </div>

                                    <p className="text-sm text-slate-500 bg-white p-2 rounded border border-slate-100">
                                        Adjust how much weight this factor carries in the overall score calculation.
                                        Higher values prioritize this specific factor.
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
