import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import AboutPage from "./About";
import { INDUSTRIES } from "@/data/industries";

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={["/about"]}>
      <AboutPage />
    </MemoryRouter>,
  );

describe("About page", () => {
  it("shows each industry's own sentence, with About's longer button names", () => {
    renderPage();
    const tabs = screen.getAllByRole("tab");
    expect(tabs.map((t) => t.textContent)).toContain("Retail & Distribution");
    for (const [i, industry] of INDUSTRIES.entries()) {
      fireEvent.click(tabs[i]);
      expect(within(screen.getByRole("tabpanel")).getByText(industry.aboutLine)).toBeInTheDocument();
    }
  });

  it("opens a profile with the longer bio and experience", () => {
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: /Mugume T. Atwine, Technical Lead: view profile/ }));
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText(/extensive background in software engineering/)).toBeInTheDocument();
    expect(within(dialog).getAllByRole("button", { name: "Close" })).toHaveLength(1);
    expect(within(dialog).getByRole("link", { name: /on LinkedIn/ })).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("shows no LinkedIn link for a team member without one", () => {
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: /Fredrick Maripe/ }));
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText(/seasoned business strategist/)).toBeInTheDocument();
    expect(within(dialog).queryByRole("link", { name: /LinkedIn/ })).toBeNull();
  });
});
