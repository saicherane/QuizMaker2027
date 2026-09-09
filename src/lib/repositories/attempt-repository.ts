import type { D1Database } from "@cloudflare/workers-types";

import {
	type Attempt,
	type AttemptRow,
	type CreateAttemptInput,
	mapAttemptRow,
} from "@/lib/types/mcq";

export async function createAttempt(db: D1Database, input: CreateAttemptInput): Promise<Attempt> {
	const { results } = await db
		.prepare(
			`INSERT INTO attempts (user_id, mcq_id, choice_id, is_correct)
       VALUES (?1, ?2, ?3, ?4)
       RETURNING *`,
		)
		.bind(input.userId, input.mcqId, input.choiceId, input.isCorrect ? 1 : 0)
		.all<AttemptRow>();

	const row = results[0];
	if (!row) {
		throw new Error("Failed to create attempt");
	}

	return mapAttemptRow(row);
}

export async function findByMcqIdAndUser(
	db: D1Database,
	mcqId: string,
	userId: string,
): Promise<Attempt[]> {
	const { results } = await db
		.prepare(
			`SELECT * FROM attempts
       WHERE mcq_id = ?1 AND user_id = ?2
       ORDER BY attempted_at DESC`,
		)
		.bind(mcqId, userId)
		.all<AttemptRow>();

	return results.map(mapAttemptRow);
}
