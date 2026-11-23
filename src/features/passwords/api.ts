import { type LoginEntry, type NewLoginEntry, type LoginEntryWithPassword } from './types';
import { fakePasswords } from './fakePasswords';
import { AppError } from '../errors/errors';

let dataBase: LoginEntryWithPassword[] = [...fakePasswords];

const removePasswordFromEntry = (entry: LoginEntryWithPassword): LoginEntry => {
    const { password: _password, ...newEntry } = entry;
    return newEntry;
};

const getLoginEntryByIdOrThrow = (entryId: string): LoginEntryWithPassword => {
    const retrievedLoginEntry = dataBase.find((loginEntry) => loginEntry.id === entryId);
    if (!retrievedLoginEntry) throw new AppError('ENTRY_NOT_FOUND');
    return retrievedLoginEntry;
};

const createNewLoginEntry = (loginEntry: NewLoginEntry): LoginEntryWithPassword => {
    return { ...loginEntry, id: crypto.randomUUID() };
};

export async function listLoginEntries(): Promise<LoginEntry[]> {
    return dataBase.map(removePasswordFromEntry);
}

export async function addLoginEntry(loginEntry: NewLoginEntry): Promise<LoginEntry> {
    const newLoginEntryWithPassword = createNewLoginEntry(loginEntry);
    dataBase = [newLoginEntryWithPassword, ...dataBase];
    return removePasswordFromEntry(newLoginEntryWithPassword);
}

export async function modifyLoginEntry(
    loginEntryToModifyId: string,
    newLoginEntry: NewLoginEntry,
): Promise<LoginEntry> {
    const newDataBase = [...dataBase];
    const loginEntryIndex = newDataBase.findIndex(
        (loginEntry) => loginEntry.id === loginEntryToModifyId,
    );
    if (loginEntryIndex === -1) throw new AppError('ENTRY_NOT_FOUND');
    newDataBase[loginEntryIndex] = { ...newLoginEntry, id: loginEntryToModifyId };

    dataBase = newDataBase;
    return removePasswordFromEntry(newDataBase[loginEntryIndex]);
}

export async function deleteLoginEntry(loginEntryId: string): Promise<void> {
    getLoginEntryByIdOrThrow(loginEntryId);
    dataBase = dataBase.filter((loginEntry) => loginEntry.id !== loginEntryId);
}

export async function duplicateLoginEntry(loginEntryId: string): Promise<LoginEntry> {
    const retrievedLoginEntry = getLoginEntryByIdOrThrow(loginEntryId);
    const { id: _id, ...dupLoginEntryWithoutId } = retrievedLoginEntry;
    const dupLoginEntry = {
        ...createNewLoginEntry(dupLoginEntryWithoutId),
        name: `${dupLoginEntryWithoutId.name} (copie)`,
    };
    const insertIndex = dataBase.findIndex((loginEntry) => loginEntryId === loginEntry.id) + 1;
    const newDataBase = [...dataBase];
    newDataBase.splice(insertIndex, 0, dupLoginEntry);
    dataBase = newDataBase;
    return removePasswordFromEntry(dupLoginEntry);
}

export async function getPassword(loginEntryId: string): Promise<string> {
    const retrievedLoginEntry = getLoginEntryByIdOrThrow(loginEntryId);
    return retrievedLoginEntry.password;
}
