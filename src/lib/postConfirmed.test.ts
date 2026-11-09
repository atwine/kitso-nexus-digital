import { describe, expect, it, vi } from "vitest";
import { postConfirmed, postOutcome } from "./postConfirmed";

const replying = (status: number, body: string, type = "application/json") =>
  vi.fn(async () => new Response(body, { status, headers: { "Content-Type": type } })) as unknown as typeof fetch;

describe("what the server's reply means", () => {
  it("is confirmed only by a success that says ok", async () => {
    expect(await postOutcome("/api/x", {}, 1000, replying(200, '{"ok":true}'))).toBe("confirmed");
    expect(await postConfirmed("/api/x", {}, 1000, replying(200, '{"ok":true}'))).toBe(true);
  });

  it("is held back only when the server says a daily limit stopped the email", async () => {
    expect(await postOutcome("/api/x", {}, 1000, replying(429, '{"ok":false,"heldBack":true}'))).toBe("held-back");
    expect(await postConfirmed("/api/x", {}, 1000, replying(429, '{"ok":false,"heldBack":true}'))).toBe(false);
  });

  it("treats Netlify's own too-many-requests answer as not sent, because nothing was saved", async () => {
    expect(await postOutcome("/api/x", {}, 1000, replying(429, "Too many requests", "text/plain"))).toBe("failed");
    expect(await postOutcome("/api/x", {}, 1000, replying(429, '{"ok":false}'))).toBe("failed");
  });

  it("treats an error, the site's own page or a dropped connection as not sent", async () => {
    expect(await postOutcome("/api/x", {}, 1000, replying(502, '{"ok":false}'))).toBe("failed");
    expect(await postOutcome("/api/x", {}, 1000, replying(200, "<html></html>", "text/html"))).toBe("failed");
    const down = vi.fn(async () => { throw new TypeError("offline"); }) as unknown as typeof fetch;
    expect(await postOutcome("/api/x", {}, 1000, down)).toBe("failed");
  });
});
