import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import Navbar from "./Navbar";
import { buttonVariants } from "@/components/ui/button";

const renderNav = () =>
  render(
    <MemoryRouter initialEntries={["/about"]}>
      <Navbar />
    </MemoryRouter>,
  );

describe("header brand", () => {
  it("shows the full name and the tagline, the tagline on laptops only", () => {
    renderNav();
    const home = screen.getByRole("link", { name: /^Kitso Nexus Advisory/ });
    expect(home).toHaveAttribute("href", "/");
    const tagline = within(home).getByText("Architects of Intelligent Operations");
    expect(tagline).toHaveClass("hidden", "lg:block", "uppercase");
  });

  it("sits on the same page line as the content below it", () => {
    renderNav();
    expect(screen.getByRole("navigation", { name: "Main" })).toHaveClass("page-line");
  });

  it("shrinks Menu and Close to icons below 360px but keeps their names", () => {
    renderNav();
    const menuButton = screen.getByRole("button", { name: "Menu" });
    expect(within(menuButton).getByText("Menu")).toHaveClass("max-[360px]:sr-only");
    fireEvent.click(menuButton);
    const closeButton = screen.getByRole("button", { name: "Close" });
    expect(within(closeButton).getByText("Close")).toHaveClass("max-[360px]:sr-only");
  });
});

describe("phone menu", () => {
  it("opens as a dialog, marks the current page, and locks page scroll", () => {
    renderNav();
    fireEvent.click(screen.getByRole("button", { name: "Menu" }));

    const dialog = screen.getByRole("dialog", { name: "Menu" });
    expect(dialog).toBeInTheDocument();
    expect(document.body.style.overflow).toBe("hidden");
    const current = dialog.querySelector('[aria-current="page"]');
    expect(current).toHaveTextContent("About");
  });

  it("closes on Escape, frees the page and returns focus to the Menu button", () => {
    renderNav();
    const menuButton = screen.getByRole("button", { name: "Menu" });
    menuButton.focus();
    fireEvent.click(menuButton);
    fireEvent.keyDown(window, { key: "Escape" });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe("");
    expect(menuButton).toHaveFocus();
  });

  it("keeps Tab inside the open menu", () => {
    renderNav();
    fireEvent.click(screen.getByRole("button", { name: "Menu" }));
    const dialog = screen.getByRole("dialog");
    const focusables = dialog.querySelectorAll<HTMLElement>("a[href], button");
    const last = focusables[focusables.length - 1];

    last.focus();
    fireEvent.keyDown(window, { key: "Tab" });
    expect(focusables[0]).toHaveFocus();
  });
});

describe("buttonVariants", () => {
  it("lets a pill variant replace the base corners and text size", () => {
    const classes = buttonVariants({ variant: "hero", size: "lg" }).split(" ");
    expect(classes).toContain("rounded-full");
    expect(classes).not.toContain("rounded-md");
    expect(classes).toContain("text-base");
    expect(classes).not.toContain("text-sm");
  });
});
