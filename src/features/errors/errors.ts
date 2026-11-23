const APP_ERROR_CODES = [
    'WRONG_PASSWORD',
    'ENTRY_NOT_FOUND',
    'VAULT_NOT_FOUND',
    'VAULT_LOCKED',
    'IO_ERROR',
    'UNKNOWN',
] as const;

export type AppErrorCode = (typeof APP_ERROR_CODES)[number];

export class AppError extends Error {
    code: AppErrorCode;

    constructor(code: AppErrorCode) {
        super(code);
        this.name = 'AppError';
        this.code = code;
    }
}
