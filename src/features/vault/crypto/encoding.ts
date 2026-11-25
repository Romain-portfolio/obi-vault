const decoder = new TextDecoder();
const encoder = new TextEncoder();

export function bytesToBase64(bytes: Uint8Array<ArrayBuffer>) {
    let binaryString = '';

    bytes.forEach((byte) => {
        binaryString += String.fromCharCode(byte);
    });
    return btoa(binaryString);
}

export function base64ToBytes(base64: string) {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

export function textToBytes(text: string) {
    return encoder.encode(text);
}

export function bytesToText(bytes: Uint8Array<ArrayBuffer>) {
    return decoder.decode(bytes);
}
