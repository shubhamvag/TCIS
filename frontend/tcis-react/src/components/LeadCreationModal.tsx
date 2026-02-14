import { X, UserPlus, Save, Building2, MapPin, Briefcase } from "lucide-react";
import { api } from "../api/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FormInput } from "./ui/FormInput";

const leadSchema = z.object({
    company: z.string().min(1, "Company name is required"),
    name: z.string().min(1, "Contact name is required"),
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
    phone: z.string().optional(),
    sector: z.string().default("services"),
    size: z.string().default("small"),
    source: z.string().default("cold"),
    city: z.string().optional(),
    region: z.string().optional(),
    interested_modules: z.string().optional(),
    notes: z.string().optional(),
});

type LeadFormData = z.infer<typeof leadSchema>;

interface LeadCreationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function LeadCreationModal({ isOpen, onClose, onSuccess }: LeadCreationModalProps) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<LeadFormData>({
        resolver: zodResolver(leadSchema) as any,
        defaultValues: {
            company: "",
            name: "",
            email: "",
            phone: "",
            sector: "services",
            size: "small",
            source: "cold",
            city: "",
            region: "",
            interested_modules: "",
            notes: "",
        },
    });

    if (!isOpen) return null;

    const onSubmit = async (data: LeadFormData) => {
        try {
            await api.createLead(data);
            onSuccess();
            onClose();
            reset();
        } catch (error) {
            console.error("Failed to create lead:", error);
            alert("Failed to save lead. Please check your connection.");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
                <header className="bg-indigo-600 px-8 py-6 flex items-center justify-between text-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-xl">
                            <UserPlus size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">In-Person Lead Intake</h2>
                            <p className="text-indigo-100 text-xs">Register a new prospect manually into the intelligence pool.</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-xl transition-colors">
                        <X size={20} />
                    </button>
                </header>

                <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Company Details */}
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Business Identity</h3>

                            <FormInput
                                label={<><Building2 size={14} className="text-indigo-500" /> Company Name *</>}
                                placeholder="e.g. Acme Solutions"
                                error={errors.company}
                                {...register("company")}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600">Sector</label>
                                    <select
                                        {...register("sector")}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                    >
                                        <option value="manufacturing">Manufacturing</option>
                                        <option value="trading">Trading</option>
                                        <option value="services">Services</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600">Scale</label>
                                    <select
                                        {...register("size")}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                    >
                                        <option value="small">Small (MSME)</option>
                                        <option value="medium">Medium</option>
                                        <option value="large">Enterprise</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Contact Details */}
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Primary Contact</h3>

                            <FormInput
                                label="Contact Name *"
                                placeholder="First & Last Name"
                                error={errors.name}
                                {...register("name")}
                            />

                            <FormInput
                                label="Email Address"
                                placeholder="contact@company.com"
                                type="email"
                                error={errors.email}
                                {...register("email")}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                        {/* Geography */}
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Market Geography</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <FormInput
                                    label={<><MapPin size={14} className="text-indigo-500" /> City</>}
                                    placeholder="City"
                                    error={errors.city}
                                    {...register("city")}
                                    className="focus:ring-indigo-500/20 focus:border-indigo-500"
                                />
                                <FormInput
                                    label="State/Region"
                                    placeholder="Region"
                                    error={errors.region}
                                    {...register("region")}
                                    className="focus:ring-indigo-500/20 focus:border-indigo-500"
                                />
                            </div>
                        </div>

                        {/* Intent */}
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Intelligence Context</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600 flex items-center gap-2">
                                        <Briefcase size={14} className="text-indigo-500" /> Source
                                    </label>
                                    <select
                                        {...register("source")}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                    >
                                        <option value="referral">Referral</option>
                                        <option value="partner">Channel Partner</option>
                                        <option value="cold">Cold Call</option>
                                        <option value="exhibition">Exhibition/Event</option>
                                    </select>
                                </div>
                                <FormInput
                                    label="Product Interest"
                                    placeholder="e.g. Tally, MIS"
                                    error={errors.interested_modules}
                                    {...register("interested_modules")}
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
                            className="px-8 py-3 rounded-xl bg-indigo-600 text-white text-sm font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            {isSubmitting ? "Syncing..." : (
                                <>
                                    <Save size={18} /> Record New Lead
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
