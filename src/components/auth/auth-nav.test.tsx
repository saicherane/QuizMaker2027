import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AuthNav } from "@/components/auth/auth-nav";

vi.mock("next/link", () => ({
	default: ({
		children,
		href,
	}: {
		children: React.ReactNode;
		href: string;
	}) => <a href={href}>{children}</a>,
}));

const logoutUserMock = vi.fn();

vi.mock("@/lib/actions/auth-actions", () => ({
	logoutUser: (...args: unknown[]) => logoutUserMock(...args),
}));

describe("AuthNav", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("shows login and register links when unauthenticated", () => {
		render(<AuthNav isAuthenticated={false} />);

		expect(screen.getByRole("link", { name: "Login" })).toHaveAttribute("href", "/login");
		expect(screen.getByRole("link", { name: "Register" })).toHaveAttribute("href", "/register");
	});

	it("shows profile link and logout control when authenticated", () => {
		render(<AuthNav isAuthenticated={true} />);

		expect(screen.getByRole("link", { name: "Profile" })).toHaveAttribute("href", "/profile");
		expect(screen.getByRole("button", { name: "Log out" })).toBeInTheDocument();
	});

	it("submits logout form action when log out is clicked", async () => {
		render(<AuthNav isAuthenticated={true} />);

		fireEvent.submit(screen.getByRole("button", { name: "Log out" }).closest("form")!);

		await waitFor(() => {
			expect(logoutUserMock).toHaveBeenCalled();
		});
	});
});
