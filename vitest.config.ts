import { fileURLToPath } from "node:url";
import { configDefaults, defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
	plugins: [react()],
	test: {
		globals: true,
		exclude: [...configDefaults.exclude, "**/e2e/**"],
		include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
		alias: {
			"~/": fileURLToPath(new URL("./src/", import.meta.url)),
		},
		environment: "happy-dom",
		coverage: {
			provider: "v8",
			reporter: ["text", "html"],
			reportsDirectory: "./coverage",
		},
	},
});
