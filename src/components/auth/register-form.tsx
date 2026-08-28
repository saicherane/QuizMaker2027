"use client";

import Link from "next/link";
import { useActionState } from "react";

import { registerUser } from "@/app/(auth)/register/actions";
import { Button } from "@/components/ui/button";
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

function fieldErrors(messages: string[] | undefined) {
	return messages?.map((message) => ({ message }));
}

export function RegisterForm() {
	const [state, formAction, pending] = useActionState(registerUser, undefined);

	return (
		<Card className="w-full max-w-md">
			<CardHeader>
				<CardTitle>Create account</CardTitle>
				<CardDescription>Register as a teacher to collaborate on test banks.</CardDescription>
			</CardHeader>
			<form action={formAction}>
				<CardContent>
					<FieldGroup>
						{state && "error" in state ? (
							<FieldError>{state.error}</FieldError>
						) : null}
						<Field>
							<FieldLabel htmlFor="username">Username</FieldLabel>
							<Input
								id="username"
								name="username"
								autoComplete="username"
								required
							/>
							<FieldError
								errors={fieldErrors(
									state && "errors" in state ? state.errors.username : undefined,
								)}
							/>
						</Field>
						<Field>
							<FieldLabel htmlFor="emailId">Email</FieldLabel>
							<Input
								id="emailId"
								name="emailId"
								type="email"
								autoComplete="email"
								required
							/>
							<FieldError
								errors={fieldErrors(
									state && "errors" in state ? state.errors.emailId : undefined,
								)}
							/>
						</Field>
						<Field>
							<FieldLabel htmlFor="password">Password</FieldLabel>
							<Input
								id="password"
								name="password"
								type="password"
								autoComplete="new-password"
								required
							/>
							<FieldError
								errors={fieldErrors(
									state && "errors" in state ? state.errors.password : undefined,
								)}
							/>
						</Field>
						<Field>
							<FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
							<Input
								id="confirmPassword"
								name="confirmPassword"
								type="password"
								autoComplete="new-password"
								required
							/>
							<FieldError
								errors={fieldErrors(
									state && "errors" in state
										? state.errors.confirmPassword
										: undefined,
								)}
							/>
						</Field>
					</FieldGroup>
				</CardContent>
				<CardFooter className="flex flex-col gap-3 border-t-0 bg-transparent">
					<Button type="submit" className="w-full" disabled={pending}>
						{pending ? "Creating account..." : "Create account"}
					</Button>
					<p className="text-sm text-muted-foreground">
						Already have an account?{" "}
						<Link href="/login" className="text-foreground underline underline-offset-4">
							Sign in
						</Link>
					</p>
				</CardFooter>
			</form>
		</Card>
	);
}
