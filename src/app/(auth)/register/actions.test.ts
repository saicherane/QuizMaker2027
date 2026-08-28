import { beforeEach, describe, expect, it, vi } from "vitest";

import { registerUser } from "@/app/(auth)/register/actions";
import { AppError } from "@/lib/errors/app-error";
import * as userService from "@/lib/services/user-service";
import { createMockD1 } from "@/test/mock-d1";

vi.mock("server-only", () => ({}));

const redirect = vi.fn((url: string): never => {
	throw new Error(`NEXT_REDIRECT:${url}`);
});

vi.mock("next/navigation", () => ({
	redirect: (url: string) => redirect(url),
}));

vi.mock("@opennextjs/cloudflare", () => ({
	getCloudflareContext: vi.fn(async () => ({ env: { DB: createMockD1() } })),
}));

vi.mock("@/lib/services/user-service");

function createRegisterFormData(overrides: Record<string, string> = {}) {
	const formData = new FormData();
	formData.set("username", overrides.username ?? "jdoe");
	formData.set("emailId", overrides.emailId ?? "jane@school.edu");
	formData.set("password", overrides.password ?? "Password1");
	formData.set("confirmPassword", overrides.confirmPassword ?? "Password1");
	return formData;
}

describe("registerUser", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns validation errors for invalid form data", async () => {
		const formData = createRegisterFormData({ password: "short", confirmPassword: "short" });

		const result = await registerUser(formData);

		expect(result).toHaveProperty("errors");
		expect(userService.register).not.toHaveBeenCalled();
	});

	it("registers user and redirects to login on success", async () => {
		vi.mocked(userService.register).mockResolvedValue({
			userId: "user-001",
			username: "jdoe",
			emailId: "jane@school.edu",
			createdAt: "2026-08-26T10:00:00Z",
			updatedAt: "2026-08-26T10:00:00Z",
		});

		await expect(registerUser(createRegisterFormData())).rejects.toThrow(
			"NEXT_REDIRECT:/login?registered=1",
		);
		expect(userService.register).toHaveBeenCalledOnce();
		expect(redirect).toHaveBeenCalledWith("/login?registered=1");
	});

	it("returns conflict error without redirecting", async () => {
		vi.mocked(userService.register).mockRejectedValue(
			new AppError("CONFLICT", "Email already registered"),
		);

		const result = await registerUser(createRegisterFormData());

		expect(result).toEqual({ error: "Email already registered" });
		expect(redirect).not.toHaveBeenCalled();
	});
});
