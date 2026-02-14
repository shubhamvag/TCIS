import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    className?: string;
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    className
}: EmptyStateProps) {
    return (
        <div className={cn(
            'flex flex-col items-center justify-center p-12 bg-white rounded-xl border-2 border-dashed border-slate-200',
            className
        )}>
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Icon className="text-slate-400" size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
            <p className="text-slate-500 text-center mb-6 max-w-md text-sm">
                {description}
            </p>
            {action && (
                <button
                    onClick={action.onClick}
                    className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-slate-800 transition-all active:scale-95"
                >
                    {action.label}
                </button>
            )}
        </div>
    );
}
