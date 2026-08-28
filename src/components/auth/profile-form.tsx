"use client";

import { useActionState, useState } from "react";

import { deleteAccount, updateProfile } from "@/app/(app)/profile/actions";
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
import type { SafeUser } from "@/lib/types/user";

function fieldErrors(messages: string[] | undefined) {
	return messages?.map((message) => ({ message }));
}

export function ProfileForm({ user }: { user: SafeUser }) {
	const [updateState, updateAction, updatePending] = useActionState(updateProfile, undefined);
	const [deleteState, deleteAction, deletePending] = useActionState(deleteAccount, undefined);
	const [newPassword, setNewPassword] = useState("");

	return (
		<div className="flex flex-col gap-8">
			<Card>
				<CardHeader>
					<CardTitle>Update profile</CardTitle>
					<CardDescription>Change your username, email, or password.</CardDescription>
				</CardHeader>
				<form action={updateAction}>
					<CardContent>
						<FieldGroup>
							{updateState && "success" in updateState ? (
								<p className="text-sm text-muted-foreground">Profile updated successfully.</p>
							) : null}
							{updateState && "error" in updateState ? (
								<FieldError>{updateState.error}</FieldError>
							) : null}
							<Field>
								<FieldLabel htmlFor="username">Username</FieldLabel>
								<Input
									id="username"
									name="username"
									defaultValue={user.username}
									autoComplete="username"
								/>
								<FieldError
									errors={fieldErrors(
										updateState && "errors" in updateState
											? updateState.errors.username
											: undefined,
									)}
								/>
							</Field>
							<Field>
								<FieldLabel htmlFor="emailId">Email</FieldLabel>
								<Input
									id="emailId"
									name="emailId"
									type="email"
									defaultValue={user.emailId}
									autoComplete="email"
								/>
								<FieldError
									errors={fieldErrors(
										updateState && "errors" in updateState
											? updateState.errors.emailId
											: undefined,
									)}
								/>
							</Field>
							<Field>
								<FieldLabel htmlFor="newPassword">New password</FieldLabel>
								<Input
									id="newPassword"
									name="newPassword"
									type="password"
									autoComplete="new-password"
									value={newPassword}
									onChange={(event) => setNewPassword(event.target.value)}
								/>
								<FieldError
									errors={fieldErrors(
										updateState && "errors" in updateState
											? updateState.errors.newPassword
											: undefined,
									)}
								/>
							</Field>
							{newPassword ? (
								<Field>
									<FieldLabel htmlFor="currentPassword">Current password</FieldLabel>
									<Input
										id="currentPassword"
										name="currentPassword"
										type="password"
										autoComplete="current-password"
									/>
									<FieldError
										errors={fieldErrors(
											updateState && "errors" in updateState
												? updateState.errors.currentPassword
												: undefined,
										)}
									/>
								</Field>
							) : null}
							{newPassword ? (
								<Field>
									<FieldLabel htmlFor="confirmPassword">Confirm new password</FieldLabel>
									<Input
										id="confirmPassword"
										name="confirmPassword"
										type="password"
										autoComplete="new-password"
									/>
									<FieldError
										errors={fieldErrors(
											updateState && "errors" in updateState
												? updateState.errors.confirmPassword
												: undefined,
										)}
									/>
								</Field>
							) : null}
						</FieldGroup>
					</CardContent>
					<CardFooter className="border-t-0 bg-transparent">
						<Button type="submit" disabled={updatePending}>
							{updatePending ? "Saving..." : "Save changes"}
						</Button>
					</CardFooter>
				</form>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Delete account</CardTitle>
					<CardDescription>
						Permanently remove your account and all associated sessions.
					</CardDescription>
				</CardHeader>
				<form action={deleteAction}>
					<CardContent>
						<FieldGroup>
							{deleteState && "error" in deleteState ? (
								<FieldError>{deleteState.error}</FieldError>
							) : null}
							<Field>
								<FieldLabel htmlFor="deletePassword">Password</FieldLabel>
								<Input
									id="deletePassword"
									name="password"
									type="password"
									autoComplete="current-password"
									required
								/>
								<FieldError
									errors={fieldErrors(
										deleteState && "errors" in deleteState
											? deleteState.errors.password
											: undefined,
									)}
								/>
							</Field>
							<Field>
								<FieldLabel htmlFor="confirmDelete">Type DELETE to confirm</FieldLabel>
								<Input
									id="confirmDelete"
									name="confirmDelete"
									placeholder="DELETE"
									required
								/>
								<FieldError
									errors={fieldErrors(
										deleteState && "errors" in deleteState
											? deleteState.errors.confirmDelete
											: undefined,
									)}
								/>
							</Field>
						</FieldGroup>
					</CardContent>
					<CardFooter className="border-t-0 bg-transparent">
						<Button type="submit" variant="destructive" disabled={deletePending}>
							{deletePending ? "Deleting..." : "Delete account"}
						</Button>
					</CardFooter>
				</form>
			</Card>
		</div>
	);
}
