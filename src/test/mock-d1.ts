import { vi } from "vitest";

export interface MockD1Call {
	sql: string;
	bindings: unknown[];
	method: "all" | "run";
}

export interface MockD1QueryResult {
	results?: unknown[];
	success?: boolean;
	meta?: { changes?: number };
}

type QueryMatcher = string | RegExp;

interface MockD1Options {
	onQuery?: (call: MockD1Call) => MockD1QueryResult | Promise<MockD1QueryResult>;
}

export function createMockD1(options: MockD1Options = {}) {
	const calls: MockD1Call[] = [];

	const db = {
		prepare: vi.fn((sql: string) => {
			const execute = async (bindings: unknown[], method: "all" | "run") => {
				const call: MockD1Call = { sql, bindings, method };
				calls.push(call);
				if (options.onQuery) {
					return options.onQuery(call);
				}
				return method === "all"
					? { results: [] }
					: { success: true, meta: { changes: 0 } };
			};

			return {
				bind: vi.fn((...bindings: unknown[]) => ({
					all: vi.fn(async () => execute(bindings, "all")),
					run: vi.fn(async () => execute(bindings, "run")),
				})),
				all: vi.fn(async () => execute([], "all")),
				run: vi.fn(async () => execute([], "run")),
			};
		}),
		getCalls: () => calls,
	};

	return db;
}

export function sqlMatches(matcher: QueryMatcher, sql: string): boolean {
	return typeof matcher === "string" ? sql.includes(matcher) : matcher.test(sql);
}

export function createMockEnv(db: ReturnType<typeof createMockD1>) {
	return { DB: db };
}
