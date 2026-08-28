import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	plugins: [react(), tsconfigPaths()],
	test: {
		globals: true,
		projects: [
			{
				extends: true,
				test: {
					name: "unit",
					include: ["**/*.test.ts"],
					environment: "node",
				},
			},
			{
				extends: true,
				test: {
					name: "components",
					include: ["**/*.test.tsx"],
					environment: "jsdom",
					setupFiles: ["./src/test/setup.ts"],
				},
			},
		],
	},
});
