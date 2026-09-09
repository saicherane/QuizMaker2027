import { NextResponse } from "next/server";

import { getCloudflareContext } from "@opennextjs/cloudflare";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { AppError } from "@/lib/errors/app-error";
import * as mcqService from "@/lib/services/mcq-service";

export async function GET(
	_request: Request,
	context: { params: Promise<{ mcqId: string }> },
) {
	const user = await getCurrentUser();

	if (!user) {
		return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
	}

	const { mcqId } = await context.params;

	try {
		const { env } = await getCloudflareContext();
		const mcq = await mcqService.getMcqWithChoices(env.DB, mcqId);

		return NextResponse.json({
			mcqId: mcq.mcqId,
			name: mcq.name,
			question: mcq.question,
			createdBy: mcq.createdBy,
			createdAt: mcq.createdAt,
			updatedAt: mcq.updatedAt,
			choices: mcq.choices.map((choice) => ({
				choiceId: choice.choiceId,
				label: choice.label,
				isCorrect: choice.isCorrect,
				sortOrder: choice.sortOrder,
			})),
		});
	} catch (error) {
		if (error instanceof AppError && error.code === "NOT_FOUND") {
			return NextResponse.json({ error: "MCQ not found" }, { status: 404 });
		}
		throw error;
	}
}
