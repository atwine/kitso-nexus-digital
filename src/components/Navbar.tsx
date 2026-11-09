import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { Menu, MessageCircle, X } from "lucide-react";
import KNLogo from "./KNLogo";
import { buttonVariants } from "@/components/ui/button";
import { useModalDialog } from "@/hooks/use-modal-dialog";
import { BOOKING_URL, EMAIL, PHONE_DISPLAY, PHONE_TEL, WHATSAPP_URL } from "@/lib/contact";

const NAV_LINKS = [
  { label: "Home", path: "/" },
  { label: "Services", path: "/services" },
  { label: "About", path: "/about" },
  { label: "Contact", path: "/contact" },
];

// The full menu shows from this width up; below it, the phone menu.
const DESKTOP_QUERY = "(min-width: 1024px)";

// The phone header's Menu and Close pills. On phones under 360px wide each one
// becomes a round icon so the full name stays on one line (owner's pick); the
// word is then hidden from view but still read out by screen readers.
const phoneMenuButton =
  "flex shrink-0 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium leading-[18px] text-white max-[360px]:size-10 max-[360px]:p-0";
const wordHiddenOnTinyPhones = "max-[360px]:sr-only";

// The full name everywhere; the tagline only on laptops, where it fits at a
// readable size (Paper page K, "Header with tagline": laptop lockup, phone option B).
const Brand = () => (
  <Link to="/" className="flex min-w-0 items-center gap-2.5 rounded-lg lg:gap-3">
    <KNLogo className="size-10 lg:size-11" />
    <span className="flex flex-col gap-[3px]">
      <span className="text-base font-bold leading-5 tracking-[-0.01em] text-white lg:text-[17px] lg:leading-[21px]">
        Kitso Nexus Advisory
      </span>
      <span className="hidden text-[11px] font-semibold uppercase leading-[14px] tracking-[0.14em] text-kn-lime lg:block">
        Architects of Intelligent Operations
      </span>
    </span>
  </Link>
);

// Sits on top of each page's teal hero, so the hero's background shows behind it.
const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const menu = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  const isActive = (path: string) => pathname === path;

  useModalDialog(open, menu, close);
  useEffect(close, [pathname, close]);

  // A window widened past phone size while the menu is open swaps to the
  // laptop header, so the hidden menu must close and release the page scroll.
  useEffect(() => {
    const desktop = window.matchMedia(DESKTOP_QUERY);
    const onChange = () => desktop.matches && close();
    desktop.addEventListener("change", onChange);
    return () => desktop.removeEventListener("change", onChange);
  }, [close]);

  return (
    <header className="absolute inset-x-0 top-0 z-[60]">
      {/* 70px tall on phones and 92px on laptops, the space each hero leaves for it. */}
      <nav
        aria-label="Main"
        className="page-line flex items-center justify-between gap-3 py-[15px] lg:py-6"
      >
        <Brand />

        <ul className="hidden gap-1.5 rounded-full bg-white/[0.08] p-[5px] lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.path}>
              <Link
                to={link.path}
                aria-current={isActive(link.path) ? "page" : undefined}
                className={`block rounded-full px-4 py-2 text-sm leading-[18px] transition-colors ${
                  isActive(link.path) ? "bg-white/[0.14] text-white" : "text-white/75 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <a
          href={BOOKING_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden rounded-full bg-white px-5 py-[11px] text-sm font-semibold leading-[18px] text-kn-night transition-colors hover:bg-kn-stone lg:inline-block"
        >
          Book a consultation
        </a>

        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-controls="site-menu"
          className={`${phoneMenuButton} bg-white/[0.08] lg:hidden`}
        >
          <Menu size={18} aria-hidden="true" />
          <span className={wordHiddenOnTinyPhones}>Menu</span>
        </button>
      </nav>

      {open && (
        <div
          ref={menu}
          id="site-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="fixed inset-0 overflow-y-auto bg-kn-teal pb-10 lg:hidden"
        >
          <div className="page-line flex items-center justify-between gap-3 py-[15px]">
            <Brand />
            <button
              type="button"
              onClick={close}
              className={`${phoneMenuButton} bg-white/[0.14]`}
            >
              <X size={18} aria-hidden="true" />
              <span className={wordHiddenOnTinyPhones}>Close</span>
            </button>
          </div>

          <ul className="page-line flex flex-col gap-1 pt-6">
            {NAV_LINKS.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  onClick={close}
                  aria-current={isActive(link.path) ? "page" : undefined}
                  className={`flex items-center justify-between rounded-2xl px-5 py-[18px] text-[28px] font-semibold leading-[34px] tracking-[-0.03em] ${
                    isActive(link.path) ? "bg-white/[0.14] text-white" : "text-white/75"
                  }`}
                >
                  {link.label}
                  {isActive(link.path) && <span aria-hidden="true" className="size-2 rounded-full bg-kn-lime" />}
                </Link>
              </li>
            ))}
          </ul>

          <div className="page-line flex flex-col gap-2.5 pt-8">
            <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "hero", size: "lg" })}>
              Book a free consultation
            </a>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "whatsapp", size: "lg" })}>
              <MessageCircle aria-hidden="true" />
              Chat on WhatsApp
            </a>
            <p className="pt-3 text-center text-sm leading-5 text-white/60">
              <a href={`mailto:${EMAIL}`} className="underline-offset-4 hover:underline">{EMAIL}</a>
              {" · "}
              <a href={PHONE_TEL} className="underline-offset-4 hover:underline">{PHONE_DISPLAY}</a>
            </p>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
