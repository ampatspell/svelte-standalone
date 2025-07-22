import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
	plugins: [svelte({ compilerOptions: { css: 'injected' } })],
	build: {
		minify: mode === "production",
		sourcemap: mode !== "production" ? "inline" : false,
		target: "es2017",
		emptyOutDir: false,
		outDir: 'dist/standalone',
		rollupOptions: {
			input: 'src/lib/index.ts',
			output: {
				entryFileNames: "entrypoint.js",
			},
		},
	},
	resolve: {},
}));
