import { beforeEach, describe, expect, it, vi } from "vitest";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import * as sessionRepository from "@/lib/repositories/session-repository";
import * as userService from "@/lib/services/user-service";
import { sessionRowFixture, userRowFixture } from "@/test/fixtures/users";
import { createMockD1 } from "@/test/mock-d1";
import { toSafeUser } from "@/lib/types/user";

vi.mock("server-only", () => ({}));

const mockGetSessionCookie = vi.fn();
vi.mock("@/lib/auth/cookies", () => ({
	getSessionCookie: () => mockGetSessionCookie(),
	setSessionCookie: vi.fn(),
	clearSessionCookie: vi.fn(),
}));

vi.mock("@opennextjs/cloudflare", () => ({
	getCloudflareContext: vi.fn(async () => ({ env: { DB: createMockD1() } })),
}));

vi.mock("@/lib/repositories/session-repository");
vi.mock("@/lib/services/user-service");

const db = createMockD1();

describe("getCurrentUser", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns SafeUser when session cookie is valid and not expired", async () => {
		mockGetSessionCookie.mockResolvedValue("session-001");
		vi.mocked(sessionRepository.findById).mockResolvedValue({
			sessionId: sessionRowFixture.session_id,
			userId: sessionRowFixture.user_id,
			expiresAt: "2099-01-01T00:00:00.000Z",
			createdAt: sessionRowFixture.created_at,
		});
		vi.mocked(userService.getUserById).mockResolvedValue(toSafeUser({
			userId: userRowFixture.user_id,
			username: userRowFixture.username,
			emailId: userRowFixture.email_id,
			passwordHash: userRowFixture.password_hash,
			passwordSalt: userRowFixture.password_salt,
			createdAt: userRowFixture.created_at,
			updatedAt: userRowFixture.updated_at,
		}));

		const user = await getCurrentUser(db);

		expect(user?.userId).toBe("user-001");
	});

	it("returns null when session cookie is missing", async () => {
		mockGetSessionCookie.mockResolvedValue(undefined);

		const user = await getCurrentUser(db);

		expect(user).toBeNull();
		expect(sessionRepository.findById).not.toHaveBeenCalled();
	});

	it("returns null and deletes expired sessions", async () => {
		mockGetSessionCookie.mockResolvedValue("session-001");
		vi.mocked(sessionRepository.findById).mockResolvedValue({
			sessionId: sessionRowFixture.session_id,
			userId: sessionRowFixture.user_id,
			expiresAt: "2020-01-01T00:00:00.000Z",
			createdAt: sessionRowFixture.created_at,
		});

		const user = await getCurrentUser(db);

		expect(user).toBeNull();
		expect(sessionRepository.deleteSession).toHaveBeenCalledWith(db, "session-001");
	});

	it("returns null when session is not found in database", async () => {
		mockGetSessionCookie.mockResolvedValue("missing-session");
		vi.mocked(sessionRepository.findById).mockResolvedValue(null);

		const user = await getCurrentUser(db);

		expect(user).toBeNull();
	});
});
