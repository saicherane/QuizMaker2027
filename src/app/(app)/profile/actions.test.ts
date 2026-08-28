import { beforeEach, describe, expect, it, vi } from "vitest";

import { deleteAccount, updateProfile } from "@/app/(app)/profile/actions";
import { AppError } from "@/lib/errors/app-error";
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

vi.mock("@/lib/auth/get-current-user", () => ({
	getCurrentUser: vi.fn(),
}));

vi.mock("@opennextjs/cloudflare", () => ({
	getCloudflareContext: vi.fn(async () => ({ env: { DB: createMockD1() } })),
}));

vi.mock("@/lib/services/user-service");

import { getCurrentUser } from "@/lib/auth/get-current-user";

const authenticatedUser = {
	userId: "user-001",
	username: "jdoe",
	emailId: "jane@school.edu",
	createdAt: "2026-08-26T10:00:00Z",
	updatedAt: "2026-08-26T10:00:00Z",
};

describe("profile actions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("updateProfile returns auth error when unauthenticated", async () => {
		vi.mocked(getCurrentUser).mockResolvedValue(null);

		const result = await updateProfile(new FormData());

		expect(result).toEqual({ error: "Not authenticated" });
	});

	it("updateProfile updates profile fields for authenticated user", async () => {
		vi.mocked(getCurrentUser).mockResolvedValue(authenticatedUser);
		vi.mocked(userService.updateUser).mockResolvedValue({
			...authenticatedUser,
			username: "janedoe",
		});

		const formData = new FormData();
		formData.set("username", "janedoe");

		const result = await updateProfile(formData);

		expect(result).toEqual({ success: true });
		expect(userService.updateUser).toHaveBeenCalledWith(expect.anything(), "user-001", {
			username: "janedoe",
		});
	});

	it("updateProfile returns validation errors", async () => {
		vi.mocked(getCurrentUser).mockResolvedValue(authenticatedUser);

		const formData = new FormData();
		formData.set("newPassword", "Password2");
		formData.set("confirmPassword", "Password2");

		const result = await updateProfile(formData);

		expect(result).toHaveProperty("errors");
		expect(userService.updateUser).not.toHaveBeenCalled();
	});

	it("deleteAccount returns error for wrong password", async () => {
		vi.mocked(getCurrentUser).mockResolvedValue(authenticatedUser);
		vi.mocked(userService.deleteUser).mockRejectedValue(
			new AppError("UNAUTHORIZED", "Password is incorrect"),
		);

		const formData = new FormData();
		formData.set("password", "WrongPassword1");
		formData.set("confirmDelete", "DELETE");

		const result = await deleteAccount(formData);

		expect(result).toEqual({ error: "Password is incorrect" });
		expect(clearSessionCookie).not.toHaveBeenCalled();
	});

	it("deleteAccount deletes user, clears session, and redirects", async () => {
		vi.mocked(getCurrentUser).mockResolvedValue(authenticatedUser);
		getSessionCookie.mockResolvedValue("session-001");
		vi.mocked(userService.deleteUser).mockResolvedValue(undefined);

		const formData = new FormData();
		formData.set("password", "Password1");
		formData.set("confirmDelete", "DELETE");

		await expect(deleteAccount(formData)).rejects.toThrow("NEXT_REDIRECT:/login");
		expect(userService.deleteUser).toHaveBeenCalledWith(
			expect.anything(),
			"user-001",
			"Password1",
		);
		expect(userService.logout).toHaveBeenCalledWith(expect.anything(), "session-001");
		expect(clearSessionCookie).toHaveBeenCalledOnce();
	});
});
