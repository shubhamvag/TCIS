import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({ errorInfo });
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
                    <div className="max-w-2xl w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-8">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h1 className="text-2xl font-bold text-slate-900 mb-2">
                                    Something went wrong
                                </h1>
                                <p className="text-slate-600 mb-4">
                                    The application encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
                                </p>

                                {import.meta.env.DEV && this.state.error && (
                                    <details className="mb-4">
                                        <summary className="cursor-pointer text-sm font-semibold text-slate-700 hover:text-slate-900 mb-2">
                                            Error Details (Development Only)
                                        </summary>
                                        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                                            <p className="text-sm font-mono text-rose-600 mb-2">
                                                {this.state.error.toString()}
                                            </p>
                                            {this.state.errorInfo && (
                                                <pre className="text-xs text-slate-600 overflow-auto max-h-64">
                                                    {this.state.errorInfo.componentStack}
                                                </pre>
                                            )}
                                        </div>
                                    </details>
                                )}

                                <div className="flex gap-3">
                                    <button
                                        onClick={this.handleReset}
                                        className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-slate-800 transition-all active:scale-95"
                                    >
                                        Try Again
                                    </button>
                                    <button
                                        onClick={() => window.location.href = '/'}
                                        className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all"
                                    >
                                        Go to Dashboard
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
