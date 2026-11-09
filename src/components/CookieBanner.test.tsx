import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Consent } from "@/lib/consent";
import CookieBanner from "./CookieBanner";
import ExitIntentPopup from "./ExitIntentPopup";
import Footer from "./Footer";
import WhatsAppButton from "./WhatsAppButton";

// Each test gets its own on-switch, as if the site had just loaded.
const current = vi.hoisted(() => ({ consent: undefined as unknown as Consent }));
vi.mock("@/lib/consent", async (importOriginal) => {
  const real = await importOriginal<typeof import("@/lib/consent")>();
  return {
    ...real,
    get consent() {
      return current.consent;
    },
  };
});

beforeEach(async () => {
  localStorage.clear();
  sessionStorage.clear();
  const { createConsent } = await vi.importActual<typeof import("@/lib/consent")>("@/lib/consent");
  current.consent = createConsent(localStorage);
});

afterEach(() => {
  vi.useRealTimers();
});

const renderSite = () =>
  render(
    <MemoryRouter>
      <Footer />
      <WhatsAppButton />
      <CookieBanner />
      <ExitIntentPopup />
    </MemoryRouter>,
  );

const banner = () => screen.queryByRole("region", { name: "Your choice" });
const somethingNeedsConsent = (start = vi.fn()) => {
  act(() => current.consent.whenAccepted(start));
  return start;
};

describe("cookie banner", () => {
  it("stays hidden while nothing on the site needs consent, and the footer links to the notice", () => {
    renderSite();
    expect(banner()).toBeNull();
    expect(screen.queryByRole("button", { name: "Cookie settings" })).toBeNull();
    expect(screen.getByRole("link", { name: "Privacy" })).toHaveAttribute("href", "/privacy");
  });

  it("asks once something waits; Accept starts it, hides the banner and is remembered", () => {
    renderSite();
    const start = somethingNeedsConsent();
    expect(banner()).not.toBeNull();
    expect(screen.getByRole("link", { name: "Privacy notice" })).toHaveAttribute("href", "/privacy#cookies");

    fireEvent.click(screen.getByRole("button", { name: "Accept" }));
    expect(start).toHaveBeenCalledTimes(1);
    expect(banner()).toBeNull();
    expect(localStorage.getItem("kn_consent")).toBe("accepted");
  });

  it("No thanks starts nothing, and Cookie settings in the footer asks again", () => {
    renderSite();
    const start = somethingNeedsConsent();
    fireEvent.click(screen.getByRole("button", { name: "No thanks" }));
    expect(start).not.toHaveBeenCalled();
    expect(banner()).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Cookie settings" }));
    expect(banner()).not.toBeNull();
  });

  it("holds back the 'Before you go' popup until the banner is answered", () => {
    vi.useFakeTimers();
    renderSite();
    somethingNeedsConsent();

    act(() => vi.advanceTimersByTime(31_000));
    expect(screen.queryByRole("dialog")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "No thanks" }));
    fireEvent.keyDown(window);
    act(() => vi.advanceTimersByTime(31_000));
    expect(screen.getByRole("dialog", { name: "Is Odoo right for your business?" })).toBeInTheDocument();
  });
});
