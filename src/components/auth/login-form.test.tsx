import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LoginForm } from "@/components/auth/login-form";

vi.mock("next/link", () => ({
	default: ({
		children,
		href,
	}: {
		children: React.ReactNode;
		href: string;
	}) => <a href={href}>{children}</a>,
}));

const loginUserMock = vi.fn();

vi.mock("@/app/(auth)/login/actions", () => ({
	loginUser: (...args: unknown[]) => loginUserMock(...args),
}));

describe("LoginForm", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		loginUserMock.mockResolvedValue(undefined);
	});

	it("renders email and password fields", () => {
		render(<LoginForm />);

		expect(screen.getByLabelText("Email")).toBeInTheDocument();
		expect(screen.getByLabelText("Password")).toBeInTheDocument();
	});

	it("shows generic error message for invalid credentials", async () => {
		loginUserMock.mockResolvedValue({ error: "Invalid email or password" });
		render(<LoginForm />);

		await userEvent.type(screen.getByLabelText("Email"), "jane@school.edu");
		await userEvent.type(screen.getByLabelText("Password"), "WrongPassword1");
		fireEvent.submit(screen.getByRole("button", { name: "Sign in" }).closest("form")!);

		expect(await screen.findByText("Invalid email or password")).toBeInTheDocument();
	});

	it("calls loginUser when submitting valid data", async () => {
		render(<LoginForm />);

		await userEvent.type(screen.getByLabelText("Email"), "jane@school.edu");
		await userEvent.type(screen.getByLabelText("Password"), "Password1");
		fireEvent.submit(screen.getByRole("button", { name: "Sign in" }).closest("form")!);

		await waitFor(() => {
			expect(loginUserMock).toHaveBeenCalled();
		});
	});

	it("shows registered banner when prop is set", () => {
		render(<LoginForm registered />);

		expect(screen.getByText("Account created. Please sign in.")).toBeInTheDocument();
	});

	it("links to the register page", () => {
		render(<LoginForm />);

		expect(screen.getByRole("link", { name: "Register" })).toHaveAttribute("href", "/register");
	});
});
