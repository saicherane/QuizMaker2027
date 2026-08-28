import { describe, expect, it } from "vitest";

import {
	deleteUserSchema,
	loginSchema,
	registerSchema,
	updateUserSchema,
} from "@/lib/validators/user";

describe("user validators", () => {
	it("registerSchema parses valid input", () => {
		const result = registerSchema.safeParse({
			username: "jdoe",
			emailId: "jane@school.edu",
			password: "Password1",
			confirmPassword: "Password1",
		});

		expect(result.success).toBe(true);
	});

	it("registerSchema fails when passwords do not match", () => {
		const result = registerSchema.safeParse({
			username: "jdoe",
			emailId: "jane@school.edu",
			password: "Password1",
			confirmPassword: "Password2",
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.flatten().fieldErrors.confirmPassword).toBeDefined();
		}
	});

	it("registerSchema fails for short password", () => {
		const result = registerSchema.safeParse({
			username: "jdoe",
			emailId: "jane@school.edu",
			password: "Pass1",
			confirmPassword: "Pass1",
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.flatten().fieldErrors.password).toBeDefined();
		}
	});

	it("registerSchema fails for invalid email", () => {
		const result = registerSchema.safeParse({
			username: "jdoe",
			emailId: "not-an-email",
			password: "Password1",
			confirmPassword: "Password1",
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.flatten().fieldErrors.emailId).toBeDefined();
		}
	});

	it("registerSchema fails for invalid username characters", () => {
		const result = registerSchema.safeParse({
			username: "jdoe!",
			emailId: "jane@school.edu",
			password: "Password1",
			confirmPassword: "Password1",
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.flatten().fieldErrors.username).toBeDefined();
		}
	});

	it("loginSchema parses valid input", () => {
		const result = loginSchema.safeParse({
			emailId: "jane@school.edu",
			password: "Password1",
		});

		expect(result.success).toBe(true);
	});

	it("loginSchema fails when email is missing", () => {
		const result = loginSchema.safeParse({
			password: "Password1",
		});

		expect(result.success).toBe(false);
	});

	it("updateUserSchema fails when changing password without current password", () => {
		const result = updateUserSchema.safeParse({
			newPassword: "Password2",
			confirmPassword: "Password2",
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.flatten().fieldErrors.currentPassword).toBeDefined();
		}
	});

	it("deleteUserSchema fails without confirmDelete", () => {
		const result = deleteUserSchema.safeParse({
			password: "Password1",
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.flatten().fieldErrors.confirmDelete).toBeDefined();
		}
	});
});
