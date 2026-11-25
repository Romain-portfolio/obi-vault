import { type LoginEntryWithPassword } from '../vault/types';

export { type LoginEntryWithPassword } from '../vault/types';
export type LoginEntry = Omit<LoginEntryWithPassword, 'password'>;
export type NewLoginEntry = Omit<LoginEntryWithPassword, 'id'>;
