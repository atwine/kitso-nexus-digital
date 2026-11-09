import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import ContactPage from "./Contact";

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={["/contact"]}>
      <ContactPage />
    </MemoryRouter>,
  );

const type = (label: RegExp | string, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } });

const fillBothSteps = () => {
  type("Full name", "Neo Molefe");
  type("Email address", "neo@example.co.bw");
  fireEvent.change(screen.getByLabelText("Which industry?"), { target: { value: "Retail & Distribution" } });
  fireEvent.click(screen.getByRole("button", { name: "Next: your message" }));
  type(/Phone or WhatsApp/, "+267 71 234 567");
  type("Your message", "We need help with stock.");
  fireEvent.click(screen.getByRole("button", { name: "Send message" }));
};

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("Contact page", () => {
  it("offers three doors, each leading to the quickest way to get an answer", () => {
    renderPage();
    expect(screen.getByRole("link", { name: /I have a question/ })).toHaveAttribute("href", "https://wa.me/26774947045");
    expect(screen.getByRole("link", { name: /I need a quote/ })).toHaveAttribute("href", "#message");
    expect(screen.getByRole("link", { name: /I'm ready to start/ }).getAttribute("href")).toContain("cal.com");
    // The quote door lands on the form.
    expect(document.getElementById("message")).toContainElement(screen.getByLabelText("Full name"));
  });

  it("names Fredrick as the first contact and lists every way to reach the front desk", () => {
    renderPage();
    expect(screen.getByRole("heading", { name: "You'll start with Fredrick." })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Fredrick Maripe" })).toBeInTheDocument();
    const desk = screen.getByRole("region", { name: "The front desk is yours." });
    expect(within(desk).getByRole("link", { name: /Call us/ })).toHaveAttribute("href", "tel:+26774947045");
    expect(within(desk).getByRole("link", { name: /^Email/ })).toHaveAttribute("href", "mailto:info@kitsonexus.com");
  });

  it("shows whether the office is open now, by Gaborone time", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-11-04T08:00:00Z"));
    const { unmount } = renderPage();
    expect(screen.getByText("We're open now, until 17:00 in Gaborone")).toBeInTheDocument();
    unmount();
    vi.setSystemTime(new Date("2026-11-07T08:00:00Z"));
    renderPage();
    expect(screen.getByText("We're closed now. We open on Monday at 8:00 in Gaborone")).toBeInTheDocument();
  });

  it("asks for name and email before the message, and keeps answers when going back", () => {
    renderPage();
    expect(screen.getByLabelText("Full name")).toBeRequired();
    expect(screen.getByLabelText("Email address")).toBeRequired();
    expect(screen.getByLabelText("Company name")).not.toBeRequired();
    expect(screen.getByRole("option", { name: "Retail & Distribution" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Other" })).toBeInTheDocument();

    type("Full name", "Neo Molefe");
    fireEvent.click(screen.getByRole("button", { name: "Next: your message" }));
    expect(screen.getByText("Step 1 of 2")).toBeInTheDocument();

    type("Email address", "neo@example.co.bw");
    fireEvent.click(screen.getByRole("button", { name: "Next: your message" }));
    expect(screen.getByText("Step 2 of 2")).toBeInTheDocument();
    expect(screen.getByLabelText(/Phone or WhatsApp/)).toHaveFocus();
    expect(screen.getByLabelText("Your message")).toBeRequired();

    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByLabelText("Full name")).toHaveValue("Neo Molefe");
  });

  it("sends the fixed format and says sent only when the server confirms", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{"ok":true}', { headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);
    renderPage();
    fillBothSteps();

    expect(await screen.findByRole("status")).toHaveTextContent("Message sent.");
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      name: "Neo Molefe",
      email: "neo@example.co.bw",
      industry: "Retail & Distribution",
      phone: "+267 71 234 567",
      message: "We need help with stock.",
      website: "",
    });
  });

  it("says it didn't send, keeps the message and offers WhatsApp and email when nothing confirms", async () => {
    // Today nothing answers at /api/contact; the site's fallback serves its own page.
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("<!doctype html>", { headers: { "Content-Type": "text/html" } })));
    renderPage();
    fillBothSteps();

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("That didn't send.");
    expect(within(alert).getByRole("link", { name: "WhatsApp us" })).toHaveAttribute("href", "https://wa.me/26774947045");
    expect(within(alert).getByRole("link", { name: /Email info@kitsonexus.com/ })).toHaveAttribute("href", "mailto:info@kitsonexus.com");
    expect(screen.getByLabelText("Your message")).toHaveValue("We need help with stock.");
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("can't be sent twice: Back is off while sending, and the result takes the focus", async () => {
    let answer: (value: Response) => void = () => {};
    vi.stubGlobal("fetch", vi.fn(() => new Promise<Response>((resolve) => (answer = resolve))));
    renderPage();
    fillBothSteps();

    expect(screen.getByRole("button", { name: "Sending…" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Back" })).toBeDisabled();

    answer(new Response('{"ok":true}', { headers: { "Content-Type": "application/json" } }));
    expect(await screen.findByRole("heading", { name: "Message sent." })).toHaveFocus();
  });

  it("won't send a message that is only spaces", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    renderPage();
    type("Full name", "Neo Molefe");
    type("Email address", "neo@example.co.bw");
    fireEvent.click(screen.getByRole("button", { name: "Next: your message" }));
    type("Your message", "   ");
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));
    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Your message")).toBeInvalid();
  });

  it("says what's wrong beside the box, instead of a dead-end 'didn't send' (owner, 9 Nov 2026)", () => {
    renderPage();
    type("Full name", "Neo Molefe");
    type("Email address", "a@b");
    type("Company name", "-");
    fireEvent.click(screen.getByRole("button", { name: "Next: your message" }));
    expect(screen.getByText("Step 1 of 2")).toBeInTheDocument();
    expect((screen.getByLabelText("Email address") as HTMLInputElement).validationMessage).toMatch(/email/i);

    // Fixing a box clears its message, and the next problem is then pointed out.
    type("Email address", "neo@example.co.bw");
    expect((screen.getByLabelText("Email address") as HTMLInputElement).validity.customError).toBe(false);
    fireEvent.click(screen.getByRole("button", { name: "Next: your message" }));
    expect((screen.getByLabelText("Company name") as HTMLInputElement).validationMessage).toMatch(/company/i);

    type("Company name", "");
    fireEvent.click(screen.getByRole("button", { name: "Next: your message" }));
    expect(screen.getByText("Step 2 of 2")).toBeInTheDocument();
  });

  it("won't send a phone number with no digits", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    renderPage();
    type("Full name", "Neo Molefe");
    type("Email address", "neo@example.co.bw");
    fireEvent.click(screen.getByRole("button", { name: "Next: your message" }));
    type(/Phone or WhatsApp/, "+");
    type("Your message", "Hello");
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));
    expect(fetchMock).not.toHaveBeenCalled();
    expect((screen.getByLabelText(/Phone or WhatsApp/) as HTMLInputElement).validationMessage).toMatch(/phone/i);
  });

  it("opens one FAQ answer at a time, starting with the first", async () => {
    renderPage();
    const free = screen.getByRole("button", { name: "Is the consultation really free?" });
    const odoo = screen.getByRole("button", { name: "Do you only work with Odoo?" });
    expect(free).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(odoo);
    await waitFor(() => expect(odoo).toHaveAttribute("aria-expanded", "true"));
    expect(free).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByText(/Odoo is the system we set up and support/)).toBeVisible();
  });

  it("no longer embeds Google Maps; the map link opens Gaborone in a new tab", () => {
    const { container } = renderPage();
    expect(container.querySelector("iframe")).toBeNull();
    const maps = screen.getByRole("link", { name: "Open in Google Maps" });
    expect(maps.getAttribute("href")).toContain("query=Gaborone");
    expect(maps).toHaveAttribute("target", "_blank");
  });
});
