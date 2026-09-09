import Link from "next/link";

import { getCurrentUser } from "@/lib/auth/get-current-user";

export default async function HomePage() {
	const user = await getCurrentUser();

	return (
		<main className="mx-auto flex max-w-3xl flex-col gap-8 p-8">
			<div>
				<h1 className="text-2xl font-semibold">Dashboard</h1>
				<p className="text-muted-foreground">Welcome back, {user?.username}.</p>
			</div>
			<section className="rounded-xl border bg-card p-6">
				<h2 className="text-lg font-medium">Test banks</h2>
				<p className="mt-2 text-muted-foreground">
					Create and manage multiple choice questions for your collaborative test bank.
				</p>
				<Link
					href="/questions"
					className="mt-4 inline-flex text-sm font-medium underline underline-offset-4"
				>
					Go to Questions
				</Link>
			</section>
		</main>
	);
}
