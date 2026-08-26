import { beforeEach, describe, expect, it } from "vitest";

import * as sessionRepository from "@/lib/repositories/session-repository";
import { sessionRowFixture } from "@/test/fixtures/users";
import { createMockD1, type MockD1Call } from "@/test/mock-d1";

describe("session-repository", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("createSession inserts with bound params and returns mapped session", async () => {
		const db = createMockD1({
			onQuery: (call: MockD1Call) => {
				expect(call.method).toBe("all");
				expect(call.sql).toContain("INSERT INTO sessions");
				expect(call.bindings).toEqual(["user-001", "2026-09-02T10:00:00Z"]);
				return { results: [sessionRowFixture] };
			},
		});

		const session = await sessionRepository.createSession(db, {
			userId: "user-001",
			expiresAt: "2026-09-02T10:00:00Z",
		});

		expect(session.sessionId).toBe(sessionRowFixture.session_id);
		expect(session.userId).toBe(sessionRowFixture.user_id);
		expect(session.expiresAt).toBe(sessionRowFixture.expires_at);
	});

	it("findById returns session when row exists", async () => {
		const db = createMockD1({
			onQuery: (call: MockD1Call) => {
				expect(call.sql).toContain("session_id = ?1");
				expect(call.bindings).toEqual(["session-001"]);
				return { results: [sessionRowFixture] };
			},
		});

		const session = await sessionRepository.findById(db, "session-001");

		expect(session?.sessionId).toBe("session-001");
	});

	it("findById returns null when session missing", async () => {
		const db = createMockD1({
			onQuery: () => ({ results: [] }),
		});

		const session = await sessionRepository.findById(db, "missing-session");

		expect(session).toBeNull();
	});

	it("deleteSession deletes row by session_id", async () => {
		const db = createMockD1({
			onQuery: (call: MockD1Call) => {
				expect(call.method).toBe("run");
				expect(call.sql).toContain("DELETE FROM sessions WHERE session_id = ?1");
				expect(call.bindings).toEqual(["session-001"]);
				return { success: true, meta: { changes: 1 } };
			},
		});

		const deleted = await sessionRepository.deleteSession(db, "session-001");

		expect(deleted).toBe(true);
	});

	it("deleteSessionsForUser deletes all sessions for user_id", async () => {
		const db = createMockD1({
			onQuery: (call: MockD1Call) => {
				expect(call.sql).toContain("DELETE FROM sessions WHERE user_id = ?1");
				expect(call.bindings).toEqual(["user-001"]);
				return { success: true, meta: { changes: 2 } };
			},
		});

		const deletedCount = await sessionRepository.deleteSessionsForUser(db, "user-001");

		expect(deletedCount).toBe(2);
	});

	it("deleteExpiredSessions deletes rows where expires_at is before now", async () => {
		const db = createMockD1({
			onQuery: (call: MockD1Call) => {
				expect(call.sql).toContain("expires_at < ?1");
				expect(call.bindings).toEqual(["2026-08-26T12:00:00Z"]);
				return { success: true, meta: { changes: 3 } };
			},
		});

		const deletedCount = await sessionRepository.deleteExpiredSessions(
			db,
			"2026-08-26T12:00:00Z",
		);

		expect(deletedCount).toBe(3);
	});
});
