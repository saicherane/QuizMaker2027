import { beforeEach, describe, expect, it } from "vitest";

import * as userRepository from "@/lib/repositories/user-repository";
import { createUserInputFixture, userRowFixture } from "@/test/fixtures/users";
import { createMockD1, type MockD1Call, sqlMatches } from "@/test/mock-d1";

describe("user-repository", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("createUser inserts with bound params and returns mapped user", async () => {
		const db = createMockD1({
			onQuery: (call: MockD1Call) => {
				expect(call.method).toBe("all");
				expect(call.sql).toContain("INSERT INTO users");
				expect(call.bindings).toEqual([
					createUserInputFixture.username,
					createUserInputFixture.emailId,
					createUserInputFixture.passwordHash,
					createUserInputFixture.passwordSalt,
				]);
				return { results: [userRowFixture] };
			},
		});

		const user = await userRepository.createUser(db, createUserInputFixture);

		expect(user.userId).toBe(userRowFixture.user_id);
		expect(user.username).toBe(userRowFixture.username);
		expect(user.emailId).toBe(userRowFixture.email_id);
		expect(user.passwordHash).toBe(userRowFixture.password_hash);
		expect(user.passwordSalt).toBe(userRowFixture.password_salt);
	});

	it("findByEmailId returns user when row exists", async () => {
		const db = createMockD1({
			onQuery: (call: MockD1Call) => {
				expect(call.sql).toContain("email_id = ?1 COLLATE NOCASE");
				expect(call.bindings).toEqual(["jane@school.edu"]);
				return { results: [userRowFixture] };
			},
		});

		const user = await userRepository.findByEmailId(db, "jane@school.edu");

		expect(user).not.toBeNull();
		expect(user?.emailId).toBe("jane@school.edu");
	});

	it("findByEmailId returns null when row missing", async () => {
		const db = createMockD1({
			onQuery: () => ({ results: [] }),
		});

		const user = await userRepository.findByEmailId(db, "missing@school.edu");

		expect(user).toBeNull();
	});

	it("findById returns user when row exists", async () => {
		const db = createMockD1({
			onQuery: (call: MockD1Call) => {
				expect(call.sql).toContain("user_id = ?1");
				expect(call.bindings).toEqual(["user-001"]);
				return { results: [userRowFixture] };
			},
		});

		const user = await userRepository.findById(db, "user-001");

		expect(user?.userId).toBe("user-001");
	});

	it("findById returns null when row missing", async () => {
		const db = createMockD1({
			onQuery: () => ({ results: [] }),
		});

		const user = await userRepository.findById(db, "missing-id");

		expect(user).toBeNull();
	});

	it("findByUsername returns user with case-insensitive query", async () => {
		const db = createMockD1({
			onQuery: (call: MockD1Call) => {
				expect(call.sql).toContain("username = ?1 COLLATE NOCASE");
				expect(call.bindings).toEqual(["JDOE"]);
				return { results: [userRowFixture] };
			},
		});

		const user = await userRepository.findByUsername(db, "JDOE");

		expect(user?.username).toBe("jdoe");
	});

	it("updateUser updates username and email with bound params", async () => {
		const updatedRow = {
			...userRowFixture,
			username: "janedoe",
			email_id: "janedoe@school.edu",
		};

		const db = createMockD1({
			onQuery: (call: MockD1Call) => {
				expect(sqlMatches(/UPDATE users/, call.sql)).toBe(true);
				expect(call.bindings).toEqual([
					"user-001",
					"janedoe",
					"janedoe@school.edu",
					null,
					null,
				]);
				return { results: [updatedRow] };
			},
		});

		const user = await userRepository.updateUser(db, "user-001", {
			username: "janedoe",
			emailId: "janedoe@school.edu",
		});

		expect(user?.username).toBe("janedoe");
		expect(user?.emailId).toBe("janedoe@school.edu");
	});

	it("updateUser updates password hash and salt when provided", async () => {
		const updatedRow = {
			...userRowFixture,
			password_hash: "new-hash",
			password_salt: "new-salt",
		};

		const db = createMockD1({
			onQuery: (call: MockD1Call) => {
				expect(call.bindings).toEqual([
					"user-001",
					null,
					null,
					"new-hash",
					"new-salt",
				]);
				return { results: [updatedRow] };
			},
		});

		const user = await userRepository.updateUser(db, "user-001", {
			passwordHash: "new-hash",
			passwordSalt: "new-salt",
		});

		expect(user?.passwordHash).toBe("new-hash");
		expect(user?.passwordSalt).toBe("new-salt");
	});

	it("deleteUser returns true when row deleted", async () => {
		const db = createMockD1({
			onQuery: (call: MockD1Call) => {
				expect(call.method).toBe("run");
				expect(call.sql).toContain("DELETE FROM users WHERE user_id = ?1");
				expect(call.bindings).toEqual(["user-001"]);
				return { success: true, meta: { changes: 1 } };
			},
		});

		const deleted = await userRepository.deleteUser(db, "user-001");

		expect(deleted).toBe(true);
	});

	it("deleteUser returns false when row missing", async () => {
		const db = createMockD1({
			onQuery: () => ({ success: true, meta: { changes: 0 } }),
		});

		const deleted = await userRepository.deleteUser(db, "missing-id");

		expect(deleted).toBe(false);
	});
});
