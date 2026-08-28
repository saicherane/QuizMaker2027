"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { redirect } from "next/navigation";

import { flattenZodErrors, formDataToRecord } from "@/lib/actions/form-utils";
import { AppError } from "@/lib/errors/app-error";
import * as userService from "@/lib/services/user-service";
import { registerSchema } from "@/lib/validators/user";

export type RegisterActionState =
	| { errors: Record<string, string[] | undefined> }
	| { error: string }
	| undefined;

export async function registerUser(
	_prevState: RegisterActionState,
	formData: FormData,
): Promise<RegisterActionState> {
	const parsed = registerSchema.safeParse(formDataToRecord(formData));
	if (!parsed.success) {
		return { errors: flattenZodErrors(parsed.error) };
	}

	try {
		const { env } = await getCloudflareContext();
		await userService.register(env.DB, parsed.data);
	} catch (error) {
		if (error instanceof AppError && error.code === "CONFLICT") {
			return { error: error.message };
		}
		throw error;
	}

	redirect("/login?registered=1");
}
