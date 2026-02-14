import { forwardRef, type ReactNode } from "react";
import type { InputHTMLAttributes } from "react";
import { cn } from "../../lib/utils";
import type { FieldError } from "react-hook-form";

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: ReactNode;
    error?: FieldError;
    className?: string;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
    ({ label, error, className, id, ...props }, ref) => {
        return (
            <div className="space-y-1.5">
                {label && (
                    <label
                        htmlFor={id}
                        className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2"
                    >
                        {label}
                    </label>
                )}
                <div className="relative">
                    <input
                        ref={ref}
                        id={id}
                        className={cn(
                            "w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all",
                            error && "border-rose-300 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/30",
                            className
                        )}
                        {...props}
                    />
                </div>
                {error && (
                    <p className="text-xs font-bold text-rose-500 animate-in slide-in-from-top-1">
                        {error.message}
                    </p>
                )}
            </div>
        );
    }
);

FormInput.displayName = "FormInput";
