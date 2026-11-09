import { MessageCircle } from "lucide-react";
import { WHATSAPP_URL } from "@/lib/contact";

// Sits in the bottom dock in App: 20px up and 16px in on phones (the margins,
// on top of the dock's 12px), 24px on laptops. While the cookie banner shows on
// a phone, the button rides above it, as drawn on Paper page K.
const WhatsAppButton = () => (
  <a
    href={WHATSAPP_URL}
    target="_blank"
    rel="noopener noreferrer"
    className="pointer-events-auto mr-1 flex size-14 shrink-0 items-center justify-center rounded-full bg-kn-whatsapp text-kn-whatsapp-ink shadow-[0_6px_16px_rgb(20_20_19/0.2)] transition-transform duration-200 first:mb-2 hover:-translate-y-0.5 lg:ml-auto lg:mr-0 lg:first:mb-0"
    aria-label="Chat on WhatsApp"
  >
    <MessageCircle size={26} aria-hidden="true" />
  </a>
);

export default WhatsAppButton;
