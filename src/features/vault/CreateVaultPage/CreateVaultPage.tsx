import { useState, type AnimationEvent } from 'react';

import CreateVaultForm from '../CreateVaultForm/CreateVaultForm';
import { type VaultPageStatus } from '../types';
import { createVault } from '../api';
import { reportError } from '../../errors/errorStore';

import styles from './CreateVaultPage.module.css';
import clsx from 'clsx';

export type CreateVaultPageProps = { onCreate: () => void };

export default function CreateVaultPage({ onCreate }: CreateVaultPageProps) {
    const [status, setStatus] = useState<VaultPageStatus>('idle');
    const handleAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
        if (event.target !== event.currentTarget) return;
        if (status === 'success') onCreate();
        else if (status === 'error') {
            setStatus('idle');
        }
    };

    const handleSubmit = async (password: string) => {
        if (status === 'verifying' || status === 'success') return;
        setStatus('verifying');
        try {
            await createVault(password);
            setStatus('success');
        } catch (error) {
            reportError(error, 'Impossible de créer le coffre. Réessayez.');
            setStatus('idle');
        }
    };

    return (
        <div
            className={clsx(styles.createVaultPage, styles[status])}
            onAnimationEnd={handleAnimationEnd}
        >
            <h1>Création du coffre</h1>
            <CreateVaultForm onSubmit={handleSubmit} status={status} />
        </div>
    );
}
