export type VaultPageStatus = 'idle' | 'verifying' | 'success' | 'error';
export type LoginEntryWithPassword = {
    id: string;
    name: string;
    user: string;
    password: string;
    note: string;
};
