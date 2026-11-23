import { useState, type AnimationEvent } from 'react';

import UnlockVaultForm from '../UnlockVaultForm/UnlockVaultForm';
import { type VaultPageStatus } from '../types';
import { unlockVault } from '../api';
import { AppError } from '../../errors/errors';
import { reportError } from '../../errors/errorStore';

import styles from './UnlockVaultPage.module.css';
import clsx from 'clsx';

export type UnlockVaultPageProps = { onUnlock: () => void };

export default function UnlockVaultPage({ onUnlock }: UnlockVaultPageProps) {
    const [status, setStatus] = useState<VaultPageStatus>('idle');
    const handleAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
        if (event.target !== event.currentTarget) return;
        if (status === 'success') onUnlock();
        else if (status === 'error') {
            setStatus('idle');
        }
    };

    const handleSubmit = async (password: string) => {
        if (status === 'verifying' || status === 'success') return;
        setStatus('verifying');
        try {
            await unlockVault(password);
            setStatus('success');
        } catch (error) {
            if (error instanceof AppError && error.code === 'WRONG_PASSWORD') {
                setStatus('error');
                return;
            }
            reportError(error, 'Impossible de déverrouiller le coffre. Réessayez.');
            setStatus('idle');
        }
    };

    return (
        <div
            className={clsx(styles.unlockVaultPage, styles[status])}
            onAnimationEnd={handleAnimationEnd}
        >
            <h1>Déverrouiller</h1>
            <UnlockVaultForm onSubmit={handleSubmit} status={status} />
        </div>
    );
}
