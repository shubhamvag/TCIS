import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught TCIS Error:", error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    private handleGoHome = () => {
        this.setState({ hasError: false, error: null });
        window.location.href = "/";
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                    <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center space-y-6">
                        <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto text-rose-600">
                            <AlertTriangle size={32} />
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold text-slate-900">Something went wrong</h1>
                            <p className="text-slate-500 text-sm">
                                The application encountered an unexpected error. We've logged the incident and are looking into it.
                            </p>
                        </div>

                        {(import.meta.env?.MODE === "development") && this.state.error && (
                            <div className="bg-rose-50 p-4 rounded-lg text-left overflow-auto max-h-32 border border-rose-100">
                                <p className="text-[10px] font-mono text-rose-800 break-words">
                                    {this.state.error.toString()}
                                </p>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={this.handleReset}
                                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all"
                            >
                                <RefreshCcw size={16} />
                                Reload
                            </button>
                            <button
                                onClick={this.handleGoHome}
                                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all"
                            >
                                <Home size={16} />
                                Go Dashboard
                            </button>
                        </div>

                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest pt-4">
                            TCIS Enterprise Support
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
