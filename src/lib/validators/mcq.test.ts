import { describe, expect, it } from "vitest";

import { mcqFormSchema } from "@/lib/validators/mcq";

const validMcqForm = {
	name: "Photosynthesis basics",
	question: "Which process do plants use to convert light energy?",
	choices: [
		{ label: "Respiration", isCorrect: false },
		{ label: "Photosynthesis", isCorrect: true },
	],
};

describe("mcq validators", () => {
	it("mcqFormSchema parses valid MCQ with 2 choices and one correct", () => {
		const result = mcqFormSchema.safeParse(validMcqForm);

		expect(result.success).toBe(true);
	});

	it("mcqFormSchema fails with only 1 choice", () => {
		const result = mcqFormSchema.safeParse({
			...validMcqForm,
			choices: [{ label: "Only choice", isCorrect: true }],
		});

		expect(result.success).toBe(false);
	});

	it("mcqFormSchema fails with 7 choices", () => {
		const result = mcqFormSchema.safeParse({
			...validMcqForm,
			choices: [
				{ label: "A", isCorrect: true },
				{ label: "B", isCorrect: false },
				{ label: "C", isCorrect: false },
				{ label: "D", isCorrect: false },
				{ label: "E", isCorrect: false },
				{ label: "F", isCorrect: false },
				{ label: "G", isCorrect: false },
			],
		});

		expect(result.success).toBe(false);
	});

	it("mcqFormSchema fails when no choice is marked correct", () => {
		const result = mcqFormSchema.safeParse({
			...validMcqForm,
			choices: [
				{ label: "Respiration", isCorrect: false },
				{ label: "Photosynthesis", isCorrect: false },
			],
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.flatten().fieldErrors.choices).toBeDefined();
		}
	});

	it("mcqFormSchema fails when two choices are marked correct", () => {
		const result = mcqFormSchema.safeParse({
			...validMcqForm,
			choices: [
				{ label: "Respiration", isCorrect: true },
				{ label: "Photosynthesis", isCorrect: true },
			],
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.flatten().fieldErrors.choices).toBeDefined();
		}
	});

	it("mcqFormSchema fails for empty choice label", () => {
		const result = mcqFormSchema.safeParse({
			...validMcqForm,
			choices: [
				{ label: "", isCorrect: false },
				{ label: "Photosynthesis", isCorrect: true },
			],
		});

		expect(result.success).toBe(false);
	});
});
