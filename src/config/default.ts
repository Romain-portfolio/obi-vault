import { type ThemeName, type AppBackgroundColor } from './theme';

export type AppSettings = {
    /** millisecondes */
    passwordAutoHideDelay: number;
    /** millisecondes */
    clearClipboardDelay: number;
    theme: ThemeName;
    appBackgroundColor: AppBackgroundColor;
};

export const DEFAULT_SETTINGS: AppSettings = {
    passwordAutoHideDelay: 30_000,
    clearClipboardDelay: 30_000,
    theme: 'dark',
    appBackgroundColor: 'blue',
};
