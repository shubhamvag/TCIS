import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertCircle } from "lucide-react";

interface Props {
    children: ReactNode;
    message?: string;
}

interface State {
    hasError: boolean;
}

export class LocalErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(_: Error): State {
        return { hasError: true };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Local component error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center p-8 text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-2xl h-full min-h-[300px]">
                    <AlertCircle size={32} className="mb-3 text-rose-400" />
                    <p className="text-sm font-bold text-slate-600">
                        {this.props.message || "Component failed to load."}
                    </p>
                    <button
                        onClick={() => this.setState({ hasError: false })}
                        className="mt-4 text-xs font-black text-indigo-600 uppercase tracking-widest hover:underline"
                    >
                        Try Reloading Component
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
