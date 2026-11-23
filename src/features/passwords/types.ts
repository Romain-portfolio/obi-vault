export type LoginEntryWithPassword = {
    id: string;
    name: string;
    user: string;
    password: string;
    note: string;
};
export type LoginEntry = Omit<LoginEntryWithPassword, 'password'>;
export type NewLoginEntry = Omit<LoginEntryWithPassword, 'id'>;
