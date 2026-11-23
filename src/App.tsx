import { useState, useEffect, type ReactNode } from 'react';

import WireframeBackground from './components/layout/WireframeBackground/WireframeBackground';
import { type AppBackgroundColor, type ThemeName } from './config/theme';
import PasswordPage from './features/passwords/PasswordPage/PasswordPage';
import AppButton from './components/ui/Buttons/AppButton/AppButton';
import { useSettingsStore } from './store/settingsStore';
import AppInput from './components/ui/Inputs/AppInput/AppInput';
import UnlockVaultPage from './features/vault/UnlockVaultPage/UnlockVaultPage';
import TransitionPanel from './components/layout/TransitionPanel/TransitionPanel';
import CreateVaultPage from './features/vault/CreateVaultPage/CreateVaultPage';
import { isVaultCreated, lockVault } from './features/vault/api';
import ErrorPanel from './features/errors/ErrorPanel/ErrorPanel';
import { reportError } from './features/errors/errorStore';
import { useClipboardStore } from './store/clipboardStore';

type PageName = 'create' | 'unlock' | 'password' | 'checkingVault' | 'checkFailed';

function App() {
    const theme = useSettingsStore((state) => state.theme);
    const setTheme = useSettingsStore((state) => state.setTheme);
    const backgroundColor = useSettingsStore((state) => state.appBackgroundColor);
    const setBackgroundColor = useSettingsStore((state) => state.setAppBackgroundColor);
    const clearClipboardDelay = useSettingsStore((state) => state.clearClipboardDelay);
    const setClearClipboardDelay = useSettingsStore((state) => state.setClearClipboardDelay);
    const passwordAutoHideDelay = useSettingsStore((state) => state.passwordAutoHideDelay);
    const setPasswordAutoHideDelay = useSettingsStore((state) => state.setPasswordAutoHideDelay);
    const clearClipboard = useClipboardStore((state) => state.clearClipboard);
    const resetSettings = useSettingsStore((state) => state.resetSettings);
    const [showSettings, setShowSettings] = useState(false);

    const [currentPage, setCurrentPage] = useState<PageName>('checkingVault');

    useEffect(() => {
        const getFirstPage = async () => {
            try {
                setCurrentPage((await isVaultCreated()) ? 'unlock' : 'create');
            } catch (error) {
                console.error('Erreur lors de la verification du coffre', error);
                setCurrentPage('checkFailed');
            }
        };
        getFirstPage();
    }, []);

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        document.documentElement.dataset.backgroundColor = backgroundColor;
    }, [theme, backgroundColor]);

    //Supprime les comportements natifs de la touche Échap (ex: quitter le mode plein écran)
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const handleUnlock = () => {
        setCurrentPage('password');
    };
    const handleLock = async () => {
        setCurrentPage('unlock');
        clearClipboard();
        try {
            await lockVault();
        } catch (error) {
            reportError(
                error,
                'Le coffre n’a pas pu être verrouillé correctement. Fermez l’application pour le sécuriser.',
            );
        }
    };
    const handleCreate = () => {
        setCurrentPage('password');
    };
    const shownComponent: Record<PageName, ReactNode> = {
        create: <CreateVaultPage onCreate={handleCreate} />,
        unlock: <UnlockVaultPage onUnlock={handleUnlock} />,
        password: <PasswordPage />,
        checkingVault: null,
        checkFailed: <div>fail</div>, //a faire: créé page d'erreur
    };

    return (
        <div>
            <div style={{ position: 'absolute', zIndex: 10, opacity: showSettings ? 1 : 0 }}>
                <AppButton onClick={() => setShowSettings(!showSettings)}>cacher</AppButton>
                <AppButton onClick={handleLock}>lock</AppButton>
                <AppButton onClick={() => resetSettings()}>reset</AppButton>
                <AppInput
                    type="number"
                    value={clearClipboardDelay}
                    onChange={(e) => setClearClipboardDelay(Number(e.target.value))}
                />
                <AppInput
                    type="number"
                    value={passwordAutoHideDelay}
                    onChange={(e) => setPasswordAutoHideDelay(Number(e.target.value))}
                />
                <select
                    value={backgroundColor}
                    onChange={(e) => {
                        setBackgroundColor(e.currentTarget.value as AppBackgroundColor);
                    }}
                >
                    <option value="red">red</option>
                    <option value="orange">orange</option>
                    <option value="amber">amber</option>
                    <option value="yellow">yellow</option>
                    <option value="lime">lime</option>
                    <option value="green">green</option>
                    <option value="emerald">emerald</option>
                    <option value="teal">teal</option>
                    <option value="cyan">cyan</option>
                    <option value="sky">sky</option>
                    <option value="blue">blue</option>
                    <option value="indigo">indigo</option>
                    <option value="purple">purple</option>
                    <option value="fuchsia">fuchsia</option>
                    <option value="pink">pink</option>
                    <option value="rose">rose</option>
                    <option value="slate">slate</option>
                    <option value="gray">gray</option>
                    <option value="zinc">zinc</option>
                    <option value="neutral">neutral</option>
                    <option value="stone">stone</option>
                </select>
                <select
                    value={theme}
                    onChange={(e) => {
                        setTheme(e.currentTarget.value as ThemeName);
                    }}
                >
                    <option value="dark">dark</option>
                    <option value="light">light</option>
                </select>
                <AppButton
                    onClick={() => {
                        setTimeout(() => {
                            reportError(new Error('test'), 'Message de test.');
                        }, 5000);
                    }}
                >
                    Erreur
                </AppButton>
            </div>
            <WireframeBackground variant={backgroundColor} />
            <main className="appMain">
                <TransitionPanel contentKey={currentPage}>
                    {shownComponent[currentPage]}
                </TransitionPanel>
            </main>
            <ErrorPanel />
        </div>
    );
}

export default App;
