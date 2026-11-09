import { ReactNode, useEffect, useRef } from "react";
import { Link } from "react-router";
import { cn } from "@/lib/utils";

// Shared pieces of the fit check screens (Paper page I, phone; page L, laptop).
// On a laptop every screen is the phone column, centred.

export const FitShell = ({ tone, children }: { tone: "teal" | "white"; children: ReactNode }) => (
  <main className={cn("min-h-dvh", tone === "teal" ? "bg-kn-teal" : "bg-white")}>
    <div className="mx-auto flex min-h-dvh w-full max-w-[520px] flex-col lg:py-8">{children}</div>
  </main>
);

// Each screen's heading takes focus when the screen appears, so screen readers
// announce the new question and keyboard users start from the top.
export const ScreenTitle = ({ children, className }: { children: ReactNode; className?: string }) => {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    window.scrollTo({ top: 0 });
    ref.current?.focus({ preventScroll: true });
  }, []);
  return (
    <h1 ref={ref} tabIndex={-1} className={cn("outline-none", className)}>
      {children}
    </h1>
  );
};

export const BackButton = ({ onClick, children = "Back" }: { onClick: () => void; children?: ReactNode }) => (
  <button
    type="button"
    onClick={onClick}
    className="-ml-1 flex items-center gap-1.5 rounded-md px-1 py-1 text-[15px] font-medium leading-[18px] text-kn-night hover:underline"
  >
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path d="M11 4L6 9L11 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    {children}
  </button>
);

// The way back to the main site, at the bottom of the fit check screens: there if
// someone wants it, without competing with the check itself (owner's pick, 5 Nov 2026).
export const BackToSite = ({ tone = "white", className }: { tone?: "teal" | "white"; className?: string }) => (
  <Link
    to="/"
    className={cn(
      "self-center text-[15px] font-semibold leading-5 underline underline-offset-4 hover:no-underline",
      tone === "teal" ? "text-white" : "text-kn-teal",
      className,
    )}
  >
    Back to kitsonexus.com
  </Link>
);

export const Tick =({ className, stroke = "#141413" }: { className?: string; stroke?: string }) => (
  <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" className={className}>
    <path d="M2.5 6.2L5 8.6L9.5 3.6" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
