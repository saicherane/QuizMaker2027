import Link from "next/link";

import { AuthNav } from "@/components/auth/auth-nav";
import { getCurrentUser } from "@/lib/auth/get-current-user";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
	const user = await getCurrentUser();

	return (
		<div className="min-h-screen">
			<header className="mx-auto flex max-w-3xl items-center justify-between border-b px-8 py-4">
				<Link href="/" className="text-lg font-semibold">
					QuizMaker
				</Link>
				<AuthNav isAuthenticated={Boolean(user)} />
			</header>
			{children}
		</div>
	);
}
