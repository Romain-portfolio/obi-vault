import { useRef, useEffect, type ReactNode } from 'react';
import clsx from 'clsx';

import IconButton from '../Buttons/IconButton/IconButton';

import styles from './AppModal.module.css';

export type AppModalProps = {
    children: ReactNode;
    isOpen: boolean;
    onClose: () => void;
    className?: string;
};

export default function AppModal({ children, isOpen, onClose, className }: AppModalProps) {
    const modalRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = modalRef.current;
        if (!dialog) return;

        if (!isOpen) {
            dialog.close();
            return;
        }

        dialog.showModal();

        const target =
            dialog.querySelector<HTMLElement>('[data-autofocus]') ??
            dialog.querySelector<HTMLElement>('input, textarea, select');
        target?.focus();
    }, [isOpen]);

    //capture l'appui sur la touche Échap globalement
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    return (
        <dialog
            className={clsx(styles.modalBackground, className)}
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
            ref={modalRef}
        >
            <div className={styles.modalContent}>
                {children}
                <IconButton
                    className={styles.modalCloseButton}
                    size="sm"
                    label="Fermer"
                    onClick={onClose}
                    icon="cross"
                />
            </div>
        </dialog>
    );
}
