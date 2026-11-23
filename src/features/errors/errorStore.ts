import { create } from 'zustand';

const ERROR_DISPLAY_DURATION = 10_000;

type ErrorNotification = {
    id: string;
    message: string;
};

type ErrorState = {
    errors: ErrorNotification[];
    addError: (message: string) => void;
    removeError: (errorId: string) => void;
};

export const useErrorStore = create<ErrorState>()((set, get) => ({
    errors: [],
    addError: (message) => {
        const newError = { id: crypto.randomUUID(), message };
        set((state) => ({ errors: [...state.errors, newError] }));
        setTimeout(() => {
            get().removeError(newError.id);
        }, ERROR_DISPLAY_DURATION);
    },
    removeError: (errorId) => {
        set((state) => ({ errors: state.errors.filter((error) => error.id !== errorId) }));
    },
}));

export const reportError = (error: unknown, message: string) => {
    const addError = useErrorStore.getState().addError;
    addError(message);
    console.error(message, error);
};
