import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { McqPreview } from "@/components/mcq/mcq-preview";

vi.mock("next/link", () => ({
	default: ({
		children,
		href,
	}: {
		children: React.ReactNode;
		href: string;
	}) => <a href={href}>{children}</a>,
}));

const recordAttemptMock = vi.fn();

vi.mock("@/app/(app)/questions/[mcqId]/preview/actions", () => ({
	recordAttempt: (...args: unknown[]) => recordAttemptMock(...args),
}));

const previewProps = {
	mcqId: "mcq-001",
	name: "Photosynthesis basics",
	question: "Which process do plants use to convert light energy?",
	choices: [
		{ choiceId: "choice-001", label: "Respiration" },
		{ choiceId: "choice-002", label: "Photosynthesis" },
	],
};

describe("McqPreview", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		recordAttemptMock.mockResolvedValue({ isCorrect: true });
	});

	it("shows question without revealing the correct answer before submit", () => {
		render(<McqPreview {...previewProps} />);

		expect(screen.getByText(previewProps.question)).toBeInTheDocument();
		expect(screen.queryByText("Correct!")).not.toBeInTheDocument();
		expect(screen.queryByText("Incorrect.")).not.toBeInTheDocument();
	});

	it("submit calls recordAttempt action", async () => {
		render(<McqPreview {...previewProps} />);

		await userEvent.click(screen.getByLabelText("Photosynthesis"));
		fireEvent.submit(screen.getByRole("button", { name: "Submit answer" }).closest("form")!);

		await waitFor(() => {
			expect(recordAttemptMock).toHaveBeenCalled();
		});
	});

	it("shows correct feedback after a successful response", async () => {
		recordAttemptMock.mockResolvedValue({ isCorrect: true });
		render(<McqPreview {...previewProps} />);

		await userEvent.click(screen.getByLabelText("Photosynthesis"));
		fireEvent.submit(screen.getByRole("button", { name: "Submit answer" }).closest("form")!);

		expect(await screen.findByText("Correct!")).toBeInTheDocument();
	});
});
