import Link from "next/link";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function ProfilePage() {
	const user = await getCurrentUser();

	return (
		<main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 p-8">
			<header className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold">Profile</h1>
					<p className="text-muted-foreground">Manage your account settings.</p>
				</div>
				<Link href="/" className={cn(buttonVariants({ variant: "outline" }))}>
					Back to dashboard
				</Link>
			</header>
			<section className="rounded-xl border bg-card p-6">
				<dl className="grid gap-4 text-sm">
					<div>
						<dt className="text-muted-foreground">Username</dt>
						<dd className="font-medium">{user?.username}</dd>
					</div>
					<div>
						<dt className="text-muted-foreground">Email</dt>
						<dd className="font-medium">{user?.emailId}</dd>
					</div>
				</dl>
				<p className="mt-6 text-sm text-muted-foreground">
					Full profile editing will be completed in Phase 4.
				</p>
			</section>
		</main>
	);
}
