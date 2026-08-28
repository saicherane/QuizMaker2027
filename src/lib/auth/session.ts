export const SESSION_COOKIE = "qm_session";
export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function sessionCookieOptions(maxAgeSeconds: number) {
	return {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax" as const,
		path: "/",
		maxAge: maxAgeSeconds,
	};
}

export function createSessionExpiry(now = Date.now()): string {
	return new Date(now + SESSION_TTL_MS).toISOString();
}

export function isSessionExpired(expiresAt: string, now = Date.now()): boolean {
	return Date.parse(expiresAt) <= now;
}
