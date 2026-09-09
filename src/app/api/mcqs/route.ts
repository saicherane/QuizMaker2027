import { NextResponse } from "next/server";

import { getCloudflareContext } from "@opennextjs/cloudflare";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import * as mcqService from "@/lib/services/mcq-service";

export async function GET() {
	const user = await getCurrentUser();

	if (!user) {
		return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
	}

	const { env } = await getCloudflareContext();
	const mcqs = await mcqService.listMcqs(env.DB);

	return NextResponse.json({
		mcqs: mcqs.map((mcq) => ({
			mcqId: mcq.mcqId,
			name: mcq.name,
			question: mcq.question,
			createdBy: mcq.createdBy,
			createdAt: mcq.createdAt,
			updatedAt: mcq.updatedAt,
		})),
	});
}
