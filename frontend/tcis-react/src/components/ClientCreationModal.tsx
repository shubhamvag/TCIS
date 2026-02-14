import { X, UserCheck, Save, Building2, MapPin, Briefcase, CreditCard } from "lucide-react";
import { api } from "../api/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FormInput } from "./ui/FormInput";
import { useFocusTrap } from "../hooks/useFocusTrap";
import { useEscapeKey } from "../hooks/useEscapeKey";

const clientSchema = z.object({
    company: z.string().min(1, "Company name is required"),
    name: z.string().min(1, "Primary contact name is required"),
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
    phone: z.string().optional(),
    sector: z.string().default("services"),
    size: z.string().default("small"),
    city: z.string().optional(),
    region: z.string().optional(),
    existing_products: z.string().optional(),
    annual_revenue_band: z.string().default("50k-2L"),
    account_manager: z.string().optional(),
    notes: z.string().optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface ClientCreationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function ClientCreationModal({ isOpen, onClose, onSuccess }: ClientCreationModalProps) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting, touchedFields },
    } = useForm<ClientFormData>({
        resolver: zodResolver(clientSchema) as any,
        mode: 'onBlur',
        reValidateMode: 'onChange',
        defaultValues: {
            company: "",
            name: "",
            email: "",
            phone: "",
            sector: "services",
            size: "small",
            city: "",
            region: "",
            existing_products: "",
            annual_revenue_band: "50k-2L",
            account_manager: "",
            notes: "",
        },
    });

    // Accessibility hooks
    const modalRef = useFocusTrap(isOpen);
    useEscapeKey(isOpen, onClose);

    if (!isOpen) return null;

    const onSubmit = async (data: ClientFormData) => {
        try {
            await api.createClient(data);
            onSuccess();
            onClose();
            reset();
        } catch (error) {
            console.error("Failed to create client:", error);
            alert("Failed to save client. Please check your connection.");
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="client-modal-title"
                aria-describedby="client-modal-description"
                className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="bg-emerald-600 px-8 py-6 flex items-center justify-between text-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-xl">
                            <UserCheck size={24} />
                        </div>
                        <div>
                            <h2 id="client-modal-title" className="text-xl font-bold">Client Onboarding</h2>
                            <p id="client-modal-description" className="text-emerald-100 text-xs">Register a new client account into the system.</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="hover:bg-white/20 p-2 rounded-xl transition-colors"
                        aria-label="Close modal"
                    >
                        <X size={20} />
                    </button>
                </header>

                <form id="client-form" onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Company Details */}
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Business Identity</h3>

                            <FormInput
                                label={<><Building2 size={14} className="text-emerald-500" /> Company Name *</>}
                                placeholder="e.g. Meta Corp"
                                error={errors.company}
                                showSuccess={touchedFields.company && !errors.company}
                                {...register("company")}
                                className="focus:ring-emerald-500/20 focus:border-emerald-500"
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600">Sector</label>
                                    <select
                                        {...register("sector")}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                    >
                                        <option value="manufacturing">Manufacturing</option>
                                        <option value="trading">Trading</option>
                                        <option value="services">Services</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600">Revenue Band</label>
                                    <select
                                        {...register("annual_revenue_band")}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
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

                            <FormInput
                                label="Account Manager"
                                placeholder="Employee Name"
                                error={errors.account_manager}
                                showSuccess={touchedFields.account_manager && !errors.account_manager}
                                {...register("account_manager")}
                                className="focus:ring-emerald-500/20 focus:border-emerald-500"
                            />

                            <FormInput
                                label={<><CreditCard size={14} className="text-emerald-500" /> Existing Products</>}
                                placeholder="e.g. Tally Prime, GST"
                                error={errors.existing_products}
                                showSuccess={touchedFields.existing_products && !errors.existing_products}
                                {...register("existing_products")}
                                className="focus:ring-emerald-500/20 focus:border-emerald-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                        {/* Primary Contact */}
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Primary Contact</h3>

                            <FormInput
                                label="Contact Name *"
                                placeholder="Full name"
                                error={errors.name}
                                showSuccess={touchedFields.name && !errors.name}
                                {...register("name")}
                                className="focus:ring-emerald-500/20 focus:border-emerald-500"
                            />

                            <FormInput
                                label="Email"
                                type="email"
                                placeholder="contact@company.com"
                                error={errors.email}
                                showSuccess={touchedFields.email && !errors.email}
                                {...register("email")}
                                className="focus:ring-emerald-500/20 focus:border-emerald-500"
                            />
                        </div>

                        {/* Location Profile */}
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Location Profile</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <FormInput
                                    label={<><MapPin size={14} className="text-emerald-500" /> City</>}
                                    placeholder="City"
                                    error={errors.city}
                                    {...register("city")}
                                    className="focus:ring-emerald-500/20 focus:border-emerald-500"
                                />
                                <FormInput
                                    label="Region"
                                    placeholder="Region"
                                    error={errors.region}
                                    {...register("region")}
                                    className="focus:ring-emerald-500/20 focus:border-emerald-500"
                                />
                            </div>
                        </div>
                    </div>
                </form>

                <div className="p-8 pt-0">
                    <div className="pt-6 flex gap-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all ml-auto"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="client-form"
                            disabled={isSubmitting}
                            className="px-6 py-3 rounded-xl bg-emerald-600 text-white text-sm font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                        >
                            {isSubmitting ? "Saving..." : (
                                <>
                                    <Save size={16} /> Save Client
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div >
        </div >
    );
}
