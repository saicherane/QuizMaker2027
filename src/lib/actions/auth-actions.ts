"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { redirect } from "next/navigation";

import { clearSessionCookie, getSessionCookie } from "@/lib/auth/cookies";
import * as userService from "@/lib/services/user-service";

export async function logoutUser(): Promise<void> {
	const sessionId = await getSessionCookie();

	if (sessionId) {
		const { env } = await getCloudflareContext();
		await userService.logout(env.DB, sessionId);
	}

	await clearSessionCookie();
	redirect("/login");
}
