import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_SETTINGS, type AppSettings } from '../config/default';
import { type ThemeName } from '../config/theme';
import { type AppBackgroundColor } from '../config/theme';

type SettingsState = {
    setTheme: (theme: ThemeName) => void;
    setPasswordAutoHideDelay: (delay: number) => void;
    setClearClipboardDelay: (delay: number) => void;
    setAppBackgroundColor: (appBackgroundcolor: AppBackgroundColor) => void;
    resetSettings: () => void;
} & AppSettings;

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            ...DEFAULT_SETTINGS,

            setTheme: (theme) => set({ theme: theme }),
            setPasswordAutoHideDelay: (delay) => set({ passwordAutoHideDelay: delay }),
            setClearClipboardDelay: (delay) => set({ clearClipboardDelay: delay }),
            setAppBackgroundColor: (color) => set({ appBackgroundColor: color }),
            resetSettings: () => set(DEFAULT_SETTINGS),
        }),
        {
            name: 'obivault-settings',
            version: 1,
        },
    ),
);
