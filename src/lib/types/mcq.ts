export interface McqRow {
	mcq_id: string;
	name: string;
	question: string;
	created_by: string;
	created_at: string;
	updated_at: string;
}

export interface Mcq {
	mcqId: string;
	name: string;
	question: string;
	createdBy: string;
	createdAt: string;
	updatedAt: string;
}

export interface ChoiceRow {
	choice_id: string;
	mcq_id: string;
	label: string;
	is_correct: number;
	sort_order: number;
	created_at: string;
	updated_at: string;
}

export interface Choice {
	choiceId: string;
	mcqId: string;
	label: string;
	isCorrect: boolean;
	sortOrder: number;
	createdAt: string;
	updatedAt: string;
}

export interface AttemptRow {
	attempt_id: string;
	user_id: string;
	mcq_id: string;
	choice_id: string;
	is_correct: number;
	attempted_at: string;
}

export interface Attempt {
	attemptId: string;
	userId: string;
	mcqId: string;
	choiceId: string;
	isCorrect: boolean;
	attemptedAt: string;
}

export interface McqWithChoices extends Mcq {
	choices: Choice[];
}

export interface CreateMcqInput {
	name: string;
	question: string;
	createdBy: string;
}

export interface UpdateMcqInput {
	name?: string;
	question?: string;
}

export interface CreateChoiceInput {
	label: string;
	isCorrect: boolean;
	sortOrder: number;
}

export interface CreateAttemptInput {
	userId: string;
	mcqId: string;
	choiceId: string;
	isCorrect: boolean;
}

export function mapMcqRow(row: McqRow): Mcq {
	return {
		mcqId: row.mcq_id,
		name: row.name,
		question: row.question,
		createdBy: row.created_by,
		createdAt: row.created_at,
		updatedAt: row.updated_at,
	};
}

export function mapChoiceRow(row: ChoiceRow): Choice {
	return {
		choiceId: row.choice_id,
		mcqId: row.mcq_id,
		label: row.label,
		isCorrect: row.is_correct === 1,
		sortOrder: row.sort_order,
		createdAt: row.created_at,
		updatedAt: row.updated_at,
	};
}

export function mapAttemptRow(row: AttemptRow): Attempt {
	return {
		attemptId: row.attempt_id,
		userId: row.user_id,
		mcqId: row.mcq_id,
		choiceId: row.choice_id,
		isCorrect: row.is_correct === 1,
		attemptedAt: row.attempted_at,
	};
}
