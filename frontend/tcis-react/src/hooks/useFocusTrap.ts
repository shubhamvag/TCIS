import { useEffect, useRef } from 'react';

const FOCUSABLE_ELEMENTS = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
];

export function useFocusTrap(isOpen: boolean) {
    const containerRef = useRef<HTMLDivElement>(null);
    const previousActiveElement = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (!isOpen) return;

        // Store the element that triggered the modal
        previousActiveElement.current = document.activeElement as HTMLElement;

        const container = containerRef.current;
        if (!container) return;

        // Focus first focusable element
        const focusableElements = container.querySelectorAll<HTMLElement>(
            FOCUSABLE_ELEMENTS.join(',')
        );

        if (focusableElements.length > 0) {
            // Small delay to ensure modal is rendered
            setTimeout(() => {
                focusableElements[0]?.focus();
            }, 100);
        }

        const handleTabKey = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return;

            const focusableContent = container.querySelectorAll<HTMLElement>(
                FOCUSABLE_ELEMENTS.join(',')
            );

            const firstElement = focusableContent[0];
            const lastElement = focusableContent[focusableContent.length - 1];

            if (e.shiftKey) {
                // Shift + Tab
                if (document.activeElement === firstElement) {
                    lastElement?.focus();
                    e.preventDefault();
                }
            } else {
                // Tab
                if (document.activeElement === lastElement) {
                    firstElement?.focus();
                    e.preventDefault();
                }
            }
        };

        document.addEventListener('keydown', handleTabKey);

        return () => {
            document.removeEventListener('keydown', handleTabKey);

            // Restore focus to the element that opened the modal
            if (previousActiveElement.current) {
                previousActiveElement.current.focus();
            }
        };
    }, [isOpen]);

    return containerRef;
}
