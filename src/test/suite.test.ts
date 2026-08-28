import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const expectedTestFiles = [
	"src/lib/repositories/user-repository.test.ts",
	"src/lib/repositories/session-repository.test.ts",
	"src/lib/auth/password.test.ts",
	"src/lib/auth/session.test.ts",
	"src/lib/validators/user.test.ts",
	"src/lib/services/user-service.test.ts",
	"src/lib/auth/get-current-user.test.ts",
	"src/lib/auth/route-guard.test.ts",
	"src/app/(auth)/register/actions.test.ts",
	"src/app/(auth)/login/actions.test.ts",
	"src/lib/actions/auth-actions.test.ts",
	"src/app/(app)/profile/actions.test.ts",
	"src/components/auth/register-form.test.tsx",
	"src/components/auth/login-form.test.tsx",
	"src/components/auth/profile-form.test.tsx",
	"src/components/auth/auth-nav.test.tsx",
];

describe("auth test suite inventory", () => {
	it("includes all expected phase 1-4 test files", () => {
		for (const relativePath of expectedTestFiles) {
			expect(existsSync(join(process.cwd(), relativePath))).toBe(true);
		}
	});

	it("does not contain hollow expect(true).toBe(true) assertions", () => {
		const hollowPattern = /expect\s*\(\s*true\s*\)\s*\.\s*toBe\s*\(\s*true\s*\)/;

		for (const relativePath of expectedTestFiles) {
			const contents = readFileSync(join(process.cwd(), relativePath), "utf8");
			expect(hollowPattern.test(contents)).toBe(false);
		}
	});
});
