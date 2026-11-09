import "@testing-library/jest-dom";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// jsdom has no scrolling; components may call scrollIntoView.
Element.prototype.scrollIntoView = () => {};

// jsdom cannot draw on a canvas; the hero then keeps its still picture, as in a real browser without canvas.
HTMLCanvasElement.prototype.getContext = (() => null) as typeof HTMLCanvasElement.prototype.getContext;

// jsdom has no scrolling; the fit check scrolls to the top on each screen.
window.scrollTo = () => {};
