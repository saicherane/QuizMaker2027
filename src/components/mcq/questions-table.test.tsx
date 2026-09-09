import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement, ReactNode } from "react";
import { cloneElement, isValidElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { QuestionsTable } from "@/components/mcq/questions-table";

vi.mock("next/link", () => ({
	default: ({
		children,
		href,
	}: {
		children: React.ReactNode;
		href: string;
	}) => <a href={href}>{children}</a>,
}));

vi.mock("@/components/ui/dropdown-menu", () => ({
	DropdownMenu: ({ children }: { children: ReactNode }) => <div>{children}</div>,
	DropdownMenuTrigger: ({
		children,
		render,
	}: {
		children: ReactNode;
		render?: ReactElement;
	}) => (
		<div>
			{render}
			{children}
		</div>
	),
	DropdownMenuContent: ({ children }: { children: ReactNode }) => (
		<div role="menu">{children}</div>
	),
	DropdownMenuItem: ({
		children,
		onClick,
		render,
	}: {
		children: ReactNode;
		onClick?: () => void;
		render?: ReactElement;
	}) => {
		if (render && isValidElement(render)) {
			return cloneElement(render, undefined, children);
		}

		return (
			<button type="button" role="menuitem" onClick={onClick}>
				{children}
			</button>
		);
	},
}));

const deleteMcqMock = vi.fn();

vi.mock("@/app/(app)/questions/actions", () => ({
	deleteMcq: (...args: unknown[]) => deleteMcqMock(...args),
}));

const sampleMcqs = [
	{
		mcqId: "mcq-001",
		name: "Photosynthesis basics",
		question: "Which process do plants use to convert light energy into chemical energy?",
	},
];

describe("QuestionsTable", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		deleteMcqMock.mockResolvedValue({ success: true });
	});

	it("renders name and question columns", () => {
		render(<QuestionsTable mcqs={sampleMcqs} />);

		expect(screen.getByText("Photosynthesis basics")).toBeInTheDocument();
		expect(
			screen.getByText(
				"Which process do plants use to convert light energy into chemical energy?",
			),
		).toBeInTheDocument();
	});

	it("links create CTA to /questions/new in empty state", () => {
		render(<QuestionsTable mcqs={[]} />);

		expect(screen.getByRole("link", { name: "Create your first question" })).toHaveAttribute(
			"href",
			"/questions/new",
		);
	});

	it("row menu shows Edit, Preview, and Delete options", () => {
		render(<QuestionsTable mcqs={sampleMcqs} />);

		expect(screen.getByRole("link", { name: "Edit" })).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "Preview" })).toBeInTheDocument();
		expect(screen.getByRole("menuitem", { name: "Delete" })).toBeInTheDocument();
	});

	it("Edit links to the correct edit URL", () => {
		render(<QuestionsTable mcqs={sampleMcqs} />);

		expect(screen.getByRole("link", { name: "Edit" })).toHaveAttribute(
			"href",
			"/questions/mcq-001/edit",
		);
	});

	it("Delete opens confirmation dialog", async () => {
		render(<QuestionsTable mcqs={sampleMcqs} />);

		await userEvent.click(screen.getByRole("menuitem", { name: "Delete" }));

		expect(screen.getByRole("dialog")).toBeInTheDocument();
		expect(screen.getByText("Delete question?")).toBeInTheDocument();
	});

	it("empty state shows create CTA message and button", () => {
		render(<QuestionsTable mcqs={[]} />);

		expect(screen.getByText("No multiple choice questions yet.")).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "Create your first question" })).toBeInTheDocument();
	});
});
