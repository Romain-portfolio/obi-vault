import { type ChangeEvent, useState, useRef, type SubmitEvent, useEffect } from 'react';

import IconButton from '../../../components/ui/Buttons/IconButton/IconButton';
import AppPasswordInput from '../../../components/ui/Inputs/AppPasswordInput/AppPasswordInput';

import styles from './UnlockVaultForm.module.css';
import clsx from 'clsx';
import { type VaultPageStatus } from '../types';

export type UnlockVaultFormProps = {
    onSubmit: (password: string) => void;
    status: VaultPageStatus;
};

export default function UnlockVaultForm({ onSubmit, status }: UnlockVaultFormProps) {
    const [password, setPassword] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (status === 'idle') {
            setPassword('');
            inputRef.current?.focus();
        }
    }, [status]);

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        setPassword(event.currentTarget.value);
    };

    const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        onSubmit(password);
    };

    return (
        <form className={clsx(styles.unlockVaultForm, styles[status])} onSubmit={handleSubmit}>
            <AppPasswordInput
                placeholder="Mot de passe"
                onChange={handleChange}
                value={password}
                disabled={status !== 'idle'}
                ref={inputRef}
            />
            <IconButton
                type="submit"
                icon={status === 'success' ? 'unlock' : 'lock'}
                label="Déverrouiller"
                variant="primary"
                className={styles.lockButton}
                disabled={status !== 'idle'}
            />
        </form>
    );
}
