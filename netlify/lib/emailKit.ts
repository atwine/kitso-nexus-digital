// The look every Kitso email shares. Email programs need inline styles and tables.
export const C = { teal: "#0C4243", lime: "#A5C337", night: "#141413", body: "#4A4845", muted: "#6B6965", line: "#E3E3E3", stone: "#F7F5F2", olive: "#4F6216", red: "#C25C3D", amber: "#D69A2D", green: "#4E9A5B", tealSoft: "#3A6566" };
export const FONT = "Inter, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif";

export const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
export const pula = (n: number) => `P${Math.round(n).toLocaleString("en-GB")}`;

export const para = (text: string, size = 15, colour = C.body, extra = "") => `<p style="margin:0;font-family:${FONT};font-size:${size}px;line-height:${Math.round(size * 1.5)}px;color:${colour};${extra}">${text}</p>`;

export const button = (href: string, label: string, fill: boolean) =>
  `<a href="${href}" style="display:block;text-align:center;font-family:${FONT};font-size:16px;font-weight:700;line-height:22px;padding:14px 20px;border-radius:999px;text-decoration:none;${fill ? `background:${C.lime};color:${C.night};` : "border:1.5px solid rgba(255,255,255,0.4);color:#FFFFFF;"}">${label}</a>`;
