import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { countStep } from "@/lib/fitCheck/count";
import FitReport from "./FitReport";

vi.mock("@/lib/fitCheck/count", () => ({ countStep: vi.fn(), forgetCounted: vi.fn() }));

const strong = {
  businessTypes: ["engineering"], teamSize: "21-50", cipa: "yes", mainTools: ["spreadsheets", "whatsapp", "pastel-sage"], decider: "me", timing: "3-months",
  enquiries: "10-30", goneCold: "a-few", typicalSale: 80000, yearlySales: "10m-50m", daysToPay: "60-90", invoiceMistakes: "sometimes",
  adminPeople: "2-3", adminHours: "5-10", appCount: "4-6", stockValue: "500k-2m", stockProblems: "monthly", reportTime: "week", reportConfidence: "fairly",
};
const trainer = {
  businessTypes: ["professional-services"], teamSize: "1", cipa: "no", mainTools: ["whatsapp", "paper"], decider: "me", enquiries: "10-30", goneCold: "a-few", typicalSale: 2000,
  yearlySales: "under-500k", daysToPay: "under-30", invoiceMistakes: "sometimes", bookings: "under-20", missedBookings: "a-few", bookingValue: 2000,
  adminPeople: "1", adminHours: "2-5", appCount: "2-3", reportTime: "few-days", reportConfidence: "fairly",
};

const answersWith = (answers: unknown) =>
  vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true, answers, issuedAt: "2026-11-09T10:00:00.000Z" }), { headers: { "Content-Type": "application/json" } }));

const open = (hash = "#signed-token") =>
  render(
    <MemoryRouter initialEntries={[`/fit/report${hash}`]}>
      <FitReport />
    </MemoryRouter>,
  );

afterEach(() => {
  vi.unstubAllGlobals();
  document.head.querySelector('meta[name="robots"]')?.remove();
});

describe("the report page", () => {
  it("asks the server about the link in the address, sending only the link", async () => {
    const fetchMock = answersWith(strong);
    vi.stubGlobal("fetch", fetchMock);
    open();
    await screen.findByRole("heading", { name: "Your fit check report" });
    expect(fetchMock.mock.calls[0][0]).toBe("/api/report");
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ token: "signed-token" });
  });

  it("shows the whole report, worked out from the answers", async () => {
    vi.stubGlobal("fetch", answersWith(strong));
    open();
    expect(await screen.findByText("Odoo is a strong fit for you")).toBeInTheDocument();
    expect(screen.getByText("Fit check report, 9 November 2026")).toBeInTheDocument();
    expect(screen.getByText("Engineering · 21–50 people")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Area by area" })).toBeInTheDocument();
    expect(screen.getByText("Missed sales")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Your plan, one step at a time" })).toBeInTheDocument();
    expect(screen.getByText("82 / 100")).toBeInTheDocument();
  });

  it("someone who can decide is offered their review, and the community stays a quiet link", async () => {
    vi.stubGlobal("fetch", answersWith(strong));
    open();
    expect((await screen.findByRole("link", { name: "Book my review" })).getAttribute("href")).toContain("cal.com");
    expect(screen.getByRole("button", { name: "Send this check to a friend" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Join the WhatsApp community" }).className).not.toMatch(/rounded-full/);
  });

  it("someone who can't decide can share it, and whoever decides can book (owner, 9 Nov 2026)", async () => {
    vi.stubGlobal("fetch", answersWith({ ...strong, decider: "someone-else" }));
    open();
    expect(await screen.findByRole("heading", { name: "Share this with whoever decides" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Share this report" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "If you make the decision here" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Book a review" }).getAttribute("href")).toContain("cal.com");
  });

  it("sharing passes on this report's own link", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { ...navigator, share });
    vi.stubGlobal("fetch", answersWith({ ...strong, decider: "someone-else" }));
    open();
    fireEvent.click(await screen.findByRole("button", { name: "Share this report" }));
    await waitFor(() => expect(share).toHaveBeenCalled());
    expect(share.mock.calls[0][0].url).toContain("/fit/report#signed-token");
  });

  it("not yet: honest advice and no booking", async () => {
    vi.stubGlobal("fetch", answersWith(trainer));
    open();
    expect(await screen.findByText("Not yet. Start simpler first")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "What we'd do in your place" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Take the check again" })).toHaveAttribute("href", "/fit");
    expect(screen.queryByRole("link", { name: /review/i })).toBeNull();
  });

  it("saves as PDF through the browser's print screen", async () => {
    const print = vi.fn();
    vi.stubGlobal("print", print);
    vi.stubGlobal("fetch", answersWith(strong));
    open();
    fireEvent.click(await screen.findByRole("button", { name: "Save as PDF or print" }));
    expect(print).toHaveBeenCalled();
  });

  it("a link the server refuses gets the 'isn't working' screen, with a way forward", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response('{"ok":false}', { status: 400, headers: { "Content-Type": "application/json" } })));
    open();
    expect(await screen.findByRole("heading", { name: "This report link isn't working." })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Take the check again" })).toHaveAttribute("href", "/fit");
    expect(screen.getByRole("link", { name: "Ask us on WhatsApp" }).getAttribute("href")).toContain("wa.me");
  });

  it("no link at all: says so without asking the server", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    open("");
    expect(await screen.findByRole("heading", { name: "This report link isn't working." })).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("answers that don't check out also get that screen", async () => {
    vi.stubGlobal("fetch", answersWith({ teamSize: "nonsense" }));
    open();
    expect(await screen.findByRole("heading", { name: "This report link isn't working." })).toBeInTheDocument();
  });

  it.each([
    ["no connection", () => vi.fn().mockRejectedValue(new TypeError("Failed to fetch"))],
    ["a server error", () => vi.fn().mockResolvedValue(new Response('{"ok":false}', { status: 500, headers: { "Content-Type": "application/json" } }))],
  ])("%s doesn't call a good link dead: it offers another try", async (_name, fetchMock) => {
    vi.stubGlobal("fetch", fetchMock());
    open();
    expect(await screen.findByRole("heading", { name: "We couldn't open your report just now." })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
    expect(screen.queryByText(/expired/)).toBeNull();
  });

  it("counts the report being opened and the booking click, but not a dead link", async () => {
    vi.mocked(countStep).mockClear();
    vi.stubGlobal("fetch", answersWith(strong));
    const { unmount } = open();
    fireEvent.click(await screen.findByRole("link", { name: "Book my review" }));
    expect(vi.mocked(countStep).mock.calls).toEqual([["report-opened", null], ["book", null]]);
    unmount();

    vi.mocked(countStep).mockClear();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response('{"ok":false}', { status: 400 })));
    open();
    await screen.findByRole("heading", { name: "This report link isn't working." });
    expect(countStep).not.toHaveBeenCalled();
  });

  it("says something while it opens", () => {
    vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));
    open();
    expect(screen.getByRole("status")).toHaveTextContent("Opening your report");
  });

  it("overrides the site's default 'index' tag, and puts it back on leaving", async () => {
    const site = Object.assign(document.createElement("meta"), { name: "robots", content: "index, follow" });
    document.head.appendChild(site);
    vi.stubGlobal("fetch", answersWith(strong));
    const { unmount } = open();
    await screen.findByRole("heading", { name: "Your fit check report" });
    expect(document.head.querySelectorAll('meta[name="robots"]')).toHaveLength(1);
    expect(site.content).toBe("noindex");
    unmount();
    expect(site.content).toBe("index, follow");
  });

  it("is hidden from search engines", async () => {
    vi.stubGlobal("fetch", answersWith(strong));
    open();
    await screen.findByRole("heading", { name: "Your fit check report" });
    expect(document.head.querySelector('meta[name="robots"]')).toHaveAttribute("content", "noindex");
  });
});
