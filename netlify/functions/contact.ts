import { handleContact } from "../lib/contactLead.ts";
import { readServerConfig } from "../lib/config.ts";
import { logFailure, reply } from "../lib/intake.ts";
import { realServices } from "../lib/services.ts";

// The browser stops waiting for a note at 15 seconds.
const NOTE_LIMITS = { odooBudgetMs: 9_000, mailMs: 6_000 };

export default async (request: Request) => {
  try {
    return await handleContact(request, realServices(readServerConfig(), NOTE_LIMITS));
  } catch (error) {
    logFailure("contact", error);
    return reply(500, false);
  }
};

export const config = {
  path: "/api/contact",
  rateLimit: { windowLimit: 10, windowSize: 60, aggregateBy: ["ip", "domain"] },
};
