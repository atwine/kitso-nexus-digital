import { Component, type ReactNode } from "react";

// Wraps a page that loads on demand (the fit check). If its code can't be
// fetched, for example on a weak phone signal or after a new version went live,
// the visitor gets a Reload button instead of a blank white page.
export default class LoadError extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-kn-teal px-6 text-center">
        <h1 className="text-[28px] font-bold leading-8 tracking-[-0.04em] text-white">This page didn't load.</h1>
        <p className="max-w-[360px] text-base leading-6 text-white/85">Your connection may have dropped for a moment. Try again.</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="flex h-[52px] items-center justify-center rounded-full bg-kn-lime px-8 text-base font-bold text-kn-night hover:bg-kn-lime/90"
        >
          Reload
        </button>
      </main>
    );
  }
}
