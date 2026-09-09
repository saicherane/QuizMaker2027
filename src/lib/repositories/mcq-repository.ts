import type { D1Database } from "@cloudflare/workers-types";

import {
	type CreateMcqInput,
	mapMcqRow,
	type Mcq,
	type McqRow,
	type UpdateMcqInput,
} from "@/lib/types/mcq";

export async function createMcq(db: D1Database, input: CreateMcqInput): Promise<Mcq> {
	const { results } = await db
		.prepare(
			`INSERT INTO mcqs (name, question, created_by)
       VALUES (?1, ?2, ?3)
       RETURNING *`,
		)
		.bind(input.name, input.question, input.createdBy)
		.all<McqRow>();

	const row = results[0];
	if (!row) {
		throw new Error("Failed to create MCQ");
	}

	return mapMcqRow(row);
}

export async function findById(db: D1Database, mcqId: string): Promise<Mcq | null> {
	const { results } = await db
		.prepare("SELECT * FROM mcqs WHERE mcq_id = ?1")
		.bind(mcqId)
		.all<McqRow>();

	const row = results[0];
	return row ? mapMcqRow(row) : null;
}

export async function listMcqs(db: D1Database): Promise<Mcq[]> {
	const { results } = await db
		.prepare("SELECT * FROM mcqs ORDER BY updated_at DESC")
		.all<McqRow>();

	return results.map(mapMcqRow);
}

export async function listMcqsByUser(db: D1Database, userId: string): Promise<Mcq[]> {
	const { results } = await db
		.prepare("SELECT * FROM mcqs WHERE created_by = ?1 ORDER BY updated_at DESC")
		.bind(userId)
		.all<McqRow>();

	return results.map(mapMcqRow);
}

export async function updateMcq(
	db: D1Database,
	mcqId: string,
	input: UpdateMcqInput,
): Promise<Mcq | null> {
	const { results } = await db
		.prepare(
			`UPDATE mcqs
       SET name = COALESCE(?2, name),
           question = COALESCE(?3, question),
           updated_at = CURRENT_TIMESTAMP
       WHERE mcq_id = ?1
       RETURNING *`,
		)
		.bind(mcqId, input.name ?? null, input.question ?? null)
		.all<McqRow>();

	const row = results[0];
	return row ? mapMcqRow(row) : null;
}

export async function deleteMcq(db: D1Database, mcqId: string): Promise<boolean> {
	const result = await db.prepare("DELETE FROM mcqs WHERE mcq_id = ?1").bind(mcqId).run();

	return (result.meta?.changes ?? 0) > 0;
}
