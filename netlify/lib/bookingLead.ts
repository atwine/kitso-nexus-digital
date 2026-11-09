// Cal.com telling us someone booked. Puts them at the top of the sales list in Odoo.
import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { logFailure, reply } from "./intake.ts";
import type { Services } from "./services.ts";

const HANDLED = new Set(["BOOKING_REQUESTED", "BOOKING_CREATED"]);

// Cal.com takes names from anyone, so a name is cleaned rather than refused: a refusal would lose the booking.
const cleanName = (s: string) => s.replace(/\p{Cf}/gu, "").replace(/[\p{Cc}\p{Zl}\p{Zp}]+/gu, " ").replace(/\s+/g, " ").trim();

const notice = z.object({
  triggerEvent: z.string(),
  payload: z
    .object({
      title: z.string().max(300).default("Consultation"),
      startTime: z.string().max(40).default(""),
      attendees: z.array(z.object({ name: z.string().max(200).transform(cleanName), email: z.string().trim().toLowerCase().pipe(z.email()) })).min(1),
    })
    .optional(),
});

function signatureMatches(body: string, given: string | null, secret: string | undefined) {
  if (!secret || !given) return false;
  const expected = Buffer.from(createHmac("sha256", secret).update(body).digest("hex"));
  const actual = Buffer.from(given);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export async function handleCalBooking(request: Request, services: Services, secret: string | undefined): Promise<Response> {
  if (request.method !== "POST") return reply(405, false, { Allow: "POST" });
  if (!secret) console.error("booking refused: CAL_WEBHOOK_SECRET isn't set");
  const body = await request.text();
  if (!signatureMatches(body, request.headers.get("x-cal-signature-256"), secret)) return reply(401, false);

  let json: unknown;
  try {
    json = JSON.parse(body);
  } catch {
    return reply(400, false);
  }
  const parsed = notice.safeParse(json);
  if (!parsed.success) return reply(400, false);
  // Cal.com sends other notices too, such as cancellations and its own test ping.
  if (!HANDLED.has(parsed.data.triggerEvent) || !parsed.data.payload) return reply(200, true);

  const { attendees, startTime, title } = parsed.data.payload;
  try {
    await services.recordBooking({ name: attendees[0].name, email: attendees[0].email, startTime, title });
  } catch (error) {
    logFailure("booking: updating Odoo", error);
    return reply(502, false);
  }
  return reply(200, true);
}
