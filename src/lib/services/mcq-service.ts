import type { D1Database } from "@cloudflare/workers-types";

import { AppError } from "@/lib/errors/app-error";
import * as attemptRepository from "@/lib/repositories/attempt-repository";
import * as choiceRepository from "@/lib/repositories/choice-repository";
import * as mcqRepository from "@/lib/repositories/mcq-repository";
import type { Choice, Mcq, McqWithChoices } from "@/lib/types/mcq";
import type { McqFormInput } from "@/lib/validators/mcq";

function assertValidChoices(choices: McqFormInput["choices"]): void {
	if (choices.length < 2 || choices.length > 6) {
		throw new AppError("VALIDATION", "MCQ must have between 2 and 6 choices");
	}

	const correctCount = choices.filter((choice) => choice.isCorrect).length;
	if (correctCount !== 1) {
		throw new AppError("VALIDATION", "Exactly one choice must be marked correct");
	}
}

function toCreateChoiceInputs(choices: McqFormInput["choices"]) {
	return choices.map((choice, index) => ({
		label: choice.label,
		isCorrect: choice.isCorrect,
		sortOrder: index,
	}));
}

async function assertOwner(db: D1Database, mcqId: string, userId: string): Promise<Mcq> {
	const mcq = await mcqRepository.findById(db, mcqId);
	if (!mcq) {
		throw new AppError("NOT_FOUND", "MCQ not found");
	}
	if (mcq.createdBy !== userId) {
		throw new AppError("FORBIDDEN", "You do not have permission to modify this MCQ");
	}
	return mcq;
}

export async function createMcq(
	db: D1Database,
	userId: string,
	input: McqFormInput,
): Promise<McqWithChoices> {
	assertValidChoices(input.choices);

	const mcq = await mcqRepository.createMcq(db, {
		name: input.name,
		question: input.question,
		createdBy: userId,
	});

	const choices = await choiceRepository.createChoices(
		db,
		mcq.mcqId,
		toCreateChoiceInputs(input.choices),
	);

	return { ...mcq, choices };
}

export async function getMcqWithChoices(
	db: D1Database,
	mcqId: string,
): Promise<McqWithChoices> {
	const mcq = await mcqRepository.findById(db, mcqId);
	if (!mcq) {
		throw new AppError("NOT_FOUND", "MCQ not found");
	}

	const choices = await choiceRepository.findByMcqId(db, mcqId);
	return { ...mcq, choices };
}

export async function listMcqs(db: D1Database): Promise<Mcq[]> {
	return mcqRepository.listMcqs(db);
}

export async function updateMcq(
	db: D1Database,
	mcqId: string,
	userId: string,
	input: McqFormInput,
): Promise<McqWithChoices> {
	assertValidChoices(input.choices);
	await assertOwner(db, mcqId, userId);

	const mcq = await mcqRepository.updateMcq(db, mcqId, {
		name: input.name,
		question: input.question,
	});

	if (!mcq) {
		throw new AppError("NOT_FOUND", "MCQ not found");
	}

	const choices = await choiceRepository.replaceChoicesForMcq(
		db,
		mcqId,
		toCreateChoiceInputs(input.choices),
	);

	return { ...mcq, choices };
}

export async function deleteMcq(
	db: D1Database,
	mcqId: string,
	userId: string,
): Promise<void> {
	await assertOwner(db, mcqId, userId);

	const deleted = await mcqRepository.deleteMcq(db, mcqId);
	if (!deleted) {
		throw new AppError("NOT_FOUND", "MCQ not found");
	}
}

export async function recordAttempt(
	db: D1Database,
	userId: string,
	mcqId: string,
	choiceId: string,
): Promise<{ isCorrect: boolean }> {
	const mcq = await mcqRepository.findById(db, mcqId);
	if (!mcq) {
		throw new AppError("NOT_FOUND", "MCQ not found");
	}

	const choices = await choiceRepository.findByMcqId(db, mcqId);
	const selectedChoice = choices.find((choice) => choice.choiceId === choiceId);

	if (!selectedChoice) {
		throw new AppError("VALIDATION", "Selected choice does not belong to this MCQ");
	}

	const attempt = await attemptRepository.createAttempt(db, {
		userId,
		mcqId,
		choiceId,
		isCorrect: selectedChoice.isCorrect,
	});

	return { isCorrect: attempt.isCorrect };
}
