import { notFound } from "next/navigation";

import { McqForm } from "@/components/mcq/mcq-form";
import { updateMcq } from "@/app/(app)/questions/[mcqId]/edit/actions";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { AppError } from "@/lib/errors/app-error";
import * as mcqService from "@/lib/services/mcq-service";

export default async function EditQuestionPage({
	params,
}: {
	params: Promise<{ mcqId: string }>;
}) {
	const { mcqId } = await params;

	try {
		const { env } = await getCloudflareContext();
		const mcq = await mcqService.getMcqWithChoices(env.DB, mcqId);
		const correctChoiceIndex = mcq.choices.findIndex((choice) => choice.isCorrect);

		return (
			<main className="mx-auto flex max-w-3xl flex-col gap-8 p-8">
				<McqForm
					title="Edit question"
					description="Update the question details and answer choices."
					submitLabel="Save"
					action={updateMcq}
					initialValues={{
						mcqId: mcq.mcqId,
						name: mcq.name,
						question: mcq.question,
						choices: mcq.choices.map((choice) => ({ label: choice.label })),
						correctChoiceIndex: correctChoiceIndex >= 0 ? correctChoiceIndex : 0,
					}}
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
