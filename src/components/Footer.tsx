import { Link } from "react-router";
import { Linkedin, Facebook, MessageCircle } from "lucide-react";
import KNLogo from "./KNLogo";

const Footer = () => (
  <footer className="bg-navy text-primary-foreground pt-16 pb-6">
    <div className="container mx-auto px-4 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
        {/* Col 1 */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <KNLogo size={32} />
            <div>
              <div className="font-bold text-sm">Kitso Nexus Advisory</div>
              <div className="text-teal text-[10px] font-semibold uppercase tracking-[0.12em] italic">
                Architects of Intelligent Operations
              </div>
            </div>
          </div>
          <p className="text-primary-foreground/60 text-sm leading-relaxed mb-4">
            Expert ERP consulting for businesses across Southern Africa. We help you streamline operations, modernize processes, and grow smarter.
          </p>
          <div className="flex gap-2">
            {[
              { icon: Linkedin, href: "https://www.linkedin.com/company/kitso-nexus-advisory/" },
              { icon: Facebook, href: "https://www.facebook.com/profile.php?id=61589163866211" },
              { icon: MessageCircle, href: "https://wa.me/26773989514" },
            ].map(({ icon: Icon, href }, i) => (
              <a
                key={i}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded flex items-center justify-center bg-primary-foreground/10 transition-colors hover:bg-teal"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        {/* Col 2 */}
        <div>
          <h4 className="font-semibold text-sm mb-4 text-primary-foreground">Quick Links</h4>
          {[
            { label: "Services", path: "/services" },
            { label: "About Us", path: "/about" },
            { label: "Contact", path: "/contact" },
            { label: "Book Consultation", path: "https://cal.com/kitso-nexus-advisory-w4fk1j/30min" },
          ].map((link) =>
            link.path.startsWith("http") ? (
              <a
                key={link.label}
                href={link.path}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-primary-foreground/60 hover:text-teal transition-colors mb-2"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.label}
                to={link.path}
                className="block text-sm text-primary-foreground/60 hover:text-teal transition-colors mb-2"
              >
                {link.label}
              </Link>
            )
          )}
        </div>

        {/* Col 3 */}
        <div>
          <h4 className="font-semibold text-sm mb-4 text-primary-foreground">Contact</h4>
          <div className="space-y-2 text-sm text-primary-foreground/60">
            <p>📍 Gaborone, Botswana</p>
            <p>✉️ <a href="mailto:info@kitsonexus.com" className="hover:text-teal transition-colors">info@kitsonexus.com</a></p>
            <p>📞  +267 73 989 514</p>
            <p>🕐 Mon–Fri, 8:00 AM – 5:00 PM (CAT)</p>
          </div>
        </div>
      </div>

      <div className="border-t border-primary-foreground/10 pt-6 text-center text-xs text-primary-foreground/40">
        © 2026 Kitso Nexus Advisory (Pty) Ltd · All rights reserved · Gaborone, Botswana
      </div>
    </div>
  </footer>
);

export default Footer;
