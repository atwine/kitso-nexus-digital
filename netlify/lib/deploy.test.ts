// What Netlify builds and serves is decided by files in the repository.
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.join(import.meta.dirname, "..", "..");
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");

describe("the deployed install", () => {
  it.each(["bun.lock", "bun.lockb"])("%s is gone, so Netlify installs from package-lock.json", (file) => {
    expect(fs.existsSync(path.join(root, file))).toBe(false);
  });

  it("the build command and Node version are in the repository", () => {
    const toml = read("netlify.toml");
    expect(toml).toMatch(/command\s*=\s*"npm run build"/);
    expect(toml).toMatch(/publish\s*=\s*"dist"/);
    expect(toml).toMatch(/NODE_VERSION\s*=\s*"22"/);
  });
});

describe("browser security headers", () => {
  it.each(["X-Frame-Options: DENY", "X-Content-Type-Options: nosniff", "Referrer-Policy: strict-origin-when-cross-origin"])("every page sends %s", (header) => {
    expect(read("public/_headers")).toContain(header);
  });
});
