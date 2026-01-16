import crypto from 'crypto';

function hmacSha256Bytes(value: string, salt: string) {
	return crypto.createHmac('sha256', salt).update(value, 'utf-8').digest();
}

function toB64Url(buf: Uint8Array | Buffer) {
	return Buffer.from(buf).toString('base64url');
}

export { hmacSha256Bytes, toB64Url };
