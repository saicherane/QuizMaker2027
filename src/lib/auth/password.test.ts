import { describe, expect, it } from "vitest";

import { generateSalt, hashPassword, verifyPassword } from "@/lib/auth/password";

describe("password", () => {
	it("hashPassword produces different hashes for same password with different salts", () => {
		const saltOne = "0123456789abcdef0123456789abcdef";
		const saltTwo = "fedcba9876543210fedcba9876543210";
		const hashOne = hashPassword("Password1", saltOne);
		const hashTwo = hashPassword("Password1", saltTwo);

		expect(hashOne).not.toBe(hashTwo);
	});

	it("hashPassword produces identical hash for same password and salt", () => {
		const salt = "0123456789abcdef0123456789abcdef";
		const hashOne = hashPassword("Password1", salt);
		const hashTwo = hashPassword("Password1", salt);

		expect(hashOne).toBe(hashTwo);
	});

	it("verifyPassword returns true for correct password", () => {
		const salt = generateSalt();
		const passwordHash = hashPassword("Password1", salt);

		expect(verifyPassword("Password1", salt, passwordHash)).toBe(true);
	});

	it("verifyPassword returns false for incorrect password", () => {
		const salt = generateSalt();
		const passwordHash = hashPassword("Password1", salt);

		expect(verifyPassword("WrongPassword1", salt, passwordHash)).toBe(false);
	});

	it("generateSalt returns non-empty unique values", () => {
		const saltOne = generateSalt();
		const saltTwo = generateSalt();

		expect(saltOne.length).toBeGreaterThan(0);
		expect(saltTwo.length).toBeGreaterThan(0);
		expect(saltOne).not.toBe(saltTwo);
	});
});
