import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { McqForm } from "@/components/mcq/mcq-form";

vi.mock("next/link", () => ({
	default: ({
		children,
		href,
	}: {
		children: React.ReactNode;
		href: string;
	}) => <a href={href}>{children}</a>,
}));

const createMcqMock = vi.fn();

describe("McqForm", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		createMcqMock.mockResolvedValue(undefined);
	});

	it("renders with 2 default choice rows", () => {
		render(
			<McqForm
				title="Create question"
				description="Test form"
				submitLabel="Save"
				action={createMcqMock}
			/>,
		);

		expect(screen.getByLabelText("Choice 1")).toBeInTheDocument();
		expect(screen.getByLabelText("Choice 2")).toBeInTheDocument();
	});

	it("add choice increases rows up to 6 and disables add at max", async () => {
		render(
			<McqForm
				title="Create question"
				description="Test form"
				submitLabel="Save"
				action={createMcqMock}
			/>,
		);

		const addButton = screen.getByRole("button", { name: "Add choice" });

		await userEvent.click(addButton);
		await userEvent.click(addButton);
		await userEvent.click(addButton);
		await userEvent.click(addButton);

		expect(screen.getByLabelText("Choice 6")).toBeInTheDocument();
		expect(addButton).toBeDisabled();
	});

	it("remove choice is blocked when only 2 choices remain", () => {
		render(
			<McqForm
				title="Create question"
				description="Test form"
				submitLabel="Save"
				action={createMcqMock}
			/>,
		);

		expect(screen.getByRole("button", { name: "Remove choice 1" })).toBeDisabled();
		expect(screen.getByRole("button", { name: "Remove choice 2" })).toBeDisabled();
	});

	it("Save submits the action", async () => {
		render(
			<McqForm
				title="Create question"
				description="Test form"
				submitLabel="Save"
				action={createMcqMock}
			/>,
		);

		await userEvent.type(screen.getByLabelText("Name"), "Photosynthesis basics");
		await userEvent.type(
			screen.getByLabelText("Question"),
			"Which process do plants use to convert light energy?",
		);
		await userEvent.type(screen.getByLabelText("Choice 1"), "Respiration");
		await userEvent.type(screen.getByLabelText("Choice 2"), "Photosynthesis");
		await userEvent.click(screen.getByLabelText("Mark choice 2 as correct"));

		fireEvent.submit(screen.getByRole("button", { name: "Save" }).closest("form")!);

		await waitFor(() => {
			expect(createMcqMock).toHaveBeenCalled();
		});
	});

	it("Cancel links to /questions", () => {
		render(
			<McqForm
				title="Create question"
				description="Test form"
				submitLabel="Save"
				action={createMcqMock}
			/>,
		);

		expect(screen.getByRole("link", { name: "Cancel" })).toHaveAttribute("href", "/questions");
	});
});
