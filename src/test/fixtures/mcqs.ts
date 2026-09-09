import type { AttemptRow, ChoiceRow, McqRow } from "@/lib/types/mcq";

export const mcqRowFixture: McqRow = {
	mcq_id: "mcq-001",
	name: "Photosynthesis basics",
	question: "Which process do plants use to convert light energy?",
	created_by: "user-001",
	created_at: "2026-09-08T10:00:00Z",
	updated_at: "2026-09-08T10:00:00Z",
};

export const choiceRowFixtureA: ChoiceRow = {
	choice_id: "choice-001",
	mcq_id: "mcq-001",
	label: "Respiration",
	is_correct: 0,
	sort_order: 0,
	created_at: "2026-09-08T10:00:00Z",
	updated_at: "2026-09-08T10:00:00Z",
};

export const choiceRowFixtureB: ChoiceRow = {
	choice_id: "choice-002",
	mcq_id: "mcq-001",
	label: "Photosynthesis",
	is_correct: 1,
	sort_order: 1,
	created_at: "2026-09-08T10:00:00Z",
	updated_at: "2026-09-08T10:00:00Z",
};

export const attemptRowFixture: AttemptRow = {
	attempt_id: "attempt-001",
	user_id: "user-001",
	mcq_id: "mcq-001",
	choice_id: "choice-002",
	is_correct: 1,
	attempted_at: "2026-09-08T11:00:00Z",
};

export const createMcqInputFixture = {
	name: "Photosynthesis basics",
	question: "Which process do plants use to convert light energy?",
	createdBy: "user-001",
};

export const createChoiceInputsFixture = [
	{ label: "Respiration", isCorrect: false, sortOrder: 0 },
	{ label: "Photosynthesis", isCorrect: true, sortOrder: 1 },
];
