import { RefreshCw, WifiOff, ServerCrash } from 'lucide-react';
import { cn } from '../../lib/utils';

interface QueryErrorStateProps {
    error: Error | null;
    onRetry?: () => void;
    className?: string;
}

export function QueryErrorState({ error, onRetry, className }: QueryErrorStateProps) {
    // Determine error type
    const isNetworkError = error?.message.toLowerCase().includes('network') ||
        error?.message.toLowerCase().includes('fetch');

    const Icon = isNetworkError ? WifiOff : ServerCrash;
    const title = isNetworkError ? 'Connection Error' : 'Server Error';
    const defaultMessage = isNetworkError
        ? 'Unable to connect to the server. Please check your internet connection.'
        : 'The server encountered an error. Please try again later.';

    return (
        <div className={cn(
            'flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-slate-200',
            className
        )}>
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-4">
                <Icon className="text-rose-600" size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
            <p className="text-slate-600 text-center mb-6 max-w-md">
                {error?.message || defaultMessage}
            </p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-slate-800 transition-all active:scale-95"
                >
                    <RefreshCw size={16} />
                    Retry
                </button>
            )}
        </div>
    );
}
