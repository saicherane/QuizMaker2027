import { z } from "zod";

export const choiceInputSchema = z.object({
	label: z.string().min(1, "Choice text is required").max(500),
	isCorrect: z.boolean(),
});

export const mcqFormSchema = z
	.object({
		name: z.string().min(3).max(120),
		question: z.string().min(10).max(2000),
		choices: z
			.array(choiceInputSchema)
			.min(2, "At least 2 choices required")
			.max(6, "At most 6 choices allowed"),
	})
	.refine((data) => data.choices.filter((choice) => choice.isCorrect).length === 1, {
		message: "Exactly one choice must be marked correct",
		path: ["choices"],
	});

export const recordAttemptSchema = z.object({
	mcqId: z.string().min(1),
	choiceId: z.string().min(1),
});

export type McqFormInput = z.infer<typeof mcqFormSchema>;
export type RecordAttemptInput = z.infer<typeof recordAttemptSchema>;
