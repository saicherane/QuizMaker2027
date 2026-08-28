import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage({
	searchParams,
}: {
	searchParams: Promise<{ registered?: string }>;
}) {
	const params = await searchParams;

	return (
		<main className="flex min-h-screen items-center justify-center p-6">
			<LoginForm registered={params.registered === "1"} />
		</main>
	);
}
