import { z } from "zod";

// Free text that ends up in emails and Odoo (names, a system's name) may hold
// no line breaks or hidden characters (control, zero-width, right-to-left
// tricks), and must have at least one real letter or digit. HTML escaping
// still happens wherever it's shown.
export const plainText = (max: number, missing: string) =>
  z
    .string()
    .transform((s) => s.normalize("NFC").trim())
    .pipe(
      z
        .string()
        .max(max)
        .refine((s) => !/[\p{Cc}\p{Cf}\p{Zl}\p{Zp}]/u.test(s), "Please use letters, numbers and ordinary punctuation")
        .refine((s) => /[\p{L}\p{N}]/u.test(s), missing),
    );

const JOINED_TITLES = new Set(["pty", "co", "st", "dr", "mr", "mrs", "ms"]);
const COMMON_ENDINGS = new Set(["com", "net", "org", "io", "co", "info", "biz", "app", "dev", "xyz", "click", "link", "top", "site", "online", "shop", "store", "bw", "za", "me", "ai", "ly"]);

// Is this stretch of text shaped like a web address? Initials ("A.B.", "T.K.Motors") and
// a title joined to a name ("St.Mary", "Pty.Ltd") aren't, as long as the last part reads
// like a word. A short or real ending ("v.gd", "x.com", "dr.click") or anything after it
// ("v.fyi/abc") makes it an address.
function partIsAddress(part: string, hasPath: boolean): boolean {
  const labels = part.split(".").filter(Boolean);
  if (labels.length < 2) return false;
  if (labels.length === 4 && labels.every((label) => /^\d{1,3}$/.test(label))) return true;
  if (labels.every((label) => label.length === 1)) return false;
  const last = labels[labels.length - 1].toLowerCase();
  const initials = labels.slice(0, -1).every((label) => label.length === 1);
  const joinedTitle = labels.length === 2 && JOINED_TITLES.has(labels[0].toLowerCase());
  if ((initials || joinedTitle) && !hasPath && last.length > 2 && !COMMON_ENDINGS.has(last)) return false;
  return /^(\p{L}{2,}|xn--[a-z0-9-]+)$/iu.test(last);
}

// Anything that can't be in an address splits the word, so "Visit:bad-site.com" or
// "bad-site.com|pay" can't hide one.
function wordIsAddress(word: string): boolean {
  const core = word.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");
  const hasPath = /[/?#:]/.test(core);
  return core.split(/[^\p{L}\p{N}.-]+/u).some((part) => partIsAddress(part, hasPath));
}

function looksLikeWebAddress(text: string): boolean {
  // Look-alike dots count as dots.
  const plain = text.normalize("NFKC").replace(/[\u3002\uFF61]/g, ".");
  return /:\/\/|\bwww\./i.test(plain) || plain.split(/[\s,;()"'<>]+/).some(wordIsAddress);
}

/**
 * A name that gets printed in an email to the address the visitor typed. A web
 * address here could turn Kitso's real email into a scam sent to a stranger.
 */
export const nameForEmail = (max: number, missing: string) => plainText(max, missing).refine((s) => !looksLikeWebAddress(s), "Please leave out web addresses");
