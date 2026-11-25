import { argon2id } from 'hash-wasm';

export type Argon2Settings = {
    parallelism: number;
    iterations: number;
    memorySize: number;
};

const KEY_LENGTH = 32;
const SALT_LENGTH = 16;
export const DEFAULT_ARGON2_SETTINGS: Argon2Settings = {
    parallelism: 1,
    iterations: 3,
    memorySize: 65536, // en kibioctets soit 64 Mio
};

export function generateSalt() {
    return crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
}

export async function deriveKey(
    password: string,
    salt: Uint8Array<ArrayBuffer>,
    argon2Settings: Argon2Settings,
) {
    // la fonction argon2id de hash-wasm renvoie un type Uint8Array<ArrayBufferLike>
    // mais son retour est toujours de type Uint8Array<ArrayBuffer>, le 'as' est donc sûr
    const keyBytes = (await argon2id({
        password,
        salt,
        hashLength: KEY_LENGTH,
        outputType: 'binary',
        parallelism: argon2Settings.parallelism,
        iterations: argon2Settings.iterations,
        memorySize: argon2Settings.memorySize,
    })) as Uint8Array<ArrayBuffer>;
    try {
        return await crypto.subtle.importKey('raw', keyBytes, 'AES-GCM', false, [
            'encrypt',
            'decrypt',
        ]);
    } finally {
        keyBytes.fill(0);
    }
}
