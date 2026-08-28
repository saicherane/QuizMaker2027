import { beforeEach, describe, expect, it, vi } from "vitest";

import { logoutUser } from "@/lib/actions/auth-actions";
import * as userService from "@/lib/services/user-service";
import { createMockD1 } from "@/test/mock-d1";

vi.mock("server-only", () => ({}));

const redirect = vi.fn((url: string): never => {
	throw new Error(`NEXT_REDIRECT:${url}`);
});

const getSessionCookie = vi.fn();
const clearSessionCookie = vi.fn();

vi.mock("next/navigation", () => ({
	redirect: (url: string) => redirect(url),
}));

vi.mock("@/lib/auth/cookies", () => ({
	getSessionCookie: () => getSessionCookie(),
	clearSessionCookie: () => clearSessionCookie(),
	setSessionCookie: vi.fn(),
}));

vi.mock("@opennextjs/cloudflare", () => ({
	getCloudflareContext: vi.fn(async () => ({ env: { DB: createMockD1() } })),
}));

vi.mock("@/lib/services/user-service");

describe("logoutUser", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("deletes active session, clears cookie, and redirects to login", async () => {
		getSessionCookie.mockResolvedValue("session-001");

		await expect(logoutUser()).rejects.toThrow("NEXT_REDIRECT:/login");
		expect(userService.logout).toHaveBeenCalledWith(expect.anything(), "session-001");
		expect(clearSessionCookie).toHaveBeenCalledOnce();
		expect(redirect).toHaveBeenCalledWith("/login");
	});

	it("clears cookie and redirects even when no session exists", async () => {
		getSessionCookie.mockResolvedValue(undefined);

		await expect(logoutUser()).rejects.toThrow("NEXT_REDIRECT:/login");
		expect(userService.logout).not.toHaveBeenCalled();
		expect(clearSessionCookie).toHaveBeenCalledOnce();
	});
});
