import { create } from 'zustand';
import { writeSecret, clear } from '@tauri-apps/plugin-clipboard-manager';
import { getPassword } from '../features/passwords/api';
import { useSettingsStore } from './settingsStore';
import { reportError } from '../features/errors/errorStore';

/*
 * TODO (dépendance à corriger) : ce store global importe `getPassword`
 * depuis `features/passwords`, alors qu'un store global ne devrait
 * dépendre d'aucune feature.
 *
 * Accepté pour l'instant, car seuls les mots de passe utilisent la copie.
 * À corriger si une autre feature doit copier un secret, ou si `passwords`
 * se met à importer depuis `vault` (risque d'import circulaire :
 * passwords → vault → clipboardStore → passwords).
 *
 * Correction prévue : `copySecret(text)` reçoit directement le texte,
 * l'appel à `getPassword` passe dans `features/passwords`, et l'indication
 * « copié » est gérée côté `passwords`, en se basant sur un état
 * « presse-papier rempli » exposé par ce store.
 */

let timerId: ReturnType<typeof setTimeout> | undefined;

type ClipboardState = {
    copiedLoginEntryId: string | null;
    copyPassword: (id: string) => Promise<void>;
    clearClipboard: () => Promise<void>;
};

export const useClipboardStore = create<ClipboardState>()((set, get) => ({
    copiedLoginEntryId: null,
    copyPassword: async (id) => {
        try {
            const password = await getPassword(id);
            const clearClipboardDelay = useSettingsStore.getState().clearClipboardDelay;

            await writeSecret(password);
            set({ copiedLoginEntryId: id });
            clearTimeout(timerId);
            if (clearClipboardDelay) {
                timerId = setTimeout(() => {
                    get().clearClipboard();
                }, clearClipboardDelay);
            }
        } catch (error) {
            reportError(error, 'Impossible de copier le mot de passe. Réessayez.');
        }
    },
    clearClipboard: async () => {
        clearTimeout(timerId);
        try {
            await clear();
            set({ copiedLoginEntryId: null });
        } catch (error) {
            reportError(
                error,
                'Impossible de vider le presse-papier. Copiez un autre texte pour remplacer le mot de passe.',
            );
        }
    },
}));
