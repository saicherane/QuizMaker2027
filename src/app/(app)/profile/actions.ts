"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { redirect } from "next/navigation";

import { clearSessionCookie, getSessionCookie } from "@/lib/auth/cookies";
import { flattenZodErrors, formDataToRecord } from "@/lib/actions/form-utils";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { AppError } from "@/lib/errors/app-error";
import * as userService from "@/lib/services/user-service";
import { deleteUserSchema, updateUserSchema } from "@/lib/validators/user";

export type ProfileActionState =
	| { success: true }
	| { errors: Record<string, string[] | undefined> }
	| { error: string }
	| undefined;

export async function updateProfile(formData: FormData): Promise<ProfileActionState> {
	const user = await getCurrentUser();
	if (!user) {
		return { error: "Not authenticated" };
	}

	const parsed = updateUserSchema.safeParse(formDataToRecord(formData));
	if (!parsed.success) {
		return { errors: flattenZodErrors(parsed.error) };
	}

	try {
		const { env } = await getCloudflareContext();
		await userService.updateUser(env.DB, user.userId, {
			username: parsed.data.username,
			emailId: parsed.data.emailId,
			currentPassword: parsed.data.currentPassword,
			newPassword: parsed.data.newPassword,
		});
		return { success: true };
	} catch (error) {
		if (error instanceof AppError) {
			return { error: error.message };
		}
		throw error;
	}
}

export async function deleteAccount(formData: FormData): Promise<ProfileActionState> {
	const user = await getCurrentUser();
	if (!user) {
		return { error: "Not authenticated" };
	}

	const parsed = deleteUserSchema.safeParse(formDataToRecord(formData));
	if (!parsed.success) {
		return { errors: flattenZodErrors(parsed.error) };
	}

	try {
		const { env } = await getCloudflareContext();
		await userService.deleteUser(env.DB, user.userId, parsed.data.password);
	} catch (error) {
		if (error instanceof AppError) {
			return { error: error.message };
		}
		throw error;
	}

	const sessionId = await getSessionCookie();
	if (sessionId) {
		const { env } = await getCloudflareContext();
		await userService.logout(env.DB, sessionId);
	}

	await clearSessionCookie();
	redirect("/login");
}
