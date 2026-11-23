import { type ComponentProps } from 'react';
import clsx from 'clsx';
import styles from './AppInput.module.css';

export type AppInputProps = {
    variant?: 'primary';
} & ComponentProps<'input'>;

export default function AppInput({ variant = 'primary', className, ...rest }: AppInputProps) {
    return <input className={clsx(styles.input, styles[variant], className)} {...rest} />;
}
