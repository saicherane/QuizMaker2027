import Link from "next/link";

import { logoutUser } from "@/lib/actions/auth-actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AuthNav({ isAuthenticated }: { isAuthenticated: boolean }) {
	if (isAuthenticated) {
		return (
			<nav className="flex items-center gap-3" aria-label="Account">
				<Link href="/profile" className={cn(buttonVariants({ variant: "outline" }))}>
					Profile
				</Link>
				<form action={logoutUser}>
					<Button type="submit" variant="secondary">
						Log out
					</Button>
				</form>
			</nav>
		);
	}

	return (
		<nav className="flex items-center gap-3" aria-label="Account">
			<Link href="/login" className={cn(buttonVariants({ variant: "outline" }))}>
				Login
			</Link>
			<Link href="/register" className={cn(buttonVariants({ variant: "default" }))}>
				Register
			</Link>
		</nav>
	);
}
