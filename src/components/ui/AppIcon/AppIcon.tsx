import {
    Trash2,
    Pencil,
    Plus,
    Copy,
    CopyPlus,
    ClipboardCheck,
    Eye,
    EyeOff,
    X,
    Check,
    LockKeyhole,
    LockKeyholeOpen,
    type LucideIcon,
    type LucideProps,
} from 'lucide-react';

const icons = {
    trash: Trash2,
    pencil: Pencil,
    plus: Plus,
    copy: Copy,
    duplicate: CopyPlus,
    clipboardCheck: ClipboardCheck,
    show: Eye,
    hide: EyeOff,
    cross: X,
    check: Check,
    lock: LockKeyhole,
    unlock: LockKeyholeOpen,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof icons;

export type AppIconProps = {
    icon: IconName;
} & LucideProps;

export default function AppIcon({ icon, ...rest }: AppIconProps) {
    const Icon = icons[icon];

    return <Icon aria-hidden="true" {...rest} />;
}
