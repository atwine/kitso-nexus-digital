// The details form after the free result. The server (Sprint 11) checks the
// same way, so this stays plain zod with no browser code.

import { z } from "zod";
import { nameForEmail } from "./text.ts";

export const DETAILS_LIMITS = { firstName: 60, businessName: 120, email: 254 } as const;

const WHATSAPP_MESSAGE = "Add your country code, for example +267 71 234 567 or +27 82 123 4567";

// A WhatsApp number from any country, stored with its code. A short number with
// no code is taken as Botswana's, which has 7 or 8 digits after +267.
const whatsapp = z
  .string()
  .transform((s) => s.replace(/[\s().-]/g, "").replace(/^00/, "+"))
  .transform((s) => (/^\d{7,8}$/.test(s) ? `+267${s}` : /^267\d{7,8}$/.test(s) ? `+${s}` : s))
  .pipe(z.string().regex(/^\+[1-9]\d{8,14}$/, WHATSAPP_MESSAGE).refine((s) => !s.startsWith("+267") || /^\+267\d{7,8}$/.test(s), WHATSAPP_MESSAGE));

export const fitCheckDetails = z
  .object({
    firstName: nameForEmail(DETAILS_LIMITS.firstName, "Please add your first name"),
    businessName: nameForEmail(DETAILS_LIMITS.businessName, "Please add your business name"),
    email: z.string().trim().toLowerCase().max(DETAILS_LIMITS.email).pipe(z.email("That email doesn't look right")),
    whatsapp,
    joinCommunity: z.boolean(),
    emailTips: z.boolean(),
  })
  .strict();

export type FitCheckDetails = z.infer<typeof fitCheckDetails>;
export type DetailsInput = z.input<typeof fitCheckDetails>;
