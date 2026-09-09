import { beforeEach, describe, expect, it, vi } from "vitest";

import { recordAttempt } from "@/app/(app)/questions/[mcqId]/preview/actions";
import { AppError } from "@/lib/errors/app-error";
import * as mcqService from "@/lib/services/mcq-service";
import { createMockD1 } from "@/test/mock-d1";

vi.mock("server-only", () => ({}));

vi.mock("@/lib/auth/get-current-user", () => ({
	getCurrentUser: vi.fn(),
}));

vi.mock("@opennextjs/cloudflare", () => ({
	getCloudflareContext: vi.fn(async () => ({ env: { DB: createMockD1() } })),
}));

vi.mock("@/lib/services/mcq-service");

import { getCurrentUser } from "@/lib/auth/get-current-user";

const authenticatedUser = {
	userId: "user-001",
	username: "jdoe",
	emailId: "jane@school.edu",
	createdAt: "2026-09-08T10:00:00Z",
	updatedAt: "2026-09-08T10:00:00Z",
};

describe("recordAttempt", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns isCorrect when attempt is recorded", async () => {
		vi.mocked(getCurrentUser).mockResolvedValue(authenticatedUser);
		vi.mocked(mcqService.recordAttempt).mockResolvedValue({ isCorrect: true });

		const formData = new FormData();
		formData.set("mcqId", "mcq-001");
		formData.set("choiceId", "choice-002");

		const result = await recordAttempt(undefined, formData);

		expect(mcqService.recordAttempt).toHaveBeenCalledWith(
			expect.anything(),
			"user-001",
			"mcq-001",
			"choice-002",
		);
		expect(result).toEqual({ isCorrect: true });
	});

	it("returns validation error for invalid choiceId", async () => {
		vi.mocked(getCurrentUser).mockResolvedValue(authenticatedUser);
		vi.mocked(mcqService.recordAttempt).mockRejectedValue(
			new AppError("VALIDATION", "Selected choice does not belong to this MCQ"),
		);

		const formData = new FormData();
		formData.set("mcqId", "mcq-001");
		formData.set("choiceId", "choice-999");

		const result = await recordAttempt(undefined, formData);

		expect(result).toEqual({
			error: "Selected choice does not belong to this MCQ",
		});
	});
});
