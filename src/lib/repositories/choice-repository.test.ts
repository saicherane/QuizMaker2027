import { beforeEach, describe, expect, it } from "vitest";

import * as choiceRepository from "@/lib/repositories/choice-repository";
import {
	choiceRowFixtureA,
	choiceRowFixtureB,
	createChoiceInputsFixture,
} from "@/test/fixtures/mcqs";
import { createMockD1, type MockD1Call } from "@/test/mock-d1";

describe("choice-repository", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("createChoices inserts batch with sort_order", async () => {
		let insertCount = 0;

		const db = createMockD1({
			onQuery: (call: MockD1Call) => {
				expect(call.sql).toContain("INSERT INTO choices");
				expect(call.bindings?.[0]).toBe("mcq-001");
				expect(call.bindings?.[3]).toBe(insertCount);
				insertCount += 1;
				return {
					results: [insertCount === 1 ? choiceRowFixtureA : choiceRowFixtureB],
				};
			},
		});

		const choices = await choiceRepository.createChoices(
			db,
			"mcq-001",
			createChoiceInputsFixture,
		);

		expect(choices).toHaveLength(2);
		expect(choices[0].sortOrder).toBe(0);
		expect(choices[1].sortOrder).toBe(1);
		expect(choices[1].isCorrect).toBe(true);
	});

	it("findByMcqId returns choices ordered by sort_order", async () => {
		const db = createMockD1({
			onQuery: (call: MockD1Call) => {
				expect(call.sql).toContain("ORDER BY sort_order ASC");
				expect(call.bindings).toEqual(["mcq-001"]);
				return { results: [choiceRowFixtureA, choiceRowFixtureB] };
			},
		});

		const choices = await choiceRepository.findByMcqId(db, "mcq-001");

		expect(choices).toHaveLength(2);
		expect(choices[0].label).toBe("Respiration");
		expect(choices[1].label).toBe("Photosynthesis");
	});

	it("deleteByMcqId deletes all choices for MCQ", async () => {
		const db = createMockD1({
			onQuery: (call: MockD1Call) => {
				expect(call.method).toBe("run");
				expect(call.sql).toContain("DELETE FROM choices WHERE mcq_id = ?1");
				expect(call.bindings).toEqual(["mcq-001"]);
				return { success: true, meta: { changes: 2 } };
			},
		});

		await choiceRepository.deleteByMcqId(db, "mcq-001");

		expect(db.getCalls()).toHaveLength(1);
	});

	it("replaceChoicesForMcq deletes then inserts choices", async () => {
		const calls: MockD1Call[] = [];

		const db = createMockD1({
			onQuery: (call: MockD1Call) => {
				calls.push(call);
				if (call.sql.includes("DELETE FROM choices")) {
					return { success: true, meta: { changes: 2 } };
				}
				const insertIndex = calls.filter((c) => c.sql.includes("INSERT INTO choices")).length - 1;
				return {
					results: [insertIndex === 0 ? choiceRowFixtureA : choiceRowFixtureB],
				};
			},
		});

		const choices = await choiceRepository.replaceChoicesForMcq(
			db,
			"mcq-001",
			createChoiceInputsFixture,
		);

		expect(calls[0].sql).toContain("DELETE FROM choices");
		expect(calls[1].sql).toContain("INSERT INTO choices");
		expect(choices).toHaveLength(2);
	});
});
