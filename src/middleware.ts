import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE } from "@/lib/auth/session";
import { resolveAuthRedirect } from "@/lib/auth/route-guard";

export function middleware(request: NextRequest) {
	const sessionCookie = request.cookies.get(SESSION_COOKIE)?.value;
	const isAuthenticated = Boolean(sessionCookie);
	const redirectPath = resolveAuthRedirect(request.nextUrl.pathname, isAuthenticated);

	if (redirectPath) {
		return NextResponse.redirect(new URL(redirectPath, request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
