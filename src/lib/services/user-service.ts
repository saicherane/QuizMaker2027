import type { D1Database } from "@cloudflare/workers-types";

import { generateSalt, hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSessionExpiry } from "@/lib/auth/session";
import { AppError } from "@/lib/errors/app-error";
import * as sessionRepository from "@/lib/repositories/session-repository";
import * as userRepository from "@/lib/repositories/user-repository";
import { type SafeUser, toSafeUser, type User } from "@/lib/types/user";
import type { RegisterInput } from "@/lib/validators/user";

const INVALID_CREDENTIALS_MESSAGE = "Invalid email or password";

export interface RegisterServiceInput {
	username: string;
	emailId: string;
	password: string;
}

export interface UpdateUserServiceInput {
	username?: string;
	emailId?: string;
	currentPassword?: string;
	newPassword?: string;
}

export async function register(
	db: D1Database,
	input: RegisterServiceInput,
): Promise<SafeUser> {
	const existingEmail = await userRepository.findByEmailId(db, input.emailId);
	if (existingEmail) {
		throw new AppError("CONFLICT", "Email already registered");
	}

	const existingUsername = await userRepository.findByUsername(db, input.username);
	if (existingUsername) {
		throw new AppError("CONFLICT", "Username already taken");
	}

	const salt = generateSalt();
	const passwordHash = hashPassword(input.password, salt);
	const user = await userRepository.createUser(db, {
		username: input.username,
		emailId: input.emailId,
		passwordHash,
		passwordSalt: salt,
	});

	return toSafeUser(user);
}

export async function authenticate(
	db: D1Database,
	emailId: string,
	password: string,
): Promise<SafeUser> {
	const user = await userRepository.findByEmailId(db, emailId);
	if (!user || !verifyPassword(password, user.passwordSalt, user.passwordHash)) {
		throw new AppError("UNAUTHORIZED", INVALID_CREDENTIALS_MESSAGE);
	}

	return toSafeUser(user);
}

export async function login(
	db: D1Database,
	emailId: string,
	password: string,
): Promise<{ user: SafeUser; sessionId: string }> {
	const user = await authenticate(db, emailId, password);
	const session = await sessionRepository.createSession(db, {
		userId: user.userId,
		expiresAt: createSessionExpiry(),
	});

	return { user, sessionId: session.sessionId };
}

export async function getUserById(db: D1Database, userId: string): Promise<SafeUser | null> {
	const user = await userRepository.findById(db, userId);
	return user ? toSafeUser(user) : null;
}

export async function updateUser(
	db: D1Database,
	userId: string,
	input: UpdateUserServiceInput,
): Promise<SafeUser> {
	const user = await userRepository.findById(db, userId);
	if (!user) {
		throw new AppError("NOT_FOUND", "User not found");
	}

	if (input.newPassword) {
		if (!input.currentPassword) {
			throw new AppError("VALIDATION", "Current password is required to change password");
		}
		if (!verifyPassword(input.currentPassword, user.passwordSalt, user.passwordHash)) {
			throw new AppError("UNAUTHORIZED", "Current password is incorrect");
		}
	}

	const salt = input.newPassword ? generateSalt() : undefined;
	const passwordHash = input.newPassword && salt ? hashPassword(input.newPassword, salt) : undefined;

	const updated = await userRepository.updateUser(db, userId, {
		username: input.username,
		emailId: input.emailId,
		passwordHash,
		passwordSalt: salt,
	});

	if (!updated) {
		throw new AppError("NOT_FOUND", "User not found");
	}

	return toSafeUser(updated);
}

export async function deleteUser(
	db: D1Database,
	userId: string,
	password: string,
): Promise<void> {
	const user = await userRepository.findById(db, userId);
	if (!user) {
		throw new AppError("NOT_FOUND", "User not found");
	}

	if (!verifyPassword(password, user.passwordSalt, user.passwordHash)) {
		throw new AppError("UNAUTHORIZED", "Password is incorrect");
	}

	await sessionRepository.deleteSessionsForUser(db, userId);
	const deleted = await userRepository.deleteUser(db, userId);
	if (!deleted) {
		throw new AppError("NOT_FOUND", "User not found");
	}
}

export async function logout(db: D1Database, sessionId: string): Promise<void> {
	await sessionRepository.deleteSession(db, sessionId);
}
