import crypto from 'crypto';

/**
 * Creates HMAC SHA-256 hash of a value using a salt
 * @param value - Value to hash
 * @param salt - Salt for HMAC
 * @returns Buffer with hash bytes
 */
function hmacSha256Bytes(value: string, salt: string) {
	return crypto.createHmac('sha256', salt).update(value, 'utf-8').digest();
}

/**
 * Converts a buffer to base64url encoded string
 * @param buf - Buffer or Uint8Array to encode
 * @returns Base64url encoded string
 */
function toB64Url(buf: Uint8Array | Buffer) {
	return Buffer.from(buf).toString('base64url');
}

export { hmacSha256Bytes, toB64Url };
