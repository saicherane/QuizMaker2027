import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { D1Database } from "@cloudflare/workers-types";

import { getSessionCookie } from "@/lib/auth/cookies";
import { isSessionExpired } from "@/lib/auth/session";
import * as sessionRepository from "@/lib/repositories/session-repository";
import * as userService from "@/lib/services/user-service";
import type { SafeUser } from "@/lib/types/user";

export async function getCurrentUser(db?: D1Database): Promise<SafeUser | null> {
	const sessionId = await getSessionCookie();
	if (!sessionId) {
		return null;
	}

	const database = db ?? (await getCloudflareContext()).env.DB;
	const session = await sessionRepository.findById(database, sessionId);

	if (!session) {
		return null;
	}

	if (isSessionExpired(session.expiresAt)) {
		await sessionRepository.deleteSession(database, sessionId);
		return null;
	}

	return userService.getUserById(database, session.userId);
}

export async function requireCurrentUser(db?: D1Database): Promise<SafeUser> {
	const user = await getCurrentUser(db);
	if (!user) {
		throw new Error("Not authenticated");
	}
	return user;
}
