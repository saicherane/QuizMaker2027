import { ProfileForm } from "@/components/auth/profile-form";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
	const user = await getCurrentUser();
	if (!user) {
		redirect("/login");
	}

	return (
		<main className="mx-auto flex max-w-3xl flex-col gap-6 p-8">
			<div>
				<h1 className="text-2xl font-semibold">Profile</h1>
				<p className="text-muted-foreground">Manage your account settings.</p>
			</div>
			<ProfileForm user={user} />
		</main>
	);
}
