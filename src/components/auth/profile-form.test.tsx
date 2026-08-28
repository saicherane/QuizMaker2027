import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ProfileForm } from "@/components/auth/profile-form";

const updateProfileMock = vi.fn();
const deleteAccountMock = vi.fn();

vi.mock("@/app/(app)/profile/actions", () => ({
	updateProfile: (...args: unknown[]) => updateProfileMock(...args),
	deleteAccount: (...args: unknown[]) => deleteAccountMock(...args),
}));

const user = {
	userId: "user-001",
	username: "jdoe",
	emailId: "jane@school.edu",
	createdAt: "2026-08-26T10:00:00Z",
	updatedAt: "2026-08-26T10:00:00Z",
};

describe("ProfileForm", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		updateProfileMock.mockResolvedValue(undefined);
		deleteAccountMock.mockResolvedValue(undefined);
	});

	it("displays current username and email in inputs", () => {
		render(<ProfileForm user={user} />);

		expect(screen.getByLabelText("Username")).toHaveValue("jdoe");
		expect(screen.getByLabelText("Email")).toHaveValue("jane@school.edu");
	});

	it("submits updated username through updateProfile", async () => {
		updateProfileMock.mockResolvedValue({ success: true });
		render(<ProfileForm user={user} />);

		const usernameInput = screen.getByLabelText("Username");
		await userEvent.clear(usernameInput);
		await userEvent.type(usernameInput, "janedoe");
		fireEvent.submit(screen.getByRole("button", { name: "Save changes" }).closest("form")!);

		await waitFor(() => {
			expect(updateProfileMock).toHaveBeenCalled();
		});
	});

	it("shows current password field when a new password is entered", async () => {
		render(<ProfileForm user={user} />);

		expect(screen.queryByLabelText("Current password")).not.toBeInTheDocument();

		await userEvent.type(screen.getByLabelText("New password"), "Password2");

		expect(screen.getByLabelText("Current password")).toBeInTheDocument();
	});

	it("requires password and DELETE confirmation before delete submit", () => {
		render(<ProfileForm user={user} />);

		expect(document.getElementById("deletePassword")).toBeRequired();
		expect(document.getElementById("confirmDelete")).toBeRequired();
	});

	it("uses destructive styling for delete button", () => {
		render(<ProfileForm user={user} />);

		expect(screen.getByRole("button", { name: "Delete account" }).className).toContain(
			"destructive",
		);
	});
});
