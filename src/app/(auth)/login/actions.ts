"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { redirect } from "next/navigation";

import { setSessionCookie } from "@/lib/auth/cookies";
import { flattenZodErrors, formDataToRecord } from "@/lib/actions/form-utils";
import { AppError } from "@/lib/errors/app-error";
import * as userService from "@/lib/services/user-service";
import { loginSchema } from "@/lib/validators/user";

export type LoginActionState =
	| { errors: Record<string, string[] | undefined> }
	| { error: string }
	| undefined;

export async function loginUser(
	_prevState: LoginActionState,
	formData: FormData,
): Promise<LoginActionState> {
	const parsed = loginSchema.safeParse(formDataToRecord(formData));
	if (!parsed.success) {
		return { errors: flattenZodErrors(parsed.error) };
	}

	try {
		const { env } = await getCloudflareContext();
		const { sessionId } = await userService.login(
			env.DB,
			parsed.data.emailId,
			parsed.data.password,
		);
		await setSessionCookie(sessionId);
	} catch (error) {
		if (error instanceof AppError && error.code === "UNAUTHORIZED") {
			return { error: "Invalid email or password" };
		}
		throw error;
	}

	redirect("/");
}
