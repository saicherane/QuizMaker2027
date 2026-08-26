import { createMockD1 } from "@/test/mock-d1";

export function createMockEnv() {
	const db = createMockD1();
	return { DB: db };
}
