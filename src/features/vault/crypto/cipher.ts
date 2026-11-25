const NONCE_LENGTH = 12;

export function generateNonce() {
    return crypto.getRandomValues(new Uint8Array(NONCE_LENGTH));
}

export async function encrypt(
    plainData: Uint8Array<ArrayBuffer>,
    key: CryptoKey,
    nonce: Uint8Array<ArrayBuffer>,
    additionalData: Uint8Array<ArrayBuffer>,
) {
    const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: nonce, additionalData },
        key,
        plainData,
    );
    return new Uint8Array(encrypted);
}

export async function decrypt(
    encryptedData: Uint8Array<ArrayBuffer>,
    key: CryptoKey,
    nonce: Uint8Array<ArrayBuffer>,
    additionalData: Uint8Array<ArrayBuffer>,
) {
    const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: nonce, additionalData },
        key,
        encryptedData,
    );
    return new Uint8Array(decrypted);
}
