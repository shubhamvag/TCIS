import { forwardRef } from "react";
import type { FieldError } from "react-hook-form";
import { InlineError } from "./InlineError";
import { CheckCircle2 } from "lucide-react";
import { cn } from "../../lib/utils";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: React.ReactNode;
    error?: FieldError;
    showSuccess?: boolean;
    className?: string;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
    ({ label, error, showSuccess, className, ...props }, ref) => {
        const hasError = !!error;
        const isSuccess = showSuccess && !hasError;

        return (
            <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                    {label}
                </label>
                <div className="relative">
                    <input
                        ref={ref}
                        className={cn(
                            "w-full px-4 py-2 bg-slate-50 border rounded-xl text-sm outline-none transition-all",
                            "focus:ring-2 focus:ring-indigo-500/20",
                            hasError && "border-rose-500 focus:border-rose-500 bg-rose-50/50",
                            isSuccess && "border-emerald-500 focus:border-emerald-500",
                            !hasError && !isSuccess && "border-slate-200 focus:border-indigo-500",
                            className
                        )}
                        {...props}
                    />
                    {isSuccess && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <CheckCircle2 size={16} className="text-emerald-500" />
                        </div>
                    )}
                </div>
                {error && <InlineError message={error.message || "Invalid input"} />}
            </div>
        );
    }
);

FormInput.displayName = "FormInput";
