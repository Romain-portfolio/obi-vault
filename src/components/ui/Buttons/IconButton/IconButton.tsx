import clsx from 'clsx';

import AppIcon, { type IconName } from '../../AppIcon/AppIcon';
import AppButton, { type AppButtonProps } from '../AppButton/AppButton';

import styles from './IconButton.module.css';

export type IconButtonProps = {
    icon: IconName;
    label: string;
    variant?: 'primary' | 'ghost';
    size?: 'lg' | 'md' | 'sm' | 'xs';
} & Omit<AppButtonProps, 'children'>;

export default function IconButton({
    icon,
    label,
    variant = 'ghost',
    size = 'md',
    className,
    ...rest
}: IconButtonProps) {
    return (
        <AppButton
            className={clsx(styles.iconButton, styles[size], className)}
            variant={variant}
            aria-label={label}
            title={label}
            {...rest}
        >
            <AppIcon icon={icon} size={size === 'xs' ? 12 : 24} />
        </AppButton>
    );
}
