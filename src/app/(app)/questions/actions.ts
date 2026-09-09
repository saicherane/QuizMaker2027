"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { AppError } from "@/lib/errors/app-error";
import * as mcqService from "@/lib/services/mcq-service";

export type DeleteMcqActionState = { success: true } | { error: string } | undefined;

export async function deleteMcq(formData: FormData): Promise<DeleteMcqActionState> {
	const user = await getCurrentUser();
	if (!user) {
		return { error: "Not authenticated" };
	}

	const mcqId = String(formData.get("mcqId") ?? "");
	if (!mcqId) {
		return { error: "MCQ id is required" };
	}

	try {
		const { env } = await getCloudflareContext();
		await mcqService.deleteMcq(env.DB, mcqId, user.userId);
	} catch (error) {
		if (error instanceof AppError) {
			return { error: error.message };
		}
		throw error;
	}

	revalidatePath("/questions");
	return { success: true };
}
