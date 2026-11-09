// How visitors reach Kitso. Every "Book" button, WhatsApp link, email and
// phone number on the site reads from here, so a change is made once.

// The free consultation on Cal.com. The address still says 30min, but the event behind it
// is now the 20-minute one (changed by the owner on 9 Nov 2026).
export const BOOKING_URL = "https://cal.com/kitso-nexus-advisory-w4fk1j/30min";
// Its length, shown wherever the site describes the consultation (owner's pick, 5 Nov 2026).
export const CONSULTATION_MINUTES = 20;

export const WHATSAPP_URL = "https://wa.me/26774947045";

export const EMAIL = "info@kitsonexus.com";
export const PHONE_DISPLAY = "+267 74 947 045";
export const PHONE_TEL = "tel:+26774947045";

// WhatsApp with a ready-written first message, so the visitor only taps Send
// and Kitso knows which button they came from.
export const whatsappWith = (message: string) => `${WHATSAPP_URL}?text=${encodeURIComponent(message)}`;

// The Kitso WhatsApp community invite, offered after the fit check. It's meant to be
// public. If it's ever abused, reset the link in WhatsApp and paste the new one here.
export const WHATSAPP_COMMUNITY_URL = "https://chat.whatsapp.com/EGogxgoYJpDEHIRn8BhNhu";
