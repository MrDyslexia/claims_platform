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

export function verifyClaveWithSalt(clave: string, salt: Buffer, expectedHash: Buffer) {
  const saltHexUpper = salt.toString('hex').toUpperCase();
  const data = `${clave}${saltHexUpper}`;
  const digest = sha256Buffer(data);
  return bufferEqual(digest, expectedHash);
}

