import Link from "next/link";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { logoutUser } from "@/lib/actions/auth-actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function HomePage() {
	const user = await getCurrentUser();

	return (
		<main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 p-8">
			<header className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold">QuizMaker</h1>
					<p className="text-muted-foreground">Welcome back, {user?.username}.</p>
				</div>
				<nav className="flex items-center gap-3">
					<Link href="/profile" className={cn(buttonVariants({ variant: "outline" }))}>
						Profile
					</Link>
					<form action={logoutUser}>
						<Button type="submit" variant="secondary">
							Log out
						</Button>
					</form>
				</nav>
			</header>
			<section className="rounded-xl border bg-card p-6">
				<h2 className="text-lg font-medium">Dashboard</h2>
				<p className="mt-2 text-muted-foreground">
					Your collaborative test bank workspace will appear here in a future phase.
				</p>
			</section>
		</main>
	);
}
