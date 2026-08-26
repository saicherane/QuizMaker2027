import type { D1Database } from "@cloudflare/workers-types";

import {
	type CreateSessionInput,
	mapSessionRow,
	type Session,
	type SessionRow,
} from "@/lib/types/user";

export async function createSession(db: D1Database, input: CreateSessionInput): Promise<Session> {
	const { results } = await db
		.prepare(
			`INSERT INTO sessions (user_id, expires_at)
       VALUES (?1, ?2)
       RETURNING *`,
		)
		.bind(input.userId, input.expiresAt)
		.all<SessionRow>();

	const row = results[0];
	if (!row) {
		throw new Error("Failed to create session");
	}

	return mapSessionRow(row);
}

export async function findById(db: D1Database, sessionId: string): Promise<Session | null> {
	const { results } = await db
		.prepare("SELECT * FROM sessions WHERE session_id = ?1")
		.bind(sessionId)
		.all<SessionRow>();

	const row = results[0];
	return row ? mapSessionRow(row) : null;
}

export async function deleteSession(db: D1Database, sessionId: string): Promise<boolean> {
	const result = await db
		.prepare("DELETE FROM sessions WHERE session_id = ?1")
		.bind(sessionId)
		.run();

	return (result.meta?.changes ?? 0) > 0;
}

export async function deleteSessionsForUser(db: D1Database, userId: string): Promise<number> {
	const result = await db
		.prepare("DELETE FROM sessions WHERE user_id = ?1")
		.bind(userId)
		.run();

	return result.meta?.changes ?? 0;
}

export async function deleteExpiredSessions(db: D1Database, nowIso: string): Promise<number> {
	const result = await db
		.prepare("DELETE FROM sessions WHERE expires_at < ?1")
		.bind(nowIso)
		.run();

	return result.meta?.changes ?? 0;
}
