import { beforeEach, describe, expect, it, vi } from "vitest";

import { deleteMcq } from "@/app/(app)/questions/actions";
import { AppError } from "@/lib/errors/app-error";
import * as mcqService from "@/lib/services/mcq-service";
import { createMockD1 } from "@/test/mock-d1";

vi.mock("server-only", () => ({}));

const revalidatePath = vi.fn();

vi.mock("next/cache", () => ({
	revalidatePath: (path: string) => revalidatePath(path),
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

describe("deleteMcq", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("deletes MCQ and revalidates questions list", async () => {
		vi.mocked(getCurrentUser).mockResolvedValue(authenticatedUser);
		vi.mocked(mcqService.deleteMcq).mockResolvedValue(undefined);

		const formData = new FormData();
		formData.set("mcqId", "mcq-001");

		const result = await deleteMcq(formData);

		expect(mcqService.deleteMcq).toHaveBeenCalledWith(
			expect.anything(),
			"mcq-001",
			"user-001",
		);
		expect(revalidatePath).toHaveBeenCalledWith("/questions");
		expect(result).toEqual({ success: true });
	});

	it("returns error when user is not the owner", async () => {
		vi.mocked(getCurrentUser).mockResolvedValue(authenticatedUser);
		vi.mocked(mcqService.deleteMcq).mockRejectedValue(
			new AppError("FORBIDDEN", "You do not have permission to modify this MCQ"),
		);

		const formData = new FormData();
		formData.set("mcqId", "mcq-001");

		const result = await deleteMcq(formData);

		expect(result).toEqual({
			error: "You do not have permission to modify this MCQ",
		});
		expect(revalidatePath).not.toHaveBeenCalled();
	});
});
