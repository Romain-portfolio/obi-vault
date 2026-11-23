import { useState } from 'react';
import clsx from 'clsx';

import { type AppInputProps } from '../AppInput/AppInput';
import IconButton from '../../Buttons/IconButton/IconButton';

import styles from './AppPasswordInput.module.css';

export type AppPasswordInputProps = Omit<AppInputProps, 'type'>;

export default function AppPasswordInput({
    variant = 'primary',
    className,
    ...rest
}: AppPasswordInputProps) {
    const [isHidden, setIsHidden] = useState(true);

    return (
        <div className={styles.appPasswordInputWrapper}>
            <input
                type={isHidden ? 'password' : 'text'}
                className={clsx(styles.appPasswordInput, styles[variant], className)}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                {...rest}
            />
            <IconButton
                type="button"
                className={styles.showPasswordIcon}
                onClick={() => {
                    setIsHidden((prev) => !prev);
                }}
                icon={isHidden ? 'show' : 'hide'}
                label={isHidden ? 'Afficher le mot de passe' : 'Cacher le mot de passe'}
            />
        </div>
    );
}
