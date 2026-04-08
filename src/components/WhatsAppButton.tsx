import { MessageCircle } from "lucide-react";

const WhatsAppButton = () => (
  <a
    href="https://wa.me/26773989514"
    target="_blank"
    rel="noopener noreferrer"
    className="fixed bottom-6 right-6 z-50 w-[52px] h-[52px] bg-whatsapp rounded-full flex items-center justify-center shadow-lg btn-whatsapp-hover transition-all duration-200"
    aria-label="Chat on WhatsApp"
  >
    <MessageCircle size={24} className="text-primary-foreground" />
  </a>
);

export default WhatsAppButton;
