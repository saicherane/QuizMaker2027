"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { redirect } from "next/navigation";

import { flattenZodErrors } from "@/lib/actions/form-utils";
import { parseMcqFormData } from "@/lib/actions/mcq-form-utils";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { AppError } from "@/lib/errors/app-error";
import * as mcqService from "@/lib/services/mcq-service";
import { mcqFormSchema } from "@/lib/validators/mcq";

export type UpdateMcqActionState =
	| { errors: Record<string, string[] | undefined> }
	| { error: string }
	| undefined;

export async function updateMcq(
	_prevState: UpdateMcqActionState,
	formData: FormData,
): Promise<UpdateMcqActionState> {
	const user = await getCurrentUser();
	if (!user) {
		return { error: "Not authenticated" };
	}

	const mcqId = String(formData.get("mcqId") ?? "");
	if (!mcqId) {
		return { error: "MCQ id is required" };
	}

	const parsed = mcqFormSchema.safeParse(parseMcqFormData(formData));
	if (!parsed.success) {
		return { errors: flattenZodErrors(parsed.error) };
	}

	try {
		const { env } = await getCloudflareContext();
		await mcqService.updateMcq(env.DB, mcqId, user.userId, parsed.data);
	} catch (error) {
		if (error instanceof AppError) {
			return { error: error.message };
		}
		throw error;
	}

	redirect("/questions");
}
