import type { SessionRow, UserRow } from "@/lib/types/user";

export const userRowFixture: UserRow = {
	user_id: "user-001",
	username: "jdoe",
	email_id: "jane@school.edu",
	password_hash: "hashed-password",
	password_salt: "random-salt",
	created_at: "2026-08-26T10:00:00Z",
	updated_at: "2026-08-26T10:00:00Z",
};

export const sessionRowFixture: SessionRow = {
	session_id: "session-001",
	user_id: "user-001",
	expires_at: "2026-09-02T10:00:00Z",
	created_at: "2026-08-26T10:00:00Z",
};

export const createUserInputFixture = {
	username: "jdoe",
	emailId: "jane@school.edu",
	passwordHash: "hashed-password",
	passwordSalt: "random-salt",
};
