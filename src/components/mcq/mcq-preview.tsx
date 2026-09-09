"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { recordAttempt } from "@/app/(app)/questions/[mcqId]/preview/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { cn } from "@/lib/utils";

export interface PreviewChoice {
	choiceId: string;
	label: string;
}

interface McqPreviewProps {
	mcqId: string;
	name: string;
	question: string;
	choices: PreviewChoice[];
}

function fieldErrors(messages: string[] | undefined) {
	return messages?.map((message) => ({ message }));
}

export function McqPreview({ mcqId, name, question, choices }: McqPreviewProps) {
	const [state, formAction, pending] = useActionState(recordAttempt, undefined);
	const [selectedChoiceId, setSelectedChoiceId] = useState<string>("");

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle>{name}</CardTitle>
				<CardDescription>Preview mode — select an answer and submit to check your response.</CardDescription>
			</CardHeader>
			<form action={formAction}>
				<CardContent>
					<FieldGroup>
						<input type="hidden" name="mcqId" value={mcqId} />
						<input type="hidden" name="choiceId" value={selectedChoiceId} />
						<p className="text-base font-medium">{question}</p>
						{state && "error" in state ? <FieldError>{state.error}</FieldError> : null}
						{state && "errors" in state ? (
							<FieldError errors={fieldErrors(state.errors.choiceId)} />
						) : null}
						<div className="space-y-2">
							{choices.map((choice) => (
								<label
									key={choice.choiceId}
									className="flex cursor-pointer items-center gap-3 rounded-lg border p-3"
								>
									<input
										type="radio"
										name="previewChoice"
										value={choice.choiceId}
										checked={selectedChoiceId === choice.choiceId}
										onChange={() => setSelectedChoiceId(choice.choiceId)}
										disabled={Boolean(state && "isCorrect" in state)}
									/>
									<span>{choice.label}</span>
								</label>
							))}
						</div>
						{state && "isCorrect" in state ? (
							<p
								className={cn(
									"text-sm font-medium",
									state.isCorrect ? "text-green-600" : "text-destructive",
								)}
							>
								{state.isCorrect ? "Correct!" : "Incorrect."}
							</p>
						) : null}
					</FieldGroup>
				</CardContent>
				<CardFooter className="flex gap-3 border-t-0 bg-transparent">
					<Button
						type="submit"
						disabled={pending || !selectedChoiceId || Boolean(state && "isCorrect" in state)}
					>
						{pending ? "Submitting..." : "Submit answer"}
					</Button>
					<Link href="/questions" className={cn(buttonVariants({ variant: "outline" }))}>
						Back to list
					</Link>
				</CardFooter>
			</form>
		</Card>
	);
}
