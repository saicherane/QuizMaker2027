"use client";

import Link from "next/link";
import { useActionState } from "react";

import { loginUser } from "@/app/(auth)/login/actions";
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

export function LoginForm({ registered = false }: { registered?: boolean }) {
	const [state, formAction, pending] = useActionState(loginUser, undefined);

	return (
		<Card className="w-full max-w-md">
			<CardHeader>
				<CardTitle>Sign in</CardTitle>
				<CardDescription>Enter your email and password to access QuizMaker.</CardDescription>
			</CardHeader>
			<form action={formAction}>
				<CardContent>
					<FieldGroup>
						{registered ? (
							<p className="text-sm text-muted-foreground">
								Account created. Please sign in.
							</p>
						) : null}
						{state && "error" in state ? (
							<FieldError>{state.error}</FieldError>
						) : null}
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
								autoComplete="current-password"
								required
							/>
							<FieldError
								errors={fieldErrors(
									state && "errors" in state ? state.errors.password : undefined,
								)}
							/>
						</Field>
					</FieldGroup>
				</CardContent>
				<CardFooter className="flex flex-col gap-3 border-t-0 bg-transparent">
					<Button type="submit" className="w-full" disabled={pending}>
						{pending ? "Signing in..." : "Sign in"}
					</Button>
					<p className="text-sm text-muted-foreground">
						Don&apos;t have an account?{" "}
						<Link href="/register" className="text-foreground underline underline-offset-4">
							Register
						</Link>
					</p>
				</CardFooter>
			</form>
		</Card>
	);
}
