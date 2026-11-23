import { type ComponentProps } from 'react';
import clsx from 'clsx';
import styles from './AppTextarea.module.css';

export type AppTextareaProps = {
    variant?: 'primary';
} & ComponentProps<'textarea'>;

export default function AppTextarea({ variant = 'primary', className, ...rest }: AppTextareaProps) {
    return <textarea className={clsx(styles.textarea, styles[variant], className)} {...rest} />;
}
