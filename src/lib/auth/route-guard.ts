const AUTH_PUBLIC_PATHS = new Set(["/login", "/register"]);
const AUTH_PROTECTED_PREFIXES = ["/profile"];

export function isStaticAssetPath(pathname: string): boolean {
	return (
		pathname.startsWith("/_next") ||
		pathname.startsWith("/api") ||
		pathname.includes(".")
	);
}

export function isProtectedPath(pathname: string): boolean {
	if (pathname === "/") {
		return true;
	}

	return AUTH_PROTECTED_PREFIXES.some(
		(prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
	);
}

export function resolveAuthRedirect(
	pathname: string,
	isAuthenticated: boolean,
): string | null {
	if (isStaticAssetPath(pathname)) {
		return null;
	}

	if (isAuthenticated && AUTH_PUBLIC_PATHS.has(pathname)) {
		return "/";
	}

	if (!isAuthenticated && isProtectedPath(pathname)) {
		return "/login";
	}

	return null;
}
