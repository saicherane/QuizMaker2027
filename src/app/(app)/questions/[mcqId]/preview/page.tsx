import { notFound } from "next/navigation";

import { McqPreview } from "@/components/mcq/mcq-preview";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { AppError } from "@/lib/errors/app-error";
import * as mcqService from "@/lib/services/mcq-service";

export default async function PreviewQuestionPage({
	params,
}: {
	params: Promise<{ mcqId: string }>;
}) {
	const { mcqId } = await params;

	try {
		const { env } = await getCloudflareContext();
		const mcq = await mcqService.getMcqWithChoices(env.DB, mcqId);

		return (
			<main className="mx-auto flex max-w-3xl flex-col gap-8 p-8">
				<McqPreview
					mcqId={mcq.mcqId}
					name={mcq.name}
					question={mcq.question}
					choices={mcq.choices.map((choice) => ({
						choiceId: choice.choiceId,
						label: choice.label,
					}))}
				/>
			</main>
		);
	} catch (error) {
		if (error instanceof AppError && error.code === "NOT_FOUND") {
			notFound();
		}
		throw error;
	}
}
