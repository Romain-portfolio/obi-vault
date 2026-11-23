import { type FormHTMLAttributes, type ChangeEvent, type SubmitEvent, useState } from 'react';
import AppInput from '../../../components/ui/Inputs/AppInput/AppInput';
import AppTextarea from '../../../components/ui/Inputs/AppTextarea/AppTextarea';
import AppPasswordInput from '../../../components/ui/Inputs/AppPasswordInput/AppPasswordInput';
import AppButton from '../../../components/ui/Buttons/AppButton/AppButton';
import { type NewLoginEntry } from '../types';
import styles from './PasswordForm.module.css';
import clsx from 'clsx';

export type PasswordFormProps = {
    onSubmitEntry: (entry: NewLoginEntry) => Promise<void>;
    initialValues?: NewLoginEntry;
    buttonText?: 'Ajouter' | 'Modifier';
} & Omit<FormHTMLAttributes<HTMLFormElement>, 'onSubmit'>;

export default function PasswordForm({
    onSubmitEntry,
    initialValues = { name: '', user: '', password: '', note: '' },
    buttonText = 'Ajouter',
    className,
    ...rest
}: PasswordFormProps) {
    const [inputValues, setInputValues] = useState(initialValues);

    const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            await onSubmitEntry(inputValues);
        } catch {
            // L'erreur est déjà signalée par le parent.
            // Le formulaire reste simplement ouvert pour permettre de réessayer.
        }
    };

    const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const inputName = event.target.name;
        const inputValue = event.target.value;

        setInputValues((prev) => {
            return { ...prev, [inputName]: inputValue };
        });
    };

    return (
        <form className={clsx(styles.form, className)} onSubmit={handleSubmit} {...rest}>
            <AppInput
                name="name"
                onChange={handleChange}
                value={inputValues.name}
                placeholder="Nom"
                required
                data-autofocus
            />
            <div className={styles.loginWrapper}>
                <AppInput
                    name="user"
                    onChange={handleChange}
                    value={inputValues.user}
                    placeholder="Identifiant"
                    required
                />
                <AppPasswordInput
                    name="password"
                    onChange={handleChange}
                    value={inputValues.password}
                    placeholder="Mot de passe"
                    required
                />
            </div>
            <AppTextarea
                name="note"
                onChange={handleChange}
                value={inputValues.note}
                placeholder="Notes"
                rows={3}
            />
            <AppButton type="submit">{buttonText}</AppButton>
        </form>
    );
}
