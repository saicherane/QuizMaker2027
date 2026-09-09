"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type ChoiceFormValue = {
	label: string;
};

type McqFormAction = (
	prevState: McqFormState | undefined,
	formData: FormData,
) => Promise<McqFormState | undefined>;

export type McqFormState =
	| { errors: Record<string, string[] | undefined> }
	| { error: string }
	| undefined;

export interface McqFormInitialValues {
	mcqId?: string;
	name: string;
	question: string;
	choices: ChoiceFormValue[];
	correctChoiceIndex: number;
}

interface McqFormProps {
	title: string;
	description: string;
	submitLabel: string;
	action: McqFormAction;
	initialValues?: McqFormInitialValues;
}

const defaultInitialValues: McqFormInitialValues = {
	name: "",
	question: "",
	choices: [{ label: "" }, { label: "" }],
	correctChoiceIndex: 0,
};

function fieldErrors(messages: string[] | undefined) {
	return messages?.map((message) => ({ message }));
}

export function McqForm({
	title,
	description,
	submitLabel,
	action,
	initialValues = defaultInitialValues,
}: McqFormProps) {
	const [state, formAction, pending] = useActionState(action, undefined);
	const [choices, setChoices] = useState<ChoiceFormValue[]>(initialValues.choices);
	const [correctChoiceIndex, setCorrectChoiceIndex] = useState(initialValues.correctChoiceIndex);

	function addChoice() {
		if (choices.length >= 6) {
			return;
		}
		setChoices((current) => [...current, { label: "" }]);
	}

	function removeChoice(index: number) {
		if (choices.length <= 2) {
			return;
		}
		setChoices((current) => current.filter((_, choiceIndex) => choiceIndex !== index));
		setCorrectChoiceIndex((current) => {
			if (current === index) {
				return 0;
			}
			if (current > index) {
				return current - 1;
			}
			return current;
		});
	}

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				<CardDescription>{description}</CardDescription>
			</CardHeader>
			<form action={formAction}>
				<CardContent>
					<FieldGroup>
						{initialValues.mcqId ? (
							<input type="hidden" name="mcqId" value={initialValues.mcqId} />
						) : null}
						<input type="hidden" name="correctChoiceIndex" value={correctChoiceIndex} />
						{state && "error" in state ? <FieldError>{state.error}</FieldError> : null}
						<Field>
							<FieldLabel htmlFor="name">Name</FieldLabel>
							<Input
								id="name"
								name="name"
								defaultValue={initialValues.name}
								required
							/>
							<FieldError
								errors={fieldErrors(
									state && "errors" in state ? state.errors.name : undefined,
								)}
							/>
						</Field>
						<Field>
							<FieldLabel htmlFor="question">Question</FieldLabel>
							<Textarea
								id="question"
								name="question"
								defaultValue={initialValues.question}
								required
							/>
							<FieldError
								errors={fieldErrors(
									state && "errors" in state ? state.errors.question : undefined,
								)}
							/>
						</Field>
						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<FieldLabel>Choices</FieldLabel>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={addChoice}
									disabled={choices.length >= 6}
								>
									Add choice
								</Button>
							</div>
							{choices.map((choice, index) => (
								<div key={index} className="flex items-start gap-3 rounded-lg border p-3">
									<input
										type="radio"
										name="correctChoiceRadio"
										checked={correctChoiceIndex === index}
										onChange={() => setCorrectChoiceIndex(index)}
										aria-label={`Mark choice ${index + 1} as correct`}
									/>
									<div className="flex-1 space-y-2">
										<FieldLabel htmlFor={`choiceLabel_${index}`}>
											Choice {index + 1}
										</FieldLabel>
										<Input
											id={`choiceLabel_${index}`}
											name={`choiceLabel_${index}`}
											value={choice.label}
											onChange={(event) => {
												const value = event.target.value;
												setChoices((current) =>
													current.map((item, choiceIndex) =>
														choiceIndex === index ? { label: value } : item,
													),
												);
											}}
											required
										/>
									</div>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										onClick={() => removeChoice(index)}
										disabled={choices.length <= 2}
										aria-label={`Remove choice ${index + 1}`}
									>
										Remove
									</Button>
								</div>
							))}
							<FieldError
								errors={fieldErrors(
									state && "errors" in state ? state.errors.choices : undefined,
								)}
							/>
						</div>
					</FieldGroup>
				</CardContent>
				<CardFooter className="flex gap-3 border-t-0 bg-transparent">
					<Button type="submit" disabled={pending}>
						{pending ? "Saving..." : submitLabel}
					</Button>
					<Link href="/questions" className={cn(buttonVariants({ variant: "outline" }))}>
						Cancel
					</Link>
				</CardFooter>
			</form>
		</Card>
	);
}
