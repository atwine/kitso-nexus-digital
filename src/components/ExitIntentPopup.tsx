import { useEffect, useState, useCallback, useRef } from "react";
import { X } from "lucide-react";
import { Link } from "react-router";
import { useModalDialog } from "@/hooks/use-modal-dialog";
import { BOOKING_URL, WHATSAPP_URL } from "@/lib/contact";
import { consent, isAsking } from "@/lib/consent";

const IDLE_TIMEOUT_MS = 30_000; // 30 seconds of inactivity
const SESSION_KEY = "kn_exit_popup_shown";

const ExitIntentPopup = () => {
  const [visible, setVisible] = useState(false);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasShown = useRef(false);

  const show = useCallback(() => {
    if (hasShown.current) return;
    // Wait while the cookie banner asks: one question at a time. The next
    // idle spell or mouse exit after the answer can show it.
    if (isAsking(consent.getState())) return;
    if (sessionStorage.getItem(SESSION_KEY)) return;
    hasShown.current = true;
    sessionStorage.setItem(SESSION_KEY, "1");
    setVisible(true);
  }, []);

  const close = useCallback(() => setVisible(false), []);
  const dialog = useRef<HTMLDivElement>(null);
  useModalDialog(visible, dialog, close);

  /* ── Desktop: mouse exit-intent ── */
  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) show();
    };
    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [show]);

  /* ── Mobile + Desktop: idle timer ── */
  useEffect(() => {
    const resetIdle = () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(show, IDLE_TIMEOUT_MS);
    };

    const events = ["mousemove", "scroll", "touchstart", "keydown"];
    events.forEach((evt) => window.addEventListener(evt, resetIdle, { passive: true }));
    resetIdle(); // start the first timer

    return () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      events.forEach((evt) => window.removeEventListener(evt, resetIdle));
    };
  }, [show]);

  if (!visible) return null;

  // Direction A on Paper page L: the fit check first, booking and WhatsApp smaller.
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-kn-night/50 px-4 animate-in fade-in duration-300"
      onClick={close}
    >
      <div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="exit-popup-title"
        className="relative flex w-full max-w-md flex-col gap-4 rounded-[28px] bg-kn-teal px-6 pb-[22px] pt-7"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={close}
          className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full bg-white/[0.12] text-white hover:bg-white/20"
          aria-label="Close"
        >
          <X size={14} strokeWidth={2.5} aria-hidden="true" />
        </button>

        <div className="flex items-center gap-4">
          <ScoreBadge />
          <p className="text-[13px] font-bold uppercase leading-4 tracking-[0.04em] text-kn-lime">Before you go</p>
        </div>
        <h2 id="exit-popup-title" className="text-[30px] font-bold leading-[34px] tracking-[-0.045em] text-white">
          Is Odoo right for your business?
        </h2>
        <p className="text-base leading-6 text-white/85">
          Find out in 4 minutes, free: your business health score, and what your way of working costs you each year in Pula.
        </p>

        <Link
          to="/fit"
          onClick={close}
          className="flex h-[54px] items-center justify-center rounded-full bg-kn-lime text-[17px] font-bold leading-[22px] text-kn-night transition-colors hover:bg-kn-lime/90"
        >
          Take the fit check →
        </Link>
        <div className="flex gap-2.5">
          {[
            { href: BOOKING_URL, label: "Book a call" },
            { href: WHATSAPP_URL, label: "WhatsApp us" },
          ].map((b) => (
            <a
              key={b.label}
              href={b.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={close}
              className="flex h-[46px] flex-1 items-center justify-center rounded-full border-[1.5px] border-white/35 text-[15px] font-semibold leading-[18px] text-white transition-colors hover:bg-white/10"
            >
              {b.label}
            </a>
          ))}
        </div>

        <button
          type="button"
          onClick={close}
          className="text-sm leading-[18px] text-white/75 underline underline-offset-2 hover:text-white"
        >
          No thanks, I'm good
        </button>
      </div>
    </div>
  );
};

// A small score ring, a taste of the fit check's result.
const ScoreBadge = () => (
  <span className="relative flex size-[76px] shrink-0 items-center justify-center" aria-hidden="true">
    <svg width="76" height="76" viewBox="0 0 180 180" className="absolute inset-0">
      <circle cx="90" cy="90" r="76" fill="none" stroke="#FFFFFF26" strokeWidth="16" />
      <circle cx="90" cy="90" r="76" transform="rotate(-90 90 90)" fill="none" stroke="#A5C337" strokeWidth="16" strokeLinecap="round" strokeDasharray="320 478" />
    </svg>
    <span className="text-2xl font-extrabold leading-7 tracking-[-0.04em] text-white">67</span>
  </span>
);

export default ExitIntentPopup;
