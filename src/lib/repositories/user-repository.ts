import type { D1Database } from "@cloudflare/workers-types";

import {
	type CreateUserInput,
	mapUserRow,
	type UpdateUserInput,
	type User,
	type UserRow,
} from "@/lib/types/user";

export async function createUser(db: D1Database, input: CreateUserInput): Promise<User> {
	const { results } = await db
		.prepare(
			`INSERT INTO users (username, email_id, password_hash, password_salt)
       VALUES (?1, ?2, ?3, ?4)
       RETURNING *`,
		)
		.bind(input.username, input.emailId, input.passwordHash, input.passwordSalt)
		.all<UserRow>();

	const row = results[0];
	if (!row) {
		throw new Error("Failed to create user");
	}

	return mapUserRow(row);
}

export async function findByEmailId(db: D1Database, emailId: string): Promise<User | null> {
	const { results } = await db
		.prepare("SELECT * FROM users WHERE email_id = ?1 COLLATE NOCASE")
		.bind(emailId)
		.all<UserRow>();

	const row = results[0];
	return row ? mapUserRow(row) : null;
}

export async function findById(db: D1Database, userId: string): Promise<User | null> {
	const { results } = await db
		.prepare("SELECT * FROM users WHERE user_id = ?1")
		.bind(userId)
		.all<UserRow>();

	const row = results[0];
	return row ? mapUserRow(row) : null;
}

export async function findByUsername(db: D1Database, username: string): Promise<User | null> {
	const { results } = await db
		.prepare("SELECT * FROM users WHERE username = ?1 COLLATE NOCASE")
		.bind(username)
		.all<UserRow>();

	const row = results[0];
	return row ? mapUserRow(row) : null;
}

export async function updateUser(
	db: D1Database,
	userId: string,
	input: UpdateUserInput,
): Promise<User | null> {
	const { results } = await db
		.prepare(
			`UPDATE users
       SET username = COALESCE(?2, username),
           email_id = COALESCE(?3, email_id),
           password_hash = COALESCE(?4, password_hash),
           password_salt = COALESCE(?5, password_salt),
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = ?1
       RETURNING *`,
		)
		.bind(
			userId,
			input.username ?? null,
			input.emailId ?? null,
			input.passwordHash ?? null,
			input.passwordSalt ?? null,
		)
		.all<UserRow>();

	const row = results[0];
	return row ? mapUserRow(row) : null;
}

export async function deleteUser(db: D1Database, userId: string): Promise<boolean> {
	const result = await db.prepare("DELETE FROM users WHERE user_id = ?1").bind(userId).run();

	return (result.meta?.changes ?? 0) > 0;
}
