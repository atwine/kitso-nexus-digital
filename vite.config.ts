import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { componentTagger } from "lovable-tagger";
import { PAGE_PATHS } from "./src/seo/pageMeta";
import { renderPageHtml } from "./src/seo/renderPageHtml";

// Writes dist/<page>.html for each route with that page's title/description,
// so crawlers and link previews get the right tags without running JS.
// Netlify serves /services from services.html before the SPA fallback in _redirects.
const pageMetaHtml = (): Plugin => {
  let outDir = "dist";
  return {
    name: "page-meta-html",
    apply: "build",
    configResolved(config) {
      // Both values are the repo's own Vite config, not user input.
      outDir = path.resolve(config.root, config.build.outDir); // nosemgrep: javascript.lang.security.audit.path-traversal.path-join-resolve-traversal.path-join-resolve-traversal
    },
    closeBundle() {
      const indexPath = path.join(outDir, "index.html");
      if (!fs.existsSync(indexPath)) return; // build failed earlier; let that error surface
      const template = fs.readFileSync(indexPath, "utf8");
      for (const route of PAGE_PATHS) {
        const file = route === "/" ? indexPath : path.join(outDir, `${route.slice(1)}.html`);
        fs.writeFileSync(file, renderPageHtml(template, route));
      }
    },
  };
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger(), pageMetaHtml()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
}));
