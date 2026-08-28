import { cookies } from "next/headers";

import { SESSION_COOKIE, SESSION_TTL_MS, sessionCookieOptions } from "@/lib/auth/session";

export async function getSessionCookie(): Promise<string | undefined> {
	const cookieStore = await cookies();
	return cookieStore.get(SESSION_COOKIE)?.value;
}

export async function setSessionCookie(sessionId: string): Promise<void> {
	const cookieStore = await cookies();
	cookieStore.set(SESSION_COOKIE, sessionId, sessionCookieOptions(SESSION_TTL_MS / 1000));
}

export async function clearSessionCookie(): Promise<void> {
	const cookieStore = await cookies();
	cookieStore.delete(SESSION_COOKIE);
}
