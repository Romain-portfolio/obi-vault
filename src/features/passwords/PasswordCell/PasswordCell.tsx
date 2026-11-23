import { useState, useEffect } from 'react';
import clsx from 'clsx';
import { getPassword } from '../api';
import IconButton from '../../../components/ui/Buttons/IconButton/IconButton';
import { useClipboardStore } from '../../../store/clipboardStore';
import { useSettingsStore } from '../../../store/settingsStore';
import { reportError } from '../../errors/errorStore';

import styles from './PasswordCell.module.css';

export type PasswordCellProps = {
    loginEntryId: string;
};

const HIDDEN_PASSWORD = '••••••••••••';

export default function PasswordCell({ loginEntryId }: PasswordCellProps) {
    const [password, setPassword] = useState<string | null>(null);
    const isRevealed = password !== null;
    const copyPassword = useClipboardStore((state) => state.copyPassword);
    const isCopied = useClipboardStore((state) => state.copiedLoginEntryId === loginEntryId);
    const autoHideDelay = useSettingsStore((state) => state.passwordAutoHideDelay);

    useEffect(() => {
        if (!autoHideDelay || !isRevealed) return;
        const timeoutID = setTimeout(() => {
            setPassword(null);
        }, autoHideDelay);
        return () => {
            clearTimeout(timeoutID);
        };
    }, [isRevealed, autoHideDelay]);

    const handleTogglePassword = async () => {
        if (isRevealed) {
            setPassword(null);
            return;
        }
        try {
            const revealedPassword = await getPassword(loginEntryId);
            setPassword(revealedPassword);
        } catch (error) {
            reportError(error, "Impossible d'afficher le mot de passe. Réessayez.");
        }
    };

    return (
        <div className={styles.passwordCell}>
            <span>{isRevealed ? password : HIDDEN_PASSWORD}</span>
            <IconButton
                icon={isRevealed ? 'hide' : 'show'}
                label={isRevealed ? 'Cacher le mot de passe' : 'Afficher le mot de passe'}
                size="sm"
                onClick={handleTogglePassword}
            />
            <IconButton
                className={clsx(isCopied && styles.copied)}
                label={isCopied ? 'Mot de passe copié' : 'Copier le mot de passe'}
                icon={isCopied ? 'clipboardCheck' : 'copy'}
                size="sm"
                onClick={() => {
                    copyPassword(loginEntryId);
                }}
            />
        </div>
    );
}
