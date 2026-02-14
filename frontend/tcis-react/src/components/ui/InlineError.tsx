import { AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface InlineErrorProps {
    message: string;
    className?: string;
}

export function InlineError({ message, className }: InlineErrorProps) {
    return (
        <div className={cn(
            'flex items-center gap-2 text-rose-600 text-sm mt-1',
            className
        )}>
            <AlertCircle size={14} className="flex-shrink-0" />
            <span>{message}</span>
        </div>
    );
}
