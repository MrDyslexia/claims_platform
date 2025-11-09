import crypto from 'node:crypto';

export function sha256Hex(input: string) {
    return crypto.createHash('sha256').update(input, 'utf8').digest('hex');
}

export function sha256Buffer(input: string) {
    return crypto.createHash('sha256').update(input, 'utf8').digest();
}

export function bufferEqual(a: Buffer, b: Buffer) {
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
}

export function verifyClaveWithSalt(
    clave: string,
    salt: Buffer,
    expectedHash: Buffer
) {
    const saltHexUpper = salt.toString('hex').toUpperCase();
    const data = `${clave}${saltHexUpper}`;
    const digest = sha256Buffer(data);
    return bufferEqual(digest, expectedHash);
}

// ============================================
// Funciones de encriptación AES-256-GCM
// ============================================

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 12; // 96 bits (recomendado para GCM)

// Obtener la clave maestra desde variable de entorno
function getMasterKey(): Buffer {
    const keyBase64 = process.env.MASTER_KEY_BASE64;
    if (!keyBase64) {
        throw new Error(
            'MASTER_KEY_BASE64 no está configurada en variables de entorno'
        );
    }

    const key = Buffer.from(keyBase64, 'base64');
    if (key.length !== KEY_LENGTH) {
        throw new Error(
            `MASTER_KEY_BASE64 debe ser de ${KEY_LENGTH} bytes (44 caracteres en base64)`
        );
    }

    return key;
}

/**
 * Hash de texto usando SHA256
 * Útil para correo_hash y recovery_code_hash
 */
export function hashText(text: string): string {
    return crypto
        .createHash('sha256')
        .update(text.trim().toLowerCase())
        .digest('hex');
}

/**
 * Encripta un texto usando AES-256-GCM
 * Retorna ciphertext, IV y tag en base64
 */
export function encryptText(plaintext: string): {
    ciphertext: string;
    iv: string;
    tag: string;
} {
    const key = getMasterKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    const encrypted = Buffer.concat([
        cipher.update(plaintext, 'utf8'),
        cipher.final(),
    ]);

    const tag = cipher.getAuthTag();

    return {
        ciphertext: encrypted.toString('base64'),
        iv: iv.toString('base64'),
        tag: tag.toString('base64'),
    };
}

/**
 * Desencripta un texto usando AES-256-GCM
 * Requiere ciphertext, IV y tag en base64
 */
export function decryptText(
    ciphertextB64: string,
    ivB64: string,
    tagB64: string
): string {
    const key = getMasterKey();
    const iv = Buffer.from(ivB64, 'base64');
    const tag = Buffer.from(tagB64, 'base64');
    const encrypted = Buffer.from(ciphertextB64, 'base64');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final(),
    ]);

    return decrypted.toString('utf8');
}

/**
 * Genera un código de recuperación aleatorio
 * Formato: 8-12 caracteres alfanuméricos en mayúsculas
 */
export function generateRecoveryCode(length: number = 10): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Sin caracteres confusos (0,O,1,I)
    let code = '';
    const randomBytes = crypto.randomBytes(length);

    for (let i = 0; i < length; i++) {
        code += chars[randomBytes[i] % chars.length];
    }

    return code;
}
