import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import PrivacyPage from "./Privacy";

describe("Privacy notice", () => {
  it("says what the fit check collects, where it's kept, and how to have it deleted", () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/privacy"]}>
        <PrivacyPage />
      </MemoryRouter>,
    );
    const text = container.textContent ?? "";
    for (const detail of ["your answers", "your name", "your business name", "your email", "your WhatsApp number", "CIPA"]) {
      expect(text).toContain(detail);
    }
    expect(text).toContain("Odoo CRM");
    expect(text).toContain("outside Botswana");
    expect(text).toMatch(/deleted/);
    expect(screen.getAllByRole("link", { name: "info@kitsonexus.com" })[0]).toHaveAttribute("href", "mailto:info@kitsonexus.com");
    // The cookie banner's "Privacy notice" link lands here.
    expect(container.querySelector("#cookies")).not.toBeNull();
  });
});
