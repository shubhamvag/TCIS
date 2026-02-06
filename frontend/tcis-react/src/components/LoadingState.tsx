import { Loader2 } from "lucide-react";

export function LoadingState({ message = "Loading data..." }: { message?: string }) {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mb-3 text-slate-300" />
            <span className="text-sm font-medium">{message}</span>
        </div>
    );
}
