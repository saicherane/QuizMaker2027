import { beforeEach, describe, expect, it } from "vitest";

import * as attemptRepository from "@/lib/repositories/attempt-repository";
import { attemptRowFixture } from "@/test/fixtures/mcqs";
import { createMockD1, type MockD1Call } from "@/test/mock-d1";

describe("attempt-repository", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("createAttempt inserts with is_correct 0 or 1", async () => {
		const db = createMockD1({
			onQuery: (call: MockD1Call) => {
				expect(call.sql).toContain("INSERT INTO attempts");
				expect(call.bindings).toEqual(["user-001", "mcq-001", "choice-002", 1]);
				return { results: [attemptRowFixture] };
			},
		});

		const attempt = await attemptRepository.createAttempt(db, {
			userId: "user-001",
			mcqId: "mcq-001",
			choiceId: "choice-002",
			isCorrect: true,
		});

		expect(attempt.attemptId).toBe("attempt-001");
		expect(attempt.isCorrect).toBe(true);
	});

	it("findByMcqIdAndUser returns attempts for user and MCQ", async () => {
		const db = createMockD1({
			onQuery: (call: MockD1Call) => {
				expect(call.sql).toContain("mcq_id = ?1 AND user_id = ?2");
				expect(call.bindings).toEqual(["mcq-001", "user-001"]);
				return { results: [attemptRowFixture] };
			},
		});

		const attempts = await attemptRepository.findByMcqIdAndUser(db, "mcq-001", "user-001");

		expect(attempts).toHaveLength(1);
		expect(attempts[0].choiceId).toBe("choice-002");
	});
});
