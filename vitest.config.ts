import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    projects: [
      {
        // The website: runs in a simulated browser.
        extends: true,
        test: {
          name: "site",
          environment: "jsdom",
          setupFiles: ["./src/test/setup.ts"],
          include: ["src/**/*.{test,spec}.{ts,tsx}"],
        },
      },
      {
        // Server functions and their helpers: run in plain Node, no browser.
        extends: true,
        test: {
          name: "server",
          environment: "node",
          include: ["netlify/**/*.test.ts"],
        },
      },
    ],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
