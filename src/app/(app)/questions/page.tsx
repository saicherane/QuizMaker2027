import Link from "next/link";

import { QuestionsTable } from "@/components/mcq/questions-table";
import { buttonVariants } from "@/components/ui/button";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import * as mcqService from "@/lib/services/mcq-service";
import { cn } from "@/lib/utils";

export default async function QuestionsPage() {
	const { env } = await getCloudflareContext();
	const mcqs = await mcqService.listMcqs(env.DB);

	return (
		<main className="mx-auto flex max-w-5xl flex-col gap-8 p-8">
			<div className="flex items-center justify-between gap-4">
				<div>
					<h1 className="text-2xl font-semibold">Multiple Choice Questions</h1>
					<p className="text-muted-foreground">Manage your question bank.</p>
				</div>
				<Link href="/questions/new" className={cn(buttonVariants())}>
					Create
				</Link>
			</div>
			<QuestionsTable
				mcqs={mcqs.map((mcq) => ({
					mcqId: mcq.mcqId,
					name: mcq.name,
					question: mcq.question,
				}))}
			/>
		</main>
	);
}
