import { AlertTriangle, XCircle, Info } from 'lucide-react';
import { cn } from '../../lib/utils';

interface FallbackUIProps {
    title: string;
    message: string;
    variant?: 'error' | 'warning' | 'info';
    action?: {
        label: string;
        onClick: () => void;
    };
    className?: string;
}

export function FallbackUI({
    title,
    message,
    variant = 'error',
    action,
    className
}: FallbackUIProps) {
    const variantStyles = {
        error: {
            container: 'bg-rose-50 border-rose-200',
            icon: 'bg-rose-100 text-rose-600',
            title: 'text-rose-900',
            message: 'text-rose-700',
            button: 'bg-rose-600 hover:bg-rose-700 text-white',
            IconComponent: XCircle,
        },
        warning: {
            container: 'bg-amber-50 border-amber-200',
            icon: 'bg-amber-100 text-amber-600',
            title: 'text-amber-900',
            message: 'text-amber-700',
            button: 'bg-amber-600 hover:bg-amber-700 text-white',
            IconComponent: AlertTriangle,
        },
        info: {
            container: 'bg-blue-50 border-blue-200',
            icon: 'bg-blue-100 text-blue-600',
            title: 'text-blue-900',
            message: 'text-blue-700',
            button: 'bg-blue-600 hover:bg-blue-700 text-white',
            IconComponent: Info,
        },
    };

    const styles = variantStyles[variant];
    const Icon = styles.IconComponent;

    return (
        <div className={cn(
            'rounded-xl border p-6 shadow-sm',
            styles.container,
            className
        )}>
            <div className="flex items-start gap-4">
                <div className={cn(
                    'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
                    styles.icon
                )}>
                    <Icon size={20} />
                </div>
                <div className="flex-1">
                    <h3 className={cn('text-lg font-bold mb-1', styles.title)}>
                        {title}
                    </h3>
                    <p className={cn('text-sm mb-4', styles.message)}>
                        {message}
                    </p>
                    {action && (
                        <button
                            onClick={action.onClick}
                            className={cn(
                                'px-4 py-2 rounded-lg text-sm font-bold transition-all active:scale-95',
                                styles.button
                            )}
                        >
                            {action.label}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
