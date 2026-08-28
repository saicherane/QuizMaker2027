import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { RegisterForm } from "@/components/auth/register-form";

vi.mock("next/link", () => ({
	default: ({
		children,
		href,
	}: {
		children: React.ReactNode;
		href: string;
	}) => <a href={href}>{children}</a>,
}));

const registerUserMock = vi.fn();

vi.mock("@/app/(auth)/register/actions", () => ({
	registerUser: (...args: unknown[]) => registerUserMock(...args),
}));

describe("RegisterForm", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		registerUserMock.mockResolvedValue(undefined);
	});

	it("renders username, email, password, and confirm password fields", () => {
		render(<RegisterForm />);

		expect(screen.getByLabelText("Username")).toBeInTheDocument();
		expect(screen.getByLabelText("Email")).toBeInTheDocument();
		expect(screen.getByLabelText("Password")).toBeInTheDocument();
		expect(screen.getByLabelText("Confirm password")).toBeInTheDocument();
	});

	it("shows validation errors returned from the action", async () => {
		registerUserMock.mockResolvedValue({
			errors: {
				emailId: ["Invalid email address"],
				password: ["Password must be at least 8 characters"],
			},
		});
		render(<RegisterForm />);

		fireEvent.submit(screen.getByRole("button", { name: "Create account" }).closest("form")!);

		expect(await screen.findByText("Invalid email address")).toBeInTheDocument();
		expect(screen.getByText("Password must be at least 8 characters")).toBeInTheDocument();
	});

	it("calls registerUser when submitting valid data", async () => {
		render(<RegisterForm />);

		await userEvent.type(screen.getByLabelText("Username"), "jdoe");
		await userEvent.type(screen.getByLabelText("Email"), "jane@school.edu");
		await userEvent.type(screen.getByLabelText("Password"), "Password1");
		await userEvent.type(screen.getByLabelText("Confirm password"), "Password1");
		fireEvent.submit(screen.getByRole("button", { name: "Create account" }).closest("form")!);

		await waitFor(() => {
			expect(registerUserMock).toHaveBeenCalled();
		});
	});

	it("displays server conflict errors", async () => {
		registerUserMock.mockResolvedValue({ error: "Email already registered" });
		render(<RegisterForm />);

		await userEvent.type(screen.getByLabelText("Username"), "jdoe");
		await userEvent.type(screen.getByLabelText("Email"), "jane@school.edu");
		await userEvent.type(screen.getByLabelText("Password"), "Password1");
		await userEvent.type(screen.getByLabelText("Confirm password"), "Password1");
		fireEvent.submit(screen.getByRole("button", { name: "Create account" }).closest("form")!);

		expect(await screen.findByText("Email already registered")).toBeInTheDocument();
	});

	it("links to the login page", () => {
		render(<RegisterForm />);

		expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute("href", "/login");
	});
});
