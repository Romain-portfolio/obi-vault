import { type ChangeEvent, useState, useRef, type SubmitEvent, useEffect } from 'react';

import { type VaultPageStatus } from '../types';
import AppButton from '../../../components/ui/Buttons/AppButton/AppButton';
import AppPasswordInput from '../../../components/ui/Inputs/AppPasswordInput/AppPasswordInput';
import AppIcon from '../../../components/ui/AppIcon/AppIcon';

import styles from './CreateVaultForm.module.css';
import clsx from 'clsx';

const MIN_PASSWORD_LENGTH = 12;

export type CreateVaultFormProps = {
    onSubmit: (password: string) => void;
    status: VaultPageStatus;
};

export default function CreateVaultForm({ onSubmit, status }: CreateVaultFormProps) {
    const [inputValues, setInputValue] = useState({ password: '', confirm: '' });
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (status === 'idle') {
            inputRef.current?.focus();
        }
    }, [status]);

    const passwordMatch =
        inputValues.password !== '' && inputValues.password === inputValues.confirm;
    const hasMinLength = inputValues.password.length >= MIN_PASSWORD_LENGTH;
    const isDisabled = !passwordMatch || !hasMinLength || status !== 'idle';

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const inputName = event.target.name;
        const inputValue = event.target.value;

        setInputValue((prev) => {
            return { ...prev, [inputName]: inputValue };
        });
    };

    const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (isDisabled) {
            return;
        }
        onSubmit(inputValues.password);
    };

    return (
        <form className={clsx(styles.createVaultForm, styles[status])} onSubmit={handleSubmit}>
            <p>
                Créez votre mot de passe maître. Il protège votre coffre et vous sera demandé à
                chaque ouverture. <br />
                <br /> <span className={styles.warning}>⚠</span> Ce mot de passe ne pourra pas être
                récupéré. Si vous l’oubliez, vos données seront perdues.
            </p>
            <AppPasswordInput
                name="password"
                placeholder="Mot de passe"
                onChange={handleChange}
                value={inputValues.password}
                disabled={status !== 'idle'}
                aria-describedby="password-rules"
            />
            <AppPasswordInput
                name="confirm"
                placeholder="Confirmation"
                onChange={handleChange}
                value={inputValues.confirm}
                disabled={status !== 'idle'}
                aria-describedby="password-rules"
            />
            <ul id="password-rules" className={styles.passwordRules}>
                <li className={clsx(styles.passwordRule, hasMinLength && styles.valid)}>
                    <div>
                        <AppIcon size={18} icon={hasMinLength ? 'check' : 'cross'} />
                        <span>12 caractères minimum</span>
                    </div>
                </li>
                <li className={clsx(styles.passwordRule, passwordMatch && styles.valid)}>
                    <div>
                        <AppIcon size={18} icon={passwordMatch ? 'check' : 'cross'} />
                        <span>Mots de passe identiques</span>
                    </div>
                </li>
            </ul>
            <AppButton
                type="submit"
                variant="primary"
                className={styles.lockButton}
                disabled={isDisabled}
            >
                Créer le coffre
            </AppButton>
        </form>
    );
}
