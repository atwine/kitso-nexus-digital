import { afterEach, describe, expect, it, vi } from "vitest";
import { CONTACT_ENDPOINT, sendContactMessage, toContactMessage } from "./contactMessage";

const fields = {
  name: "  Neo Molefe ",
  email: " neo@example.co.bw ",
  company: "",
  industry: "Manufacturing",
  phone: "   ",
  message: " Hello \n",
  website: "",
};

const reply = (body: string, contentType: string, status = 200) =>
  vi.fn().mockResolvedValue(new Response(body, { status, headers: { "Content-Type": contentType } }));

afterEach(() => {
  vi.useRealTimers();
});

describe("contact message format", () => {
  it("trims answers and leaves out optional ones left empty", () => {
    expect(toContactMessage(fields)).toEqual({
      name: "Neo Molefe",
      email: "neo@example.co.bw",
      industry: "Manufacturing",
      message: "Hello",
      website: "",
    });
  });

  it("posts JSON to /api/contact and counts it sent only on {ok: true}", async () => {
    const fetchImpl = reply('{"ok":true}', "application/json");
    expect(await sendContactMessage(toContactMessage(fields), fetchImpl)).toBe(true);
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe(CONTACT_ENDPOINT);
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual(toContactMessage(fields));
  });

  it.each([
    ["the site's own page served back by the fallback rule", reply("<!doctype html><html></html>", "text/html")],
    ["a server error", reply('{"ok":false}', "application/json", 500)],
    ["a refusal", reply('{"ok":false}', "application/json")],
    ["no server at all", vi.fn().mockRejectedValue(new TypeError("Failed to fetch"))],
  ])("does not count %s as sent", async (_case, fetchImpl) => {
    expect(await sendContactMessage(toContactMessage(fields), fetchImpl)).toBe(false);
  });

  it("gives up after 15 seconds without an answer", async () => {
    vi.useFakeTimers();
    const fetchImpl = vi.fn(
      (_url: string, init: RequestInit) =>
        new Promise<Response>((_resolve, reject) => init.signal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")))),
    );
    const result = sendContactMessage(toContactMessage(fields), fetchImpl as unknown as typeof fetch);
    await vi.advanceTimersByTimeAsync(15_000);
    expect(await result).toBe(false);
  });
});
