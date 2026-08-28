import { beforeEach, describe, expect, it, vi } from "vitest";

import { loginUser } from "@/app/(auth)/login/actions";
import { AppError } from "@/lib/errors/app-error";
import * as userService from "@/lib/services/user-service";
import { createMockD1 } from "@/test/mock-d1";

vi.mock("server-only", () => ({}));

const redirect = vi.fn((url: string): never => {
	throw new Error(`NEXT_REDIRECT:${url}`);
});

const setSessionCookie = vi.fn();

vi.mock("next/navigation", () => ({
	redirect: (url: string) => redirect(url),
}));

vi.mock("@/lib/auth/cookies", () => ({
	setSessionCookie: (...args: unknown[]) => setSessionCookie(...args),
	getSessionCookie: vi.fn(),
	clearSessionCookie: vi.fn(),
}));

vi.mock("@opennextjs/cloudflare", () => ({
	getCloudflareContext: vi.fn(async () => ({ env: { DB: createMockD1() } })),
}));

vi.mock("@/lib/services/user-service");

function createLoginFormData(overrides: Record<string, string> = {}) {
	const formData = new FormData();
	formData.set("emailId", overrides.emailId ?? "jane@school.edu");
	formData.set("password", overrides.password ?? "Password1");
	return formData;
}

describe("loginUser", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns validation errors for invalid form data", async () => {
		const formData = createLoginFormData({ emailId: "not-an-email" });

		const result = await loginUser(undefined, formData);

		expect(result).toHaveProperty("errors");
		expect(userService.login).not.toHaveBeenCalled();
	});

	it("creates session cookie and redirects on valid credentials", async () => {
		vi.mocked(userService.login).mockResolvedValue({
			user: {
				userId: "user-001",
				username: "jdoe",
				emailId: "jane@school.edu",
				createdAt: "2026-08-26T10:00:00Z",
				updatedAt: "2026-08-26T10:00:00Z",
			},
			sessionId: "session-001",
		});

		await expect(loginUser(undefined, createLoginFormData())).rejects.toThrow("NEXT_REDIRECT:/");
		expect(setSessionCookie).toHaveBeenCalledWith("session-001");
		expect(redirect).toHaveBeenCalledWith("/");
	});

	it("returns generic error for invalid credentials", async () => {
		vi.mocked(userService.login).mockRejectedValue(
			new AppError("UNAUTHORIZED", "Invalid email or password"),
		);

		const result = await loginUser(undefined, createLoginFormData());

		expect(result).toEqual({ error: "Invalid email or password" });
		expect(setSessionCookie).not.toHaveBeenCalled();
		expect(redirect).not.toHaveBeenCalled();
	});
});
