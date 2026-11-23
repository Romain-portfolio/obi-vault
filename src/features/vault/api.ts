import { AppError } from '../errors/errors';

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export async function unlockVault(password: string) {
    await wait(600);
    if (password !== 'test') throw new AppError('WRONG_PASSWORD');
}

export async function lockVault() {
    await wait(600);
}

export async function createVault(password: string) {
    void password; // TODO backend : remplacer par invoke('create_vault', { password })
    await wait(600);
}

export async function isVaultCreated() {
    return false;
}
