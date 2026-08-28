import Link from "next/link";

import { AuthNav } from "@/components/auth/auth-nav";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="min-h-screen">
			<header className="mx-auto flex max-w-3xl items-center justify-between border-b px-8 py-4">
				<Link href="/" className="text-lg font-semibold">
					QuizMaker
				</Link>
				<AuthNav isAuthenticated={false} />
			</header>
			{children}
		</div>
	);
}
