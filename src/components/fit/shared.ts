// Plain values the fit check screens share (kept out of the component files so
// fast refresh keeps working).
import type { DetailsInput } from "@/lib/fitCheck/details";

export { verdictPill } from "@/lib/fitCheck/reportContent";

export const EMPTY_DETAILS: DetailsInput = { firstName: "", businessName: "", email: "", whatsapp: "", joinCommunity: false, emailTips: false };

export const primaryButton =
  "flex h-[58px] w-full items-center justify-center rounded-full text-[17px] font-bold leading-[22px] transition-colors";

export const formatPula = (n: number) => `P${Math.round(n).toLocaleString("en-GB")}`;

// "P0 to P1,000" reads oddly, so a range that starts at nothing says "Up to".
export const formatRange = (low: number, high: number) =>
  low === high ? formatPula(low) : low === 0 ? `Up to ${formatPula(high)}` : `${formatPula(low)} to ${formatPula(high)}`;
