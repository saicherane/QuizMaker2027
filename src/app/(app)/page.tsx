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
					Your collaborative test bank workspace will appear here in a future phase.
				</p>
			</section>
		</main>
	);
}
