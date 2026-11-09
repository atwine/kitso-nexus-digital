import { fireEvent, render, screen } from "@testing-library/react";
import { Link, MemoryRouter, useNavigate } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ScrollToTop from "./ScrollToTop";

const Controls = () => {
  const navigate = useNavigate();
  return (
    <>
      <Link to="/privacy">Privacy</Link>
      <Link to="/contact#message">Message</Link>
      <button type="button" onClick={() => navigate(-1)}>
        Back
      </button>
      <button type="button" onClick={() => navigate("/", { state: { step: 2 } })}>
        Same page
      </button>
    </>
  );
};

const open = () =>
  render(
    <MemoryRouter initialEntries={["/"]}>
      <ScrollToTop />
      <Controls />
    </MemoryRouter>,
  );

let scrollTo: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
  scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
});
afterEach(() => vi.restoreAllMocks());

describe("changing page", () => {
  it("starts the new page at the top", () => {
    open();
    scrollTo.mockClear();
    fireEvent.click(screen.getByRole("link", { name: "Privacy" }));
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: "instant" });
  });

  it("leaves a link to a section of a page alone", () => {
    open();
    scrollTo.mockClear();
    fireEvent.click(screen.getByRole("link", { name: "Message" }));
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it("lets the browser restore the place when going Back", () => {
    open();
    fireEvent.click(screen.getByRole("link", { name: "Privacy" }));
    scrollTo.mockClear();
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it("stays put when the address doesn't change, as between fit check screens", () => {
    open();
    scrollTo.mockClear();
    fireEvent.click(screen.getByRole("button", { name: "Same page" }));
    expect(scrollTo).not.toHaveBeenCalled();
  });
});
