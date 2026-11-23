import { type ComponentProps } from 'react';
import clsx from 'clsx';
import styles from './AppButton.module.css';

export type AppButtonProps = {
    variant?: 'primary' | 'ghost';
    tone?: 'neutral' | 'danger';
} & ComponentProps<'button'>;

export default function AppButton({
    variant = 'primary',
    tone = 'neutral',
    type = 'button',
    className,
    ...rest
}: AppButtonProps) {
    return (
        <button
            className={clsx(styles.button, styles[variant], styles[tone], className)}
            type={type}
            {...rest}
        />
    );
}
