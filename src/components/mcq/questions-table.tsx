"use client";

import Link from "next/link";
import { useState } from "react";
import { MoreHorizontal } from "lucide-react";

import { deleteMcq } from "@/app/(app)/questions/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { truncateText } from "@/lib/utils/truncate";
import { cn } from "@/lib/utils";

export interface McqSummary {
	mcqId: string;
	name: string;
	question: string;
}

export function QuestionsTable({ mcqs }: { mcqs: McqSummary[] }) {
	const [deleteTarget, setDeleteTarget] = useState<McqSummary | null>(null);
	const [deleteError, setDeleteError] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	async function handleDeleteConfirm() {
		if (!deleteTarget) {
			return;
		}

		setIsDeleting(true);
		setDeleteError(null);

		const formData = new FormData();
		formData.set("mcqId", deleteTarget.mcqId);

		const result = await deleteMcq(formData);

		setIsDeleting(false);

		if (result && "error" in result) {
			setDeleteError(result.error);
			return;
		}

		setDeleteTarget(null);
	}

	if (mcqs.length === 0) {
		return (
			<section className="flex flex-col items-center gap-4 rounded-xl border bg-card p-10 text-center">
				<p className="text-muted-foreground">No multiple choice questions yet.</p>
				<Link href="/questions/new" className={cn(buttonVariants())}>
					Create your first question
				</Link>
			</section>
		);
	}

	return (
		<>
			<div className="overflow-hidden rounded-xl border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Name</TableHead>
							<TableHead>Question</TableHead>
							<TableHead className="w-12 text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{mcqs.map((mcq) => (
							<TableRow key={mcq.mcqId}>
								<TableCell className="font-medium">{mcq.name}</TableCell>
								<TableCell className="max-w-md whitespace-normal text-muted-foreground">
									{truncateText(mcq.question)}
								</TableCell>
								<TableCell className="text-right">
									<DropdownMenu>
										<DropdownMenuTrigger
											render={
												<Button
													variant="ghost"
													size="icon-sm"
													aria-label={`Actions for ${mcq.name}`}
												/>
											}
										>
											<MoreHorizontal />
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuItem
												render={
													<Link href={`/questions/${mcq.mcqId}/edit`} />
												}
											>
												Edit
											</DropdownMenuItem>
											<DropdownMenuItem
												render={
													<Link href={`/questions/${mcq.mcqId}/preview`} />
												}
											>
												Preview
											</DropdownMenuItem>
											<DropdownMenuItem
												variant="destructive"
												onClick={() => {
													setDeleteError(null);
													setDeleteTarget(mcq);
												}}
											>
												Delete
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			<Dialog
				open={deleteTarget !== null}
				onOpenChange={(open) => {
					if (!open) {
						setDeleteTarget(null);
						setDeleteError(null);
					}
				}}
			>
				<DialogContent showCloseButton={false}>
					<DialogHeader>
						<DialogTitle>Delete question?</DialogTitle>
						<DialogDescription>
							This will permanently delete &quot;{deleteTarget?.name}&quot; and all related
							choices and attempts.
						</DialogDescription>
					</DialogHeader>
					{deleteError ? (
						<p className="text-sm text-destructive">{deleteError}</p>
					) : null}
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => setDeleteTarget(null)}
							disabled={isDeleting}
						>
							Cancel
						</Button>
						<Button
							type="button"
							variant="destructive"
							onClick={handleDeleteConfirm}
							disabled={isDeleting}
						>
							{isDeleting ? "Deleting..." : "Delete"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
