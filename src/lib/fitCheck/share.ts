import { pageUrl } from "@/seo/pageMeta";

// Phones open their own share sheet; elsewhere WhatsApp opens with the message ready.
const shareLink = async (title: string, text: string, url: string) => {
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return;
    } catch (e) {
      if ((e as DOMException).name === "AbortError") return;
    }
  }
  window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`, "_blank", "noopener,noreferrer");
};

export const shareFitCheck = () =>
  shareLink("Is Odoo right for your business?", "Is Odoo right for your business? This free 4-minute check shows what your way of working costs you each year:", pageUrl("/fit"));

export const shareReport = (token: string) => shareLink("Our Odoo fit check report", "Here's our Odoo fit check report:", `${window.location.origin}/fit/report#${token}`);
