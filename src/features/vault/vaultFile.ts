import { type Argon2Settings } from './crypto/kdf';
import { base64ToBytes, bytesToBase64, textToBytes, bytesToText } from './crypto/encoding';
import { decrypt, encrypt, generateNonce } from './crypto/cipher';
import { type LoginEntryWithPassword } from './types';
import { AppError } from '../errors/errors';

type KdfSection = {
    algorithm: 'argon2id';
    settings: Argon2Settings;
    salt: string;
};

type CipherSection = {
    algorithm: 'AES-GCM';
    nonce: string;
};

export type VaultFile = {
    version: number;
    kdf: KdfSection;
    cipher: CipherSection;
    encryptedData: string;
};

export type VaultContent = {
    loginEntries: LoginEntryWithPassword[];
};

const VAULT_FORMAT_VERSION = 1;

function headerToBytes(vaultFile: VaultFile) {
    const kdf = vaultFile.kdf;
    const cipher = vaultFile.cipher;
    const headerText = JSON.stringify({
        version: vaultFile.version,
        kdf: {
            algorithm: kdf.algorithm,
            settings: {
                parallelism: kdf.settings.parallelism,
                iterations: kdf.settings.iterations,
                memorySize: kdf.settings.memorySize,
            },
            salt: kdf.salt,
        },
        cipher: {
            algorithm: cipher.algorithm,
            nonce: cipher.nonce,
        },
    });
    return textToBytes(headerText);
}

export async function encryptVault(
    vaultContent: VaultContent,
    key: CryptoKey,
    salt: Uint8Array<ArrayBuffer>,
    argon2Settings: Argon2Settings,
) {
    const nonce = generateNonce();
    const contentText = JSON.stringify(vaultContent);
    const contentBytes = textToBytes(contentText);
    const vaultFile: VaultFile = {
        version: VAULT_FORMAT_VERSION,
        kdf: {
            algorithm: 'argon2id',
            settings: argon2Settings,
            salt: bytesToBase64(salt),
        },
        cipher: {
            algorithm: 'AES-GCM',
            nonce: bytesToBase64(nonce),
        },
        encryptedData: '',
    };
    const encryptedData = await encrypt(contentBytes, key, nonce, headerToBytes(vaultFile));
    vaultFile.encryptedData = bytesToBase64(encryptedData);
    return vaultFile;
}

export async function decryptVault(vaultFile: VaultFile, key: CryptoKey) {
    if (vaultFile.version !== VAULT_FORMAT_VERSION) {
        throw new AppError('UNSUPPORTED_VAULT_VERSION');
    }
    if (vaultFile.kdf.algorithm !== 'argon2id' || vaultFile.cipher.algorithm !== 'AES-GCM') {
        throw new AppError('UNSUPPORTED_ALGORITHM');
    }

    const encryptedData = base64ToBytes(vaultFile.encryptedData);
    const nonce = base64ToBytes(vaultFile.cipher.nonce);
    const additionalData = headerToBytes(vaultFile);
    let contentBytes: Uint8Array<ArrayBuffer>;
    try {
        contentBytes = await decrypt(encryptedData, key, nonce, additionalData);
    } catch {
        throw new AppError('WRONG_PASSWORD');
    }
    const contentText = bytesToText(contentBytes);
    const vaultContent: VaultContent = JSON.parse(contentText);
    return vaultContent;
}
