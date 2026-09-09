import { beforeEach, describe, expect, it } from "vitest";

import * as mcqRepository from "@/lib/repositories/mcq-repository";
import { createMcqInputFixture, mcqRowFixture } from "@/test/fixtures/mcqs";
import { createMockD1, type MockD1Call, sqlMatches } from "@/test/mock-d1";

describe("mcq-repository", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("createMcq inserts with bound params and returns mapped MCQ", async () => {
		const db = createMockD1({
			onQuery: (call: MockD1Call) => {
				expect(call.method).toBe("all");
				expect(call.sql).toContain("INSERT INTO mcqs");
				expect(call.bindings).toEqual([
					createMcqInputFixture.name,
					createMcqInputFixture.question,
					createMcqInputFixture.createdBy,
				]);
				return { results: [mcqRowFixture] };
			},
		});

		const mcq = await mcqRepository.createMcq(db, createMcqInputFixture);

		expect(mcq.mcqId).toBe(mcqRowFixture.mcq_id);
		expect(mcq.name).toBe(mcqRowFixture.name);
		expect(mcq.question).toBe(mcqRowFixture.question);
		expect(mcq.createdBy).toBe(mcqRowFixture.created_by);
	});

	it("findById returns MCQ when row exists", async () => {
		const db = createMockD1({
			onQuery: (call: MockD1Call) => {
				expect(call.sql).toContain("mcq_id = ?1");
				expect(call.bindings).toEqual(["mcq-001"]);
				return { results: [mcqRowFixture] };
			},
		});

		const mcq = await mcqRepository.findById(db, "mcq-001");

		expect(mcq?.mcqId).toBe("mcq-001");
		expect(mcq?.question).toBe(mcqRowFixture.question);
	});

	it("findById returns null when row missing", async () => {
		const db = createMockD1({
			onQuery: () => ({ results: [] }),
		});

		const mcq = await mcqRepository.findById(db, "missing-id");

		expect(mcq).toBeNull();
	});

	it("listMcqs returns all rows ordered by updated_at DESC", async () => {
		const db = createMockD1({
			onQuery: (call: MockD1Call) => {
				expect(call.sql).toContain("ORDER BY updated_at DESC");
				return { results: [mcqRowFixture] };
			},
		});

		const mcqs = await mcqRepository.listMcqs(db);

		expect(mcqs).toHaveLength(1);
		expect(mcqs[0].mcqId).toBe("mcq-001");
	});

	it("listMcqsByUser filters by created_by", async () => {
		const db = createMockD1({
			onQuery: (call: MockD1Call) => {
				expect(call.sql).toContain("created_by = ?1");
				expect(call.bindings).toEqual(["user-001"]);
				return { results: [mcqRowFixture] };
			},
		});

		const mcqs = await mcqRepository.listMcqsByUser(db, "user-001");

		expect(mcqs).toHaveLength(1);
		expect(mcqs[0].createdBy).toBe("user-001");
	});

	it("updateMcq updates name and question with bound params", async () => {
		const updatedRow = {
			...mcqRowFixture,
			name: "Updated name",
			question: "Updated question?",
		};

		const db = createMockD1({
			onQuery: (call: MockD1Call) => {
				expect(sqlMatches(/UPDATE mcqs/, call.sql)).toBe(true);
				expect(call.bindings).toEqual(["mcq-001", "Updated name", "Updated question?"]);
				return { results: [updatedRow] };
			},
		});

		const mcq = await mcqRepository.updateMcq(db, "mcq-001", {
			name: "Updated name",
			question: "Updated question?",
		});

		expect(mcq?.name).toBe("Updated name");
		expect(mcq?.question).toBe("Updated question?");
	});

	it("deleteMcq returns true when row deleted", async () => {
		const db = createMockD1({
			onQuery: (call: MockD1Call) => {
				expect(call.method).toBe("run");
				expect(call.sql).toContain("DELETE FROM mcqs WHERE mcq_id = ?1");
				expect(call.bindings).toEqual(["mcq-001"]);
				return { success: true, meta: { changes: 1 } };
			},
		});

		const deleted = await mcqRepository.deleteMcq(db, "mcq-001");

		expect(deleted).toBe(true);
	});
});
