export interface UserRow {
	user_id: string;
	username: string;
	email_id: string;
	password_hash: string;
	password_salt: string;
	created_at: string;
	updated_at: string;
}

export interface User {
	userId: string;
	username: string;
	emailId: string;
	passwordHash: string;
	passwordSalt: string;
	createdAt: string;
	updatedAt: string;
}

export interface SessionRow {
	session_id: string;
	user_id: string;
	expires_at: string;
	created_at: string;
}

export interface Session {
	sessionId: string;
	userId: string;
	expiresAt: string;
	createdAt: string;
}

export interface CreateUserInput {
	username: string;
	emailId: string;
	passwordHash: string;
	passwordSalt: string;
}

export interface UpdateUserInput {
	username?: string;
	emailId?: string;
	passwordHash?: string;
	passwordSalt?: string;
}

export interface CreateSessionInput {
	userId: string;
	expiresAt: string;
}

export function mapUserRow(row: UserRow): User {
	return {
		userId: row.user_id,
		username: row.username,
		emailId: row.email_id,
		passwordHash: row.password_hash,
		passwordSalt: row.password_salt,
		createdAt: row.created_at,
		updatedAt: row.updated_at,
	};
}

export function mapSessionRow(row: SessionRow): Session {
	return {
		sessionId: row.session_id,
		userId: row.user_id,
		expiresAt: row.expires_at,
		createdAt: row.created_at,
	};
}
