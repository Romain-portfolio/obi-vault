import { useEffect, useRef } from 'react';

import { useErrorStore } from '../errorStore';
import IconButton from '../../../components/ui/Buttons/IconButton/IconButton';

import styles from './ErrorPanel.module.css';

const supportsPopover = typeof HTMLElement.prototype.showPopover === 'function';

export default function ErrorPanel() {
    const panelRef = useRef<HTMLDivElement>(null);
    const errors = useErrorStore((state) => state.errors);
    const removeError = useErrorStore((state) => state.removeError);

    useEffect(() => {
        if (!supportsPopover || !panelRef.current) return;
        const isPanelOpen = panelRef.current.matches(':popover-open');

        if (!isPanelOpen && errors.length > 0) {
            panelRef.current.showPopover();
        }
        if (isPanelOpen && errors.length === 0) {
            panelRef.current.hidePopover();
        }
    }, [errors]);

    return (
        <div className={styles.errorPanel} popover="manual" ref={panelRef} aria-live="polite">
            {errors.map((error) => (
                <div className={styles.errorNotification} key={error.id}>
                    <span>
                        <strong>Erreur&nbsp;: </strong>
                        {error.message}
                    </span>
                    <IconButton
                        icon="cross"
                        size="xs"
                        label="Fermer la notification"
                        onClick={() => {
                            removeError(error.id);
                        }}
                    />
                </div>
            ))}
        </div>
    );
}
