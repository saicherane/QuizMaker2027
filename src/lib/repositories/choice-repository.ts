import type { D1Database } from "@cloudflare/workers-types";

import {
	type Choice,
	type ChoiceRow,
	type CreateChoiceInput,
	mapChoiceRow,
} from "@/lib/types/mcq";

export async function createChoices(
	db: D1Database,
	mcqId: string,
	choices: CreateChoiceInput[],
): Promise<Choice[]> {
	const created: Choice[] = [];

	for (const choice of choices) {
		const { results } = await db
			.prepare(
				`INSERT INTO choices (mcq_id, label, is_correct, sort_order)
         VALUES (?1, ?2, ?3, ?4)
         RETURNING *`,
			)
			.bind(mcqId, choice.label, choice.isCorrect ? 1 : 0, choice.sortOrder)
			.all<ChoiceRow>();

		const row = results[0];
		if (!row) {
			throw new Error("Failed to create choice");
		}

		created.push(mapChoiceRow(row));
	}

	return created;
}

export async function findByMcqId(db: D1Database, mcqId: string): Promise<Choice[]> {
	const { results } = await db
		.prepare("SELECT * FROM choices WHERE mcq_id = ?1 ORDER BY sort_order ASC")
		.bind(mcqId)
		.all<ChoiceRow>();

	return results.map(mapChoiceRow);
}

export async function deleteByMcqId(db: D1Database, mcqId: string): Promise<void> {
	await db.prepare("DELETE FROM choices WHERE mcq_id = ?1").bind(mcqId).run();
}

export async function replaceChoicesForMcq(
	db: D1Database,
	mcqId: string,
	choices: CreateChoiceInput[],
): Promise<Choice[]> {
	await deleteByMcqId(db, mcqId);
	return createChoices(db, mcqId, choices);
}
