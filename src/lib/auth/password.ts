import { pbkdf2 } from "@noble/hashes/pbkdf2.js";
import { sha256 } from "@noble/hashes/sha2.js";
import { bytesToHex, hexToBytes, randomBytes } from "@noble/hashes/utils.js";

const PBKDF2_ITERATIONS = 100_000;
const PBKDF2_KEY_LENGTH = 32;

export function generateSalt(): string {
	return bytesToHex(randomBytes(16));
}

export function hashPassword(password: string, salt: string): string {
	const hash = pbkdf2(sha256, password, hexToBytes(salt), {
		c: PBKDF2_ITERATIONS,
		dkLen: PBKDF2_KEY_LENGTH,
	});
	return bytesToHex(hash);
}

export function verifyPassword(password: string, salt: string, passwordHash: string): boolean {
	return hashPassword(password, salt) === passwordHash;
}
