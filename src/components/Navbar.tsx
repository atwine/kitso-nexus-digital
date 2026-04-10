import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, MessageCircle } from "lucide-react";
import KNLogo from "./KNLogo";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Services", path: "/services" },
  { label: "About", path: "/about" },
  { label: "Contact", path: "/contact" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-navy h-[80px]">
      <div className="container mx-auto h-full flex items-center justify-between px-4 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <KNLogo size={44} />
          <div className="hidden sm:block">
            <div className="text-primary-foreground font-bold text-base leading-tight">
              Kitso Nexus Advisory
            </div>
            <div className="text-teal text-[11px] font-semibold uppercase tracking-[0.14em] leading-tight mt-0.5">
              Architects of Intelligent Operations
            </div>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-medium transition-colors pb-1 border-b-2 ${
                pathname === link.path
                  ? "text-primary-foreground border-teal"
                  : "text-primary-foreground/70 border-transparent hover:text-primary-foreground hover:border-teal"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <a
            href="https://calendly.com"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue text-primary-foreground text-sm font-semibold px-5 py-2 rounded-md btn-hover"
          >
            Book Consultation
          </a>
          <a
            href="https://wa.me/26773989514"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-whatsapp text-primary-foreground text-sm font-semibold px-4 py-2 rounded-md btn-hover flex items-center gap-1.5"
          >
            <MessageCircle size={15} />
            WhatsApp
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="lg:hidden text-primary-foreground"
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden bg-navy border-t border-primary-foreground/10 px-4 pb-4">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setOpen(false)}
              className={`block py-3 text-sm font-medium border-b border-primary-foreground/10 ${
                pathname === link.path
                  ? "text-primary-foreground"
                  : "text-primary-foreground/70"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <a
            href="https://calendly.com"
            target="_blank"
            rel="noopener noreferrer"
            className="block mt-3 bg-blue text-primary-foreground text-sm font-semibold px-5 py-2.5 rounded-md text-center"
          >
            Book Consultation
          </a>
          <a
            href="https://wa.me/26773989514"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 mt-2 bg-whatsapp text-primary-foreground text-sm font-semibold px-5 py-2.5 rounded-md text-center"
          >
            <MessageCircle size={15} />
            Chat on WhatsApp
          </a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
