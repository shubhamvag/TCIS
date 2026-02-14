import { useState } from "react";
import { X, CheckCircle, Briefcase, User, Box, ShieldCheck } from "lucide-react";
import { useFocusTrap } from "../hooks/useFocusTrap";
import { useEscapeKey } from "../hooks/useEscapeKey";

interface ConversionModalProps {
    isOpen: boolean;
    onClose: () => void;
    leadName: string;
    leadCompany: string;
    onConfirm: (data: any) => void;
    isSubmitting: boolean;
}

export function ConversionModal({ isOpen, onClose, leadName, leadCompany, onConfirm, isSubmitting }: ConversionModalProps) {
    const [accountManager, setAccountManager] = useState("");
    const [initialProducts, setInitialProducts] = useState("tallyprime");
    const [notes, setNotes] = useState("");

    // Accessibility hooks
    const modalRef = useFocusTrap(isOpen);
    useEscapeKey(isOpen, onClose);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="conversion-modal-title"
                aria-describedby="conversion-modal-description"
                className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="bg-emerald-600 px-6 py-4 flex items-center justify-between text-white">
                    <div className="flex items-center gap-2 font-bold">
                        <CheckCircle size={20} />
                        <span id="conversion-modal-title">Promote to Client</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="hover:bg-white/20 p-1 rounded-lg transition-colors"
                        aria-label="Close modal"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div id="conversion-modal-description" className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl">
                        <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider mb-1">Converting Prospect</p>
                        <h3 className="text-lg font-bold text-slate-900">{leadCompany}</h3>
                        <p className="text-sm text-slate-500">{leadName}</p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase mb-1.5 block flex items-center gap-1">
                                <User size={12} className="text-emerald-500" /> Account Manager
                            </label>
                            <input
                                type="text"
                                value={accountManager}
                                onChange={(e) => setAccountManager(e.target.value)}
                                placeholder="Assign responsible manager"
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase mb-1.5 block flex items-center gap-1">
                                <Box size={12} className="text-emerald-500" /> Initial License
                            </label>
                            <select
                                value={initialProducts}
                                onChange={(e) => setInitialProducts(e.target.value)}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                            >
                                <option value="tallyprime">Tally Prime (Base)</option>
                                <option value="tallyprime,f1_mis">Tally Prime + MIS</option>
                                <option value="tallyprime,hrms">Tally Prime + HRMS</option>
                                <option value="tallyprime,gst">Tally Prime + GST Health</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase mb-1.5 block flex items-center gap-1">
                                <Briefcase size={12} className="text-emerald-500" /> Conversion Notes
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Any final handoff instructions..."
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm h-24 resize-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="pt-2 flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            disabled={isSubmitting || !accountManager}
                            onClick={() => onConfirm({ accountManager, existing_products: initialProducts, notes })}
                            className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? "Converting..." : (
                                <>
                                    <ShieldCheck size={16} /> Confirm Promotion
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
