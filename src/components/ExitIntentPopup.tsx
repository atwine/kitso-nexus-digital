import { useEffect, useState, useCallback, useRef } from "react";
import { X, Calendar, MessageCircle, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";

const IDLE_TIMEOUT_MS = 30_000; // 30 seconds of inactivity
const SESSION_KEY = "kn_exit_popup_shown";

const ExitIntentPopup = () => {
  const [visible, setVisible] = useState(false);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasShown = useRef(false);

  const show = useCallback(() => {
    if (hasShown.current) return;
    if (sessionStorage.getItem(SESSION_KEY)) return;
    hasShown.current = true;
    sessionStorage.setItem(SESSION_KEY, "1");
    setVisible(true);
  }, []);

  const close = () => setVisible(false);

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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative mx-4 w-full max-w-md rounded-xl bg-card p-8 shadow-2xl fade-in">
        {/* Close button */}
        <button
          onClick={close}
          className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close popup"
        >
          <X size={20} />
        </button>

        {/* Content */}
        <div className="text-center">
          <p className="section-label mb-2">Before You Go</p>
          <h3 className="text-xl md:text-2xl font-bold mb-2">
            Let's stay connected
          </h3>
          <p className="text-muted-foreground text-sm mb-6">
            Book a free consultation, chat with us on WhatsApp, or follow us on X — we'd love to help.
          </p>

          <div className="flex flex-col gap-3">
            {/* Book a call */}
            <a
              href="https://cal.com/kitso-nexus-advisory-w4fk1j/30min"
              target="_blank"
              rel="noopener noreferrer"
              onClick={close}
            >
              <Button variant="hero" size="lg" className="w-full gap-2">
                <Calendar size={18} />
                Book a Free Consultation
              </Button>
            </a>

            {/* WhatsApp */}
            <a
              href="https://wa.me/26773989514"
              target="_blank"
              rel="noopener noreferrer"
              onClick={close}
            >
              <Button variant="whatsapp" size="lg" className="w-full gap-2">
                <MessageCircle size={18} />
                Chat on WhatsApp
              </Button>
            </a>

            {/* X / Twitter */}
            <a
              href="https://x.com/kitsonexus"
              target="_blank"
              rel="noopener noreferrer"
              onClick={close}
            >
              <Button variant="outline" size="lg" className="w-full gap-2">
                <Twitter size={18} />
                Follow us on X
              </Button>
            </a>
          </div>

          <button
            onClick={close}
            className="mt-4 text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
          >
            No thanks, I'm good
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExitIntentPopup;
