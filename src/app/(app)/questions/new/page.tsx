import { McqForm } from "@/components/mcq/mcq-form";
import { createMcq } from "@/app/(app)/questions/new/actions";

export default function NewQuestionPage() {
	return (
		<main className="mx-auto flex max-w-3xl flex-col gap-8 p-8">
			<McqForm
				title="Create question"
				description="Add a multiple choice question with between 2 and 6 answer choices."
				submitLabel="Save"
				action={createMcq}
			/>
		</main>
	);
}
