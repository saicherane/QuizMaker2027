import { beforeEach, describe, expect, it, vi } from "vitest";

import { hashPassword, generateSalt } from "@/lib/auth/password";
import * as sessionRepository from "@/lib/repositories/session-repository";
import * as userRepository from "@/lib/repositories/user-repository";
import * as userService from "@/lib/services/user-service";
import { toSafeUser, type User } from "@/lib/types/user";
import { createMockD1 } from "@/test/mock-d1";

vi.mock("@/lib/repositories/user-repository");
vi.mock("@/lib/repositories/session-repository");

const db = createMockD1();

function createUser(overrides: Partial<User> = {}): User {
	const salt = generateSalt();
	return {
		userId: "user-001",
		username: "jdoe",
		emailId: "jane@school.edu",
		passwordHash: hashPassword("Password1", salt),
		passwordSalt: salt,
		createdAt: "2026-08-26T10:00:00Z",
		updatedAt: "2026-08-26T10:00:00Z",
		...overrides,
	};
}

describe("user-service", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("register hashes password, creates user, and returns SafeUser", async () => {
		vi.mocked(userRepository.findByEmailId).mockResolvedValue(null);
		vi.mocked(userRepository.findByUsername).mockResolvedValue(null);
		vi.mocked(userRepository.createUser).mockImplementation(async (_db, input) => ({
			userId: "user-001",
			username: input.username,
			emailId: input.emailId,
			passwordHash: input.passwordHash,
			passwordSalt: input.passwordSalt,
			createdAt: "2026-08-26T10:00:00Z",
			updatedAt: "2026-08-26T10:00:00Z",
		}));

		const user = await userService.register(db, {
			username: "jdoe",
			emailId: "jane@school.edu",
			password: "Password1",
		});

		expect(userRepository.createUser).toHaveBeenCalledOnce();
		expect(user).toEqual({
			userId: "user-001",
			username: "jdoe",
			emailId: "jane@school.edu",
			createdAt: "2026-08-26T10:00:00Z",
			updatedAt: "2026-08-26T10:00:00Z",
		});
		expect(user).not.toHaveProperty("passwordHash");
		expect(user).not.toHaveProperty("passwordSalt");
	});

	it("register throws CONFLICT when email already exists", async () => {
		vi.mocked(userRepository.findByEmailId).mockResolvedValue(createUser());

		await expect(
			userService.register(db, {
				username: "newuser",
				emailId: "jane@school.edu",
				password: "Password1",
			}),
		).rejects.toMatchObject({ code: "CONFLICT" });

		expect(userRepository.createUser).not.toHaveBeenCalled();
	});

	it("register throws CONFLICT when username already exists", async () => {
		vi.mocked(userRepository.findByEmailId).mockResolvedValue(null);
		vi.mocked(userRepository.findByUsername).mockResolvedValue(createUser());

		await expect(
			userService.register(db, {
				username: "jdoe",
				emailId: "new@school.edu",
				password: "Password1",
			}),
		).rejects.toMatchObject({ code: "CONFLICT" });

		expect(userRepository.createUser).not.toHaveBeenCalled();
	});

	it("authenticate returns SafeUser for valid credentials", async () => {
		const existingUser = createUser();
		vi.mocked(userRepository.findByEmailId).mockResolvedValue(existingUser);

		const user = await userService.authenticate(db, "jane@school.edu", "Password1");

		expect(user).toEqual(toSafeUser(existingUser));
		expect(user).not.toHaveProperty("passwordHash");
	});

	it("authenticate throws UNAUTHORIZED for unknown email", async () => {
		vi.mocked(userRepository.findByEmailId).mockResolvedValue(null);

		await expect(userService.authenticate(db, "missing@school.edu", "Password1")).rejects.toMatchObject(
			{
				code: "UNAUTHORIZED",
				message: "Invalid email or password",
			},
		);
	});

	it("authenticate throws UNAUTHORIZED for wrong password", async () => {
		vi.mocked(userRepository.findByEmailId).mockResolvedValue(createUser());

		await expect(userService.authenticate(db, "jane@school.edu", "WrongPassword1")).rejects.toMatchObject(
			{
				code: "UNAUTHORIZED",
				message: "Invalid email or password",
			},
		);
	});

	it("getUserById returns SafeUser when user exists", async () => {
		const existingUser = createUser();
		vi.mocked(userRepository.findById).mockResolvedValue(existingUser);

		const user = await userService.getUserById(db, "user-001");

		expect(user).toEqual(toSafeUser(existingUser));
	});

	it("getUserById returns null when user missing", async () => {
		vi.mocked(userRepository.findById).mockResolvedValue(null);

		const user = await userService.getUserById(db, "missing-id");

		expect(user).toBeNull();
	});

	it("updateUser updates username only", async () => {
		const existingUser = createUser();
		const updatedUser = { ...existingUser, username: "janedoe" };
		vi.mocked(userRepository.findById).mockResolvedValue(existingUser);
		vi.mocked(userRepository.updateUser).mockResolvedValue(updatedUser);

		const user = await userService.updateUser(db, "user-001", { username: "janedoe" });

		expect(userRepository.updateUser).toHaveBeenCalledWith(db, "user-001", {
			username: "janedoe",
			emailId: undefined,
			passwordHash: undefined,
			passwordSalt: undefined,
		});
		expect(user.username).toBe("janedoe");
	});

	it("updateUser throws VALIDATION when changing password without current password", async () => {
		vi.mocked(userRepository.findById).mockResolvedValue(createUser());

		await expect(
			userService.updateUser(db, "user-001", { newPassword: "Password2" }),
		).rejects.toMatchObject({ code: "VALIDATION" });
	});

	it("updateUser throws UNAUTHORIZED when current password is wrong", async () => {
		vi.mocked(userRepository.findById).mockResolvedValue(createUser());

		await expect(
			userService.updateUser(db, "user-001", {
				currentPassword: "WrongPassword1",
				newPassword: "Password2",
			}),
		).rejects.toMatchObject({ code: "UNAUTHORIZED" });
	});

	it("updateUser re-hashes password when current password is correct", async () => {
		const existingUser = createUser();
		vi.mocked(userRepository.findById).mockResolvedValue(existingUser);
		vi.mocked(userRepository.updateUser).mockImplementation(async (_db, userId, input) => ({
			...existingUser,
			userId,
			passwordHash: input.passwordHash ?? existingUser.passwordHash,
			passwordSalt: input.passwordSalt ?? existingUser.passwordSalt,
		}));

		await userService.updateUser(db, "user-001", {
			currentPassword: "Password1",
			newPassword: "Password2",
		});

		expect(userRepository.updateUser).toHaveBeenCalledOnce();
		const updateArgs = vi.mocked(userRepository.updateUser).mock.calls[0]?.[2];
		expect(updateArgs?.passwordHash).toBeDefined();
		expect(updateArgs?.passwordSalt).toBeDefined();
		expect(updateArgs?.passwordHash).not.toBe(existingUser.passwordHash);
	});

	it("deleteUser deletes sessions then user with correct password", async () => {
		const existingUser = createUser();
		vi.mocked(userRepository.findById).mockResolvedValue(existingUser);
		vi.mocked(sessionRepository.deleteSessionsForUser).mockResolvedValue(1);
		vi.mocked(userRepository.deleteUser).mockResolvedValue(true);

		await userService.deleteUser(db, "user-001", "Password1");

		expect(sessionRepository.deleteSessionsForUser).toHaveBeenCalledWith(db, "user-001");
		expect(userRepository.deleteUser).toHaveBeenCalledWith(db, "user-001");
	});

	it("deleteUser throws UNAUTHORIZED when password is wrong", async () => {
		vi.mocked(userRepository.findById).mockResolvedValue(createUser());

		await expect(userService.deleteUser(db, "user-001", "WrongPassword1")).rejects.toMatchObject({
			code: "UNAUTHORIZED",
		});

		expect(sessionRepository.deleteSessionsForUser).not.toHaveBeenCalled();
		expect(userRepository.deleteUser).not.toHaveBeenCalled();
	});

	it("logout deletes session by id", async () => {
		vi.mocked(sessionRepository.deleteSession).mockResolvedValue(true);

		await userService.logout(db, "session-001");

		expect(sessionRepository.deleteSession).toHaveBeenCalledWith(db, "session-001");
	});

	it("login authenticates user and creates session", async () => {
		const existingUser = createUser();
		vi.mocked(userRepository.findByEmailId).mockResolvedValue(existingUser);
		vi.mocked(sessionRepository.createSession).mockResolvedValue({
			sessionId: "session-001",
			userId: existingUser.userId,
			expiresAt: "2099-01-01T00:00:00.000Z",
			createdAt: "2026-08-26T10:00:00Z",
		});

		const result = await userService.login(db, "jane@school.edu", "Password1");

		expect(result.user.userId).toBe("user-001");
		expect(result.sessionId).toBe("session-001");
	});
});
