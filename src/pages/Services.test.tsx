import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import ServicesPage from "./Services";

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={["/services"]}>
      <ServicesPage />
    </MemoryRouter>,
  );

describe("Services page", () => {
  it("has hero buttons that each jump to a section on the page", () => {
    const { container } = renderPage();
    const jumps = within(screen.getByRole("navigation", { name: "Jump to a practice" })).getAllByRole("link");
    expect(jumps.map((a) => a.textContent)).toEqual(["All", "ERP", "Custom software", "Training & academy"]);
    for (const a of jumps) {
      const id = a.getAttribute("href")!.slice(1);
      expect(container.querySelector(`#${id}`), `section #${id}`).not.toBeNull();
    }
  });

  it("sends the two enquiry buttons to WhatsApp with a ready-written message", () => {
    renderPage();
    const retainers = screen.getByRole("link", { name: "Ask about retainers" });
    const cohort = screen.getByRole("link", { name: "Join the next cohort" });
    expect(decodeURIComponent(retainers.getAttribute("href")!)).toContain("wa.me/26774947045?text=Hi Kitso, I'd like to know about your support retainers.");
    expect(decodeURIComponent(cohort.getAttribute("href")!)).toContain("join the next AI Bootcamp cohort");
    for (const link of [retainers, cohort]) expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("shows which service covers which stage, for all six services", () => {
    renderPage();
    const table = screen.getByRole("table");
    expect(within(table).getAllByRole("row")).toHaveLength(7); // header + six services
    expect(within(table).getByRole("rowheader", { name: "Support Retainers" })).toBeInTheDocument();
  });
});
