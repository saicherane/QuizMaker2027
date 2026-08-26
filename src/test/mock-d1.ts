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
		prepare: vi.fn((sql: string) => ({
			bind: vi.fn((...bindings: unknown[]) => ({
				all: vi.fn(async () => {
					const call: MockD1Call = { sql, bindings, method: "all" };
					calls.push(call);
					if (options.onQuery) {
						return options.onQuery(call);
					}
					return { results: [] };
				}),
				run: vi.fn(async () => {
					const call: MockD1Call = { sql, bindings, method: "run" };
					calls.push(call);
					if (options.onQuery) {
						return options.onQuery(call);
					}
					return { success: true, meta: { changes: 0 } };
				}),
			})),
		})),
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
