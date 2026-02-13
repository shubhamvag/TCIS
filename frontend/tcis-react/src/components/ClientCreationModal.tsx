import { useState } from "react";
import { X, UserCheck, Save, Building2, MapPin, Briefcase, CreditCard } from "lucide-react";
import { api } from "../api/client";

interface ClientCreationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function ClientCreationModal({ isOpen, onClose, onSuccess }: ClientCreationModalProps) {
    const [formData, setFormData] = useState({
        name: "",
        company: "",
        email: "",
        phone: "",
        sector: "services",
        size: "small",
        city: "",
        region: "",
        existing_products: "",
        annual_revenue_band: "50k-2L",
        account_manager: "",
        notes: ""
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await api.createClient(formData);
            onSuccess();
            onClose();
            // Reset form
            setFormData({
                name: "", company: "", email: "", phone: "",
                sector: "services", size: "small",
                city: "", region: "", existing_products: "",
                annual_revenue_band: "50k-2L", account_manager: "", notes: ""
            });
        } catch (error) {
            console.error("Failed to create client:", error);
            alert("Failed to save client. Please check your connection.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
                <header className="bg-emerald-600 px-8 py-6 flex items-center justify-between text-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-xl">
                            <UserCheck size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Direct Client Boarding</h2>
                            <p className="text-emerald-100 text-xs">Instantly add an existing customer to the intelligence suite.</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-xl transition-colors">
                        <X size={20} />
                    </button>
                </header>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Company Details */}
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Business Identity</h3>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 flex items-center gap-2">
                                    <Building2 size={14} className="text-emerald-500" /> Company Name *
                                </label>
                                <input
                                    required
                                    type="text"
                                    value={formData.company}
                                    onChange={e => setFormData({ ...formData, company: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                    placeholder="e.g. Meta Corp"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600">Sector</label>
                                    <select
                                        value={formData.sector}
                                        onChange={e => setFormData({ ...formData, sector: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                    >
                                        <option value="manufacturing">Manufacturing</option>
                                        <option value="trading">Trading</option>
                                        <option value="services">Services</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600">Revenue Band</label>
                                    <select
                                        value={formData.annual_revenue_band}
                                        onChange={e => setFormData({ ...formData, annual_revenue_band: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                    >
                                        <option value="0-50k">0 - 50k</option>
                                        <option value="50k-2L">50k - 2L</option>
                                        <option value="2L-5L">2L - 5L</option>
                                        <option value="5L+">5L+</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Professional Handoff */}
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Account Management</h3>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600">Account Manager</label>
                                <input
                                    type="text"
                                    value={formData.account_manager}
                                    onChange={e => setFormData({ ...formData, account_manager: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                                    placeholder="Employee Name"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 flex items-center gap-2">
                                    <CreditCard size={14} className="text-emerald-500" /> Existing Products
                                </label>
                                <input
                                    type="text"
                                    value={formData.existing_products}
                                    onChange={e => setFormData({ ...formData, existing_products: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                                    placeholder="e.g. Tally Prime, GST"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                        {/* Information Mapping */}
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Location Profile</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600 flex items-center gap-2">
                                        <MapPin size={14} className="text-emerald-500" /> City
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.city}
                                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                                        placeholder="City"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600">Region</label>
                                    <input
                                        type="text"
                                        value={formData.region}
                                        onChange={e => setFormData({ ...formData, region: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                                        placeholder="Region"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Primary Contact */}
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Client Admin</h3>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 flex items-center gap-2">
                                    <Briefcase size={14} className="text-emerald-500" /> Primary Contact Name *
                                </label>
                                <input
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                                    placeholder="Full Name"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 flex gap-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all ml-auto"
                        >
                            Cancel
                        </button>
                        <button
                            disabled={isSubmitting}
                            type="submit"
                            className="px-8 py-3 rounded-xl bg-emerald-600 text-white text-sm font-bold shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            {isSubmitting ? "Onboarding..." : (
                                <>
                                    <Save size={18} /> Save Client Record
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
