import { type ReactNode, useLayoutEffect, useRef } from 'react';

import styles from './TransitionPanel.module.css';

export type TransitionPanelProps = { contentKey: string; children: ReactNode };

export default function TransitionPanel({ contentKey, children }: TransitionPanelProps) {
    const panelRef = useRef<HTMLDivElement>(null);
    const lastPanelSizeRef = useRef<{ width: number; height: number }>(null);

    useLayoutEffect(() => {
        const panel = panelRef.current;
        if (!panel || !lastPanelSizeRef.current) return;
        const panelSize = {
            width: panel.offsetWidth,
            height: panel.offsetHeight,
        };
        if (
            lastPanelSizeRef.current.width === panelSize.width &&
            lastPanelSizeRef.current.height === panelSize.height
        )
            return;
        const resizeAnimation = panel.animate(
            [
                {
                    width: `${lastPanelSizeRef.current.width}px`,
                    height: `${lastPanelSizeRef.current.height}px`,
                },
                { width: `${panelSize.width}px`, height: `${panelSize.height}px` },
            ],
            {
                duration: 500,
                easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
            },
        );

        return () => {
            resizeAnimation?.cancel();
        };
    }, [contentKey]);

    useLayoutEffect(() => {
        if (!panelRef.current) return;
        const resizeObserver = new ResizeObserver(() => {
            if (!panelRef.current) return;
            lastPanelSizeRef.current = {
                width: panelRef.current?.offsetWidth,
                height: panelRef.current?.offsetHeight,
            };
        });
        resizeObserver.observe(panelRef.current);

        return () => {
            resizeObserver.disconnect();
        };
    }, []);

    return (
        <div className={styles.transitionPanel} ref={panelRef}>
            <div key={contentKey} className={styles.panelContent}>
                {children}
            </div>
        </div>
    );
}
