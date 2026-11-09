import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Process from "./Process";
import IndustryExplorer from "./IndustryExplorer";
import OdooPanel from "./OdooPanel";
import { INDUSTRIES } from "@/data/industries";

describe("How we work", () => {
  it("shows step 01 first and changes only when a step is clicked", () => {
    render(<Process />);
    const panel = document.getElementById("process-step")!;
    expect(within(panel).getByText("Step 01 of 07")).toBeInTheDocument();

    const desktopStep3 = screen
      .getAllByRole("button", { name: /03 Solution Design/ })
      .find((b) => b.hasAttribute("aria-pressed"))!;
    fireEvent.click(desktopStep3);
    expect(within(panel).getByText("Step 03 of 07")).toBeInTheDocument();
    expect(within(panel).getByText("We design the right solution for your specific context.")).toBeInTheDocument();
  });

  it("opens one phone step at a time, and closes it on a second tap", () => {
    render(<Process />);
    const accordion = screen.getAllByRole("button").filter((b) => b.hasAttribute("aria-expanded"));
    expect(accordion.map((b) => b.getAttribute("aria-expanded"))).toEqual(["true", ...Array(6).fill("false")]);
    fireEvent.click(accordion[4]);
    expect(accordion[4]).toHaveAttribute("aria-expanded", "true");
    expect(accordion[0]).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(accordion[4]);
    expect(accordion.every((b) => b.getAttribute("aria-expanded") === "false")).toBe(true);
  });
});

describe("Built for your industry", () => {
  it("has a tab for each industry, with text for every one", () => {
    render(<IndustryExplorer />);
    expect(screen.getAllByRole("tab")).toHaveLength(INDUSTRIES.length);
    expect(screen.queryByRole("tab", { name: /Non-profits/ })).toBeNull();
    for (const industry of INDUSTRIES) {
      expect(industry.headline && industry.line).toBeTruthy();
      expect(industry.modules.length).toBeGreaterThan(0);
      expect(industry.oftenAdded.length).toBeGreaterThan(0);
    }
  });

  it("switches industry on click and with the arrow keys", () => {
    render(<IndustryExplorer />);
    const panel = screen.getByRole("tabpanel");
    fireEvent.click(screen.getByRole("tab", { name: "Retail" }));
    expect(within(panel).getByText("Shop, stock and till in sync")).toBeInTheDocument();

    fireEvent.keyDown(screen.getByRole("tablist"), { key: "ArrowRight" });
    expect(screen.getByRole("tab", { name: "Construction" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "Construction" })).toHaveFocus();
    fireEvent.keyDown(screen.getByRole("tablist"), { key: "ArrowRight" });
    expect(screen.getByRole("tab", { name: "Manufacturing" })).toHaveAttribute("aria-selected", "true");
    fireEvent.keyDown(screen.getByRole("tablist"), { key: "End" });
    expect(screen.getByRole("tab", { name: "Construction" })).toHaveAttribute("aria-selected", "true");
    fireEvent.keyDown(screen.getByRole("tablist"), { key: "Home" });
    expect(screen.getByRole("tab", { name: "Manufacturing" })).toHaveAttribute("aria-selected", "true");
  });
});

describe("Your Odoo panel", () => {
  const laptopTabs = () => within(screen.getAllByRole("tablist", { name: "Odoo apps" })[0]).getAllByRole("tab");
  const laptopPanel = () => document.getElementById("odoo-desktop-panel")!;

  it("lists six apps and starts on Inventory", () => {
    render(<OdooPanel />);
    expect(laptopTabs().map((t) => t.textContent)).toEqual(["Inventory", "Accounting", "CRM", "Manufacturing", "HR & Payroll", "Projects"]);
    expect(within(laptopPanel()).getByText("Stock overview · Gaborone warehouse")).toBeInTheDocument();
  });

  it("shows each app's own screen when clicked, on laptop and phone together", () => {
    render(<OdooPanel />);
    fireEvent.click(laptopTabs()[1]);
    expect(within(laptopPanel()).getByText("Cash and invoices · November")).toBeInTheDocument();
    expect(within(laptopPanel()).getByText("P 482,300")).toBeInTheDocument();
    const phonePanel = document.getElementById("odoo-phone-panel")!;
    expect(within(phonePanel).getByText("Cash and invoices")).toBeInTheDocument();
  });

  it("moves between apps with the arrow keys, Home and End", () => {
    render(<OdooPanel />);
    const list = screen.getAllByRole("tablist", { name: "Odoo apps" })[0];
    laptopTabs()[0].focus();
    fireEvent.keyDown(list, { key: "ArrowDown" });
    expect(laptopTabs()[1]).toHaveAttribute("aria-selected", "true");
    expect(laptopTabs()[1]).toHaveFocus();
    fireEvent.keyDown(list, { key: "End" });
    expect(within(laptopPanel()).getByText("Client projects · this week")).toBeInTheDocument();
    fireEvent.keyDown(list, { key: "ArrowDown" });
    expect(laptopTabs()[0]).toHaveAttribute("aria-selected", "true");
  });
});
