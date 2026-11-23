import { useState } from 'react';
import clsx from 'clsx';

import AppTable, { type AppTableColumn } from '../../../components/ui/AppTable/AppTable';
import AppModal from '../../../components/ui/AppModal/AppModal';
import PasswordForm from '../PasswordForm/PasswordForm';
import IconButton from '../../../components/ui/Buttons/IconButton/IconButton';
import PasswordCell from '../PasswordCell/PasswordCell';
import { type NewLoginEntry, type LoginEntryWithPassword, type LoginEntry } from '../types';
import { reportError } from '../../errors/errorStore';

import styles from './PasswordTable.module.css';
import { getPassword } from '../api';

export type PasswordTableProps = {
    loginEntries: LoginEntry[];
    className?: string;
    onDelete: (passwordId: string) => void;
    onDuplicate: (passwordId: string) => void;
    onModify: (newLoginEntry: NewLoginEntry, loginEntryToModifyId: string) => Promise<void>;
};

export default function PasswordTable({
    loginEntries,
    className,
    onDelete,
    onDuplicate,
    onModify,
}: PasswordTableProps) {
    const [loginEntryToModify, setLoginEntryToModify] = useState<
        LoginEntryWithPassword | undefined
    >(undefined);
    const hasNotes = loginEntries.some((loginEntry) => loginEntry.note.trim() !== '');

    const getKey = (passwordEntry: LoginEntry) => {
        return passwordEntry.id;
    };

    const closeModal = () => {
        setLoginEntryToModify(undefined);
    };

    const handleModify = async (newLoginEntry: NewLoginEntry) => {
        if (loginEntryToModify) {
            await onModify(newLoginEntry, loginEntryToModify.id);
        }
        closeModal();
    };

    const handleModifyClick = async (loginEntry: LoginEntry) => {
        try {
            const password = await getPassword(loginEntry.id);
            const loginEntryToModifyWithPassword = {
                ...loginEntry,
                password: password,
            };
            setLoginEntryToModify(loginEntryToModifyWithPassword);
        } catch (error) {
            reportError(error, 'Impossible de modifier le mot de passe. Réessayez.');
        }
    };

    const nameUserColumns: AppTableColumn<LoginEntry>[] = [
        {
            key: 'name',
            header: 'Nom',
            align: 'left',
            render: (loginEntry) => loginEntry.name,
        },
        {
            key: 'user',
            header: 'Identifiant',
            align: 'left',
            render: (loginEntry) => loginEntry.user,
        },
    ];

    const noteColumn: AppTableColumn<LoginEntry> = {
        key: 'notes',
        header: 'Notes',
        align: 'left',
        render: (loginEntry) => loginEntry.note,
    };

    const passwordColumn: AppTableColumn<LoginEntry> = {
        key: 'password',
        header: 'Mot de passe',
        align: 'left',
        width: '200px',
        render: (loginEntry) => <PasswordCell loginEntryId={loginEntry.id} />,
    };

    const actionsColumn: AppTableColumn<LoginEntry> = {
        key: 'actions',
        header: 'Actions',
        align: 'center',
        width: '140px',
        render: (loginEntry) => (
            <div className={styles.actionWrapper}>
                <IconButton
                    icon="pencil"
                    label="Modifier"
                    size="sm"
                    onClick={() => {
                        handleModifyClick(loginEntry);
                    }}
                />
                <IconButton
                    icon="duplicate"
                    label="Dupliquer"
                    size="sm"
                    onClick={() => {
                        onDuplicate(loginEntry.id);
                    }}
                />
                <IconButton
                    icon="trash"
                    label="Supprimer"
                    size="sm"
                    tone="danger"
                    onClick={() => {
                        onDelete(loginEntry.id);
                    }}
                />
            </div>
        ),
    };

    const passwordTableColumns: AppTableColumn<LoginEntry>[] = [
        ...nameUserColumns,
        ...(hasNotes ? [noteColumn] : []),
        passwordColumn,
        actionsColumn,
    ];

    return (
        <div className={clsx(styles.tableWrapper, className)}>
            <AppTable
                columns={passwordTableColumns}
                items={loginEntries}
                getKey={getKey}
                emptyListMessage="Pas de mots de passe à afficher"
            />
            <AppModal
                isOpen={!!loginEntryToModify}
                onClose={closeModal}
                className={styles.passwordTableModal}
            >
                <h2>Modifier le mot de passe</h2>
                {loginEntryToModify && (
                    <PasswordForm
                        onSubmitEntry={handleModify}
                        initialValues={{
                            name: loginEntryToModify.name,
                            user: loginEntryToModify.user,
                            password: loginEntryToModify.password,
                            note: loginEntryToModify.note,
                        }}
                        buttonText="Modifier"
                    />
                )}
            </AppModal>
        </div>
    );
}
