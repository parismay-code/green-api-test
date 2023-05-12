import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			"@assets": path.resolve(__dirname, "./src/assets"),
			"@components": path.resolve(__dirname, "./src/components"),
			"@configs": path.resolve(__dirname, "./src/configs"),
			"@contexts": path.resolve(__dirname, "./src/contexts"),
			"@interfaces": path.resolve(__dirname, "./src/interfaces"),
			"@loaders": path.resolve(__dirname, "./src/loaders"),
			"@pages": path.resolve(__dirname, "./src/pages"),
			"@store": path.resolve(__dirname, "./src/store"),
			"@styles": path.resolve(__dirname, "./src/styles"),
			"@utils": path.resolve(__dirname, "./src/utils"),
		}
	}
})
