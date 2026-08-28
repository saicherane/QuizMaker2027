import { describe, expect, it } from "vitest";

import { resolveAuthRedirect } from "@/lib/auth/route-guard";

describe("route-guard", () => {
	it("redirects unauthenticated requests from home to login", () => {
		expect(resolveAuthRedirect("/", false)).toBe("/login");
	});

	it("redirects unauthenticated requests from profile to login", () => {
		expect(resolveAuthRedirect("/profile", false)).toBe("/login");
	});

	it("redirects authenticated requests from login to home", () => {
		expect(resolveAuthRedirect("/login", true)).toBe("/");
	});

	it("redirects authenticated requests from register to home", () => {
		expect(resolveAuthRedirect("/register", true)).toBe("/");
	});

	it("allows unauthenticated requests to login", () => {
		expect(resolveAuthRedirect("/login", false)).toBeNull();
	});

	it("allows static asset and next internal paths through", () => {
		expect(resolveAuthRedirect("/_next/static/chunk.js", false)).toBeNull();
		expect(resolveAuthRedirect("/favicon.ico", false)).toBeNull();
	});
});
