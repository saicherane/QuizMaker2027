import { beforeEach, describe, expect, it, vi } from "vitest";

import { createMcq } from "@/app/(app)/questions/new/actions";
import { AppError } from "@/lib/errors/app-error";
import * as mcqService from "@/lib/services/mcq-service";
import { createMockD1 } from "@/test/mock-d1";

vi.mock("server-only", () => ({}));

const redirect = vi.fn((url: string): never => {
	throw new Error(`NEXT_REDIRECT:${url}`);
});

vi.mock("next/navigation", () => ({
	redirect: (url: string) => redirect(url),
}));

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

function createMcqFormData(overrides: Record<string, string> = {}) {
	const formData = new FormData();
	formData.set("name", overrides.name ?? "Photosynthesis basics");
	formData.set(
		"question",
		overrides.question ?? "Which process do plants use to convert light energy?",
	);
	formData.set("choiceLabel_0", overrides.choiceLabel_0 ?? "Respiration");
	formData.set("choiceLabel_1", overrides.choiceLabel_1 ?? "Photosynthesis");
	formData.set("correctChoiceIndex", overrides.correctChoiceIndex ?? "1");
	return formData;
}

describe("createMcq", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns auth error when unauthenticated", async () => {
		vi.mocked(getCurrentUser).mockResolvedValue(null);

		const result = await createMcq(undefined, createMcqFormData());

		expect(result).toEqual({ error: "Not authenticated" });
		expect(mcqService.createMcq).not.toHaveBeenCalled();
	});

	it("returns validation errors for invalid form data", async () => {
		vi.mocked(getCurrentUser).mockResolvedValue(authenticatedUser);

		const formData = createMcqFormData({ name: "ab" });

		const result = await createMcq(undefined, formData);

		expect(result).toHaveProperty("errors");
		expect(mcqService.createMcq).not.toHaveBeenCalled();
	});

	it("creates MCQ and redirects to questions list on success", async () => {
		vi.mocked(getCurrentUser).mockResolvedValue(authenticatedUser);
		vi.mocked(mcqService.createMcq).mockResolvedValue({
			mcqId: "mcq-001",
			name: "Photosynthesis basics",
			question: "Which process do plants use to convert light energy?",
			createdBy: "user-001",
			createdAt: "2026-09-08T10:00:00Z",
			updatedAt: "2026-09-08T10:00:00Z",
			choices: [],
		});

		await expect(createMcq(undefined, createMcqFormData())).rejects.toThrow(
			"NEXT_REDIRECT:/questions",
		);

		expect(mcqService.createMcq).toHaveBeenCalledWith(
			expect.anything(),
			"user-001",
			expect.objectContaining({ name: "Photosynthesis basics" }),
		);
		expect(redirect).toHaveBeenCalledWith("/questions");
	});
});
