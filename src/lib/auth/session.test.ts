import { describe, expect, it } from "vitest";

import {
	createSessionExpiry,
	isSessionExpired,
	sessionCookieOptions,
	SESSION_TTL_MS,
} from "@/lib/auth/session";

describe("session", () => {
	it("sessionCookieOptions returns secure cookie defaults", () => {
		const options = sessionCookieOptions(3600);

		expect(options.httpOnly).toBe(true);
		expect(options.sameSite).toBe("lax");
		expect(options.path).toBe("/");
		expect(options.maxAge).toBe(3600);
	});

	it("createSessionExpiry returns date about 7 days in the future", () => {
		const now = Date.parse("2026-08-26T10:00:00.000Z");
		const expiry = createSessionExpiry(now);

		expect(Date.parse(expiry)).toBe(now + SESSION_TTL_MS);
	});

	it("isSessionExpired returns true for past dates", () => {
		expect(isSessionExpired("2026-08-26T09:00:00.000Z", Date.parse("2026-08-26T10:00:00.000Z"))).toBe(
			true,
		);
	});

	it("isSessionExpired returns false for future dates", () => {
		expect(isSessionExpired("2026-08-26T11:00:00.000Z", Date.parse("2026-08-26T10:00:00.000Z"))).toBe(
			false,
		);
	});
});
