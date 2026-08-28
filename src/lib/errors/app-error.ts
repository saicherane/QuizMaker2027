export type AppErrorCode = "CONFLICT" | "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION";

export class AppError extends Error {
	constructor(
		public readonly code: AppErrorCode,
		message: string,
	) {
		super(message);
		this.name = "AppError";
	}
}
