import { RefObject, useEffect } from "react";

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

// Keyboard and scroll behaviour for a full-screen dialog (the phone menu, the
// "Before you go" popup): focus moves in, Tab stays inside, Escape closes, the
// page behind doesn't scroll, and focus returns where it was on close.
export const useModalDialog = (open: boolean, dialog: RefObject<HTMLElement | null>, onClose: () => void) => {
  useEffect(() => {
    if (!open) return;
    const returnTo = document.activeElement as HTMLElement | null;
    const focusables = () => [...(dialog.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])];
    focusables()[0]?.focus();
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return onClose();
      if (e.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      returnTo?.focus();
    };
  }, [open, dialog, onClose]);
};
