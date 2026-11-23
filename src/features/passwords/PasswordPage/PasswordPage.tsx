import { useEffect, useState } from 'react';

import PasswordForm from '../PasswordForm/PasswordForm';
import PasswordTable from '../PasswordTable/PasswordTable';
import AppModal from '../../../components/ui/AppModal/AppModal';
import AppButton from '../../../components/ui/Buttons/AppButton/AppButton';
import { type NewLoginEntry, type LoginEntry } from '../types';
import {
    listLoginEntries,
    addLoginEntry,
    deleteLoginEntry,
    duplicateLoginEntry,
    modifyLoginEntry,
} from '../api';
import { reportError } from '../../errors/errorStore';

import styles from './PasswordPage.module.css';

export default function PasswordPage() {
    const [loginEntries, setLoginEntries] = useState<LoginEntry[]>([]);
    const [modal, setModal] = useState(false);

    const closeModal = () => {
        setModal(false);
    };

    useEffect(() => {
        const loadLoginEntries = async () => {
            try {
                setLoginEntries(await listLoginEntries());
            } catch (error) {
                reportError(
                    error,
                    "Impossible d'afficher la liste de mots de passe. Relancez l'application.",
                );
            }
        };
        loadLoginEntries();
    }, []);

    const handleAdd = async (loginEntry: NewLoginEntry) => {
        try {
            const newLoginEntry = await addLoginEntry(loginEntry);
            setLoginEntries((prev) => [newLoginEntry, ...prev]);
            closeModal();
        } catch (error) {
            reportError(error, "Impossible d'ajouter le mot de passe. Réessayez.");
            throw error;
        }
    };

    const handleModify = async (newLoginEntry: NewLoginEntry, loginEntryToModifyId: string) => {
        try {
            const modifiedLoginEntry = await modifyLoginEntry(loginEntryToModifyId, newLoginEntry);
            setLoginEntries((prev) => {
                const entryIndex = prev.findIndex(
                    (loginEntry) => loginEntryToModifyId === loginEntry.id,
                );
                if (entryIndex === -1) return prev;
                const newLoginEntries = [...prev];
                newLoginEntries.splice(entryIndex, 1, modifiedLoginEntry);
                return newLoginEntries;
            });
        } catch (error) {
            reportError(error, 'Impossible de modifier le mot de passe. Réessayez.');
            throw error;
        }
    };

    const handleDelete = async (loginEntryId: string) => {
        try {
            await deleteLoginEntry(loginEntryId);
            setLoginEntries((prev) => {
                return prev.filter((loginEntry) => loginEntry.id !== loginEntryId);
            });
        } catch (error) {
            reportError(error, 'Impossible de supprimer le mot de passe. Réessayez.');
        }
    };

    const handleDuplicate = async (loginEntryToDupId: string) => {
        try {
            const duplicatedLoginEntry = await duplicateLoginEntry(loginEntryToDupId);
            setLoginEntries((prev) => {
                const newLoginEntries = [...prev];
                const originalIndex = prev.findIndex(
                    (loginEntry) => loginEntryToDupId === loginEntry.id,
                );
                const insertIndex = originalIndex === -1 ? prev.length : originalIndex + 1;
                newLoginEntries.splice(insertIndex, 0, duplicatedLoginEntry);
                return newLoginEntries;
            });
        } catch (error) {
            reportError(error, 'Impossible de dupliquer le mot de passe. Réessayez.');
        }
    };

    return (
        <div className={styles.passwordPageContainer}>
            <div className={styles.passwordPageHeader}>
                <h1>Mots de passe</h1>
                <AppButton
                    onClick={() => {
                        setModal(true);
                    }}
                >
                    + Ajouter
                </AppButton>
            </div>
            <PasswordTable
                loginEntries={loginEntries}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
                onModify={handleModify}
            />
            <AppModal className={styles.passwordPageModal} isOpen={modal} onClose={closeModal}>
                <h2>Ajouter un mot de passe</h2>
                {modal && <PasswordForm onSubmitEntry={handleAdd} />}
            </AppModal>
        </div>
    );
}
