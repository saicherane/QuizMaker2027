import { beforeEach, describe, expect, it, vi } from "vitest";

import * as attemptRepository from "@/lib/repositories/attempt-repository";
import * as choiceRepository from "@/lib/repositories/choice-repository";
import * as mcqRepository from "@/lib/repositories/mcq-repository";
import * as mcqService from "@/lib/services/mcq-service";
import type { Choice, Mcq } from "@/lib/types/mcq";
import { createMockD1 } from "@/test/mock-d1";

vi.mock("@/lib/repositories/mcq-repository");
vi.mock("@/lib/repositories/choice-repository");
vi.mock("@/lib/repositories/attempt-repository");

const db = createMockD1();

const mcqFixture: Mcq = {
	mcqId: "mcq-001",
	name: "Photosynthesis basics",
	question: "Which process do plants use to convert light energy?",
	createdBy: "user-001",
	createdAt: "2026-09-08T10:00:00Z",
	updatedAt: "2026-09-08T10:00:00Z",
};

const choicesFixture: Choice[] = [
	{
		choiceId: "choice-001",
		mcqId: "mcq-001",
		label: "Respiration",
		isCorrect: false,
		sortOrder: 0,
		createdAt: "2026-09-08T10:00:00Z",
		updatedAt: "2026-09-08T10:00:00Z",
	},
	{
		choiceId: "choice-002",
		mcqId: "mcq-001",
		label: "Photosynthesis",
		isCorrect: true,
		sortOrder: 1,
		createdAt: "2026-09-08T10:00:00Z",
		updatedAt: "2026-09-08T10:00:00Z",
	},
];

const validFormInput = {
	name: "Photosynthesis basics",
	question: "Which process do plants use to convert light energy?",
	choices: [
		{ label: "Respiration", isCorrect: false },
		{ label: "Photosynthesis", isCorrect: true },
	],
};

describe("mcq-service", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("createMcq creates MCQ and choices and returns McqWithChoices", async () => {
		vi.mocked(mcqRepository.createMcq).mockResolvedValue(mcqFixture);
		vi.mocked(choiceRepository.createChoices).mockResolvedValue(choicesFixture);

		const result = await mcqService.createMcq(db, "user-001", validFormInput);

		expect(mcqRepository.createMcq).toHaveBeenCalledWith(db, {
			name: validFormInput.name,
			question: validFormInput.question,
			createdBy: "user-001",
		});
		expect(choiceRepository.createChoices).toHaveBeenCalledWith(db, "mcq-001", [
			{ label: "Respiration", isCorrect: false, sortOrder: 0 },
			{ label: "Photosynthesis", isCorrect: true, sortOrder: 1 },
		]);
		expect(result.choices).toHaveLength(2);
		expect(result.mcqId).toBe("mcq-001");
	});

	it("createMcq throws VALIDATION for invalid choice count", async () => {
		await expect(
			mcqService.createMcq(db, "user-001", {
				...validFormInput,
				choices: [{ label: "Only one", isCorrect: true }],
			}),
		).rejects.toMatchObject({ code: "VALIDATION" });

		expect(mcqRepository.createMcq).not.toHaveBeenCalled();
	});

	it("createMcq throws VALIDATION when not exactly one correct choice", async () => {
		await expect(
			mcqService.createMcq(db, "user-001", {
				...validFormInput,
				choices: [
					{ label: "A", isCorrect: true },
					{ label: "B", isCorrect: true },
				],
			}),
		).rejects.toMatchObject({ code: "VALIDATION" });

		expect(mcqRepository.createMcq).not.toHaveBeenCalled();
	});

	it("getMcqWithChoices returns MCQ with ordered choices", async () => {
		vi.mocked(mcqRepository.findById).mockResolvedValue(mcqFixture);
		vi.mocked(choiceRepository.findByMcqId).mockResolvedValue(choicesFixture);

		const result = await mcqService.getMcqWithChoices(db, "mcq-001");

		expect(result.mcqId).toBe("mcq-001");
		expect(result.choices).toEqual(choicesFixture);
	});

	it("getMcqWithChoices throws NOT_FOUND when MCQ missing", async () => {
		vi.mocked(mcqRepository.findById).mockResolvedValue(null);

		await expect(mcqService.getMcqWithChoices(db, "missing")).rejects.toMatchObject({
			code: "NOT_FOUND",
		});
	});

	it("listMcqs returns summary list", async () => {
		vi.mocked(mcqRepository.listMcqs).mockResolvedValue([mcqFixture]);

		const result = await mcqService.listMcqs(db);

		expect(result).toEqual([mcqFixture]);
	});

	it("updateMcq as owner updates MCQ and replaces choices", async () => {
		vi.mocked(mcqRepository.findById).mockResolvedValue(mcqFixture);
		vi.mocked(mcqRepository.updateMcq).mockResolvedValue({
			...mcqFixture,
			name: "Updated name",
		});
		vi.mocked(choiceRepository.replaceChoicesForMcq).mockResolvedValue(choicesFixture);

		const result = await mcqService.updateMcq(db, "mcq-001", "user-001", {
			...validFormInput,
			name: "Updated name",
		});

		expect(mcqRepository.updateMcq).toHaveBeenCalledWith(db, "mcq-001", {
			name: "Updated name",
			question: validFormInput.question,
		});
		expect(choiceRepository.replaceChoicesForMcq).toHaveBeenCalledOnce();
		expect(result.name).toBe("Updated name");
	});

	it("updateMcq as non-owner throws FORBIDDEN", async () => {
		vi.mocked(mcqRepository.findById).mockResolvedValue(mcqFixture);

		await expect(
			mcqService.updateMcq(db, "mcq-001", "user-999", validFormInput),
		).rejects.toMatchObject({ code: "FORBIDDEN" });

		expect(mcqRepository.updateMcq).not.toHaveBeenCalled();
	});

	it("deleteMcq as owner deletes MCQ", async () => {
		vi.mocked(mcqRepository.findById).mockResolvedValue(mcqFixture);
		vi.mocked(mcqRepository.deleteMcq).mockResolvedValue(true);

		await mcqService.deleteMcq(db, "mcq-001", "user-001");

		expect(mcqRepository.deleteMcq).toHaveBeenCalledWith(db, "mcq-001");
	});

	it("deleteMcq as non-owner throws FORBIDDEN", async () => {
		vi.mocked(mcqRepository.findById).mockResolvedValue(mcqFixture);

		await expect(mcqService.deleteMcq(db, "mcq-001", "user-999")).rejects.toMatchObject({
			code: "FORBIDDEN",
		});

		expect(mcqRepository.deleteMcq).not.toHaveBeenCalled();
	});

	it("recordAttempt persists correct result when choice is correct", async () => {
		vi.mocked(mcqRepository.findById).mockResolvedValue(mcqFixture);
		vi.mocked(choiceRepository.findByMcqId).mockResolvedValue(choicesFixture);
		vi.mocked(attemptRepository.createAttempt).mockResolvedValue({
			attemptId: "attempt-001",
			userId: "user-001",
			mcqId: "mcq-001",
			choiceId: "choice-002",
			isCorrect: true,
			attemptedAt: "2026-09-08T11:00:00Z",
		});

		const result = await mcqService.recordAttempt(db, "user-001", "mcq-001", "choice-002");

		expect(attemptRepository.createAttempt).toHaveBeenCalledWith(db, {
			userId: "user-001",
			mcqId: "mcq-001",
			choiceId: "choice-002",
			isCorrect: true,
		});
		expect(result.isCorrect).toBe(true);
	});

	it("recordAttempt persists incorrect result when choice is wrong", async () => {
		vi.mocked(mcqRepository.findById).mockResolvedValue(mcqFixture);
		vi.mocked(choiceRepository.findByMcqId).mockResolvedValue(choicesFixture);
		vi.mocked(attemptRepository.createAttempt).mockResolvedValue({
			attemptId: "attempt-002",
			userId: "user-001",
			mcqId: "mcq-001",
			choiceId: "choice-001",
			isCorrect: false,
			attemptedAt: "2026-09-08T11:00:00Z",
		});

		const result = await mcqService.recordAttempt(db, "user-001", "mcq-001", "choice-001");

		expect(attemptRepository.createAttempt).toHaveBeenCalledWith(db, {
			userId: "user-001",
			mcqId: "mcq-001",
			choiceId: "choice-001",
			isCorrect: false,
		});
		expect(result.isCorrect).toBe(false);
	});

	it("recordAttempt throws VALIDATION when choice does not belong to MCQ", async () => {
		vi.mocked(mcqRepository.findById).mockResolvedValue(mcqFixture);
		vi.mocked(choiceRepository.findByMcqId).mockResolvedValue(choicesFixture);

		await expect(
			mcqService.recordAttempt(db, "user-001", "mcq-001", "choice-999"),
		).rejects.toMatchObject({ code: "VALIDATION" });

		expect(attemptRepository.createAttempt).not.toHaveBeenCalled();
	});
});
