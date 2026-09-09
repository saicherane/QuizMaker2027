"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";

import { flattenZodErrors, formDataToRecord } from "@/lib/actions/form-utils";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { AppError } from "@/lib/errors/app-error";
import * as mcqService from "@/lib/services/mcq-service";
import { recordAttemptSchema } from "@/lib/validators/mcq";

export type RecordAttemptActionState =
	| { isCorrect: boolean }
	| { errors: Record<string, string[] | undefined> }
	| { error: string }
	| undefined;

export async function recordAttempt(
	_prevState: RecordAttemptActionState,
	formData: FormData,
): Promise<RecordAttemptActionState> {
	const user = await getCurrentUser();
	if (!user) {
		return { error: "Not authenticated" };
	}

	const parsed = recordAttemptSchema.safeParse(formDataToRecord(formData));
	if (!parsed.success) {
		return { errors: flattenZodErrors(parsed.error) };
	}

	try {
		const { env } = await getCloudflareContext();
		return await mcqService.recordAttempt(
			env.DB,
			user.userId,
			parsed.data.mcqId,
			parsed.data.choiceId,
		);
	} catch (error) {
		if (error instanceof AppError) {
			return { error: error.message };
		}
		throw error;
	}
}
