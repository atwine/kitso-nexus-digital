// The Contact form's message, in the fixed shape the site's server function
// at /api/contact accepts.
import { z } from "zod";
import { INDUSTRIES } from "../data/industries.ts";
import { plainText } from "./fitCheck/text.ts";
import { postConfirmed } from "./postConfirmed.ts";

export interface ContactMessage {
  name: string;
  email: string;
  company?: string;
  /** One of the site's industries, or "Other". The owner asked for it as its own item (4 Nov 2026). */
  industry?: string;
  /** Phone or WhatsApp number, optional. */
  phone?: string;
  message: string;
  /** Spam trap: a hidden box people never see. Bots fill it in; the server drops those. */
  website: string;
}

export type ContactFields = Record<keyof ContactMessage, string>;

export const CONTACT_ENDPOINT = "/api/contact";

/** Longest answers the form accepts; the server checks them again. */
export const CONTACT_LIMITS = { name: 100, email: 254, company: 120, phone: 30, message: 5000 } as const;

const INDUSTRY_CHOICES = [...INDUSTRIES.map((i) => i.aboutName ?? i.name), "Other"];
const WRITE_MESSAGE = "Please write your message.";

// Their words are kept: emoji stay, and invisible characters picked up by pasting are
// removed. U+200D is what joins the parts of an emoji. Other control characters are refused.
const message = z
  .string()
  .transform((s) => s.normalize("NFC").replace(/(?!‍)\p{Cf}/gu, "").trim())
  .pipe(
    z
      .string()
      .min(1, WRITE_MESSAGE)
      .max(CONTACT_LIMITS.message)
      .refine((s) => !/[^\P{Cc}\r\n\t]/u.test(s), WRITE_MESSAGE),
  );

/** The one set of rules: the form uses it to explain a problem, the server to enforce it. */
export const contactNote = z
  .object({
    name: plainText(CONTACT_LIMITS.name, "Please enter your name."),
    email: z.string().trim().toLowerCase().max(CONTACT_LIMITS.email).pipe(z.email("Please check your email address.")),
    company: plainText(CONTACT_LIMITS.company, "Please enter a company name.").optional(),
    industry: z.string().refine((s) => INDUSTRY_CHOICES.includes(s)).optional(),
    phone: plainText(CONTACT_LIMITS.phone, "Please enter a phone number.").optional(),
    message,
    website: z.string().max(500),
  })
  .strict();

type CheckedField = "name" | "email" | "company" | "phone" | "message";
const OPTIONAL_FIELDS = new Set<CheckedField>(["company", "phone"]);

/** What's wrong with one box, in words for the person typing, or null if it's fine. */
export function contactFieldProblem(field: CheckedField, value: string): string | null {
  if (OPTIONAL_FIELDS.has(field) && !value.trim()) return null;
  const checked = contactNote.shape[field].safeParse(value);
  return checked.success ? null : checked.error.issues[0].message;
}

const SEND_TIMEOUT_MS = 15_000;

const optional = (value: string) => value.trim() || undefined;

export const toContactMessage = (fields: ContactFields): ContactMessage => ({
  name: fields.name.trim(),
  email: fields.email.trim(),
  company: optional(fields.company),
  industry: optional(fields.industry),
  phone: optional(fields.phone),
  message: fields.message.trim(),
  website: fields.website,
});

/** Sends the message; true only when the server confirms it has it. */
export const sendContactMessage = (message: ContactMessage, fetchImpl: typeof fetch = fetch): Promise<boolean> =>
  postConfirmed(CONTACT_ENDPOINT, message, SEND_TIMEOUT_MS, fetchImpl);
