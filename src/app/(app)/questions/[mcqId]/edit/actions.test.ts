import { beforeEach, describe, expect, it, vi } from "vitest";

import { updateMcq } from "@/app/(app)/questions/[mcqId]/edit/actions";
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

function createUpdateFormData() {
	const formData = new FormData();
	formData.set("mcqId", "mcq-001");
	formData.set("name", "Updated name");
	formData.set("question", "Which process do plants use to convert light energy?");
	formData.set("choiceLabel_0", "Respiration");
	formData.set("choiceLabel_1", "Photosynthesis");
	formData.set("correctChoiceIndex", "1");
	return formData;
}

describe("updateMcq", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns auth error when unauthenticated", async () => {
		vi.mocked(getCurrentUser).mockResolvedValue(null);

		const result = await updateMcq(undefined, createUpdateFormData());

		expect(result).toEqual({ error: "Not authenticated" });
		expect(mcqService.updateMcq).not.toHaveBeenCalled();
	});

	it("updates MCQ and redirects on success", async () => {
		vi.mocked(getCurrentUser).mockResolvedValue(authenticatedUser);
		vi.mocked(mcqService.updateMcq).mockResolvedValue({
			mcqId: "mcq-001",
			name: "Updated name",
			question: "Which process do plants use to convert light energy?",
			createdBy: "user-001",
			createdAt: "2026-09-08T10:00:00Z",
			updatedAt: "2026-09-08T10:00:00Z",
			choices: [],
		});

		await expect(updateMcq(undefined, createUpdateFormData())).rejects.toThrow(
			"NEXT_REDIRECT:/questions",
		);

		expect(mcqService.updateMcq).toHaveBeenCalledWith(
			expect.anything(),
			"mcq-001",
			"user-001",
			expect.objectContaining({ name: "Updated name" }),
		);
	});

	it("returns error when service throws FORBIDDEN", async () => {
		vi.mocked(getCurrentUser).mockResolvedValue(authenticatedUser);
		vi.mocked(mcqService.updateMcq).mockRejectedValue(
			new AppError("FORBIDDEN", "You do not have permission to modify this MCQ"),
		);

		const result = await updateMcq(undefined, createUpdateFormData());

		expect(result).toEqual({
			error: "You do not have permission to modify this MCQ",
		});
		expect(redirect).not.toHaveBeenCalled();
	});
});
