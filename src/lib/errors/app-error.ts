export type AppErrorCode = "CONFLICT" | "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION" | "FORBIDDEN";

export class AppError extends Error {
	constructor(
		public readonly code: AppErrorCode,
		message: string,
	) {
		super(message);
		this.name = "AppError";
	}
}
