import { handleFitCheck } from "../lib/fitCheckLead.ts";
import { readServerConfig } from "../lib/config.ts";
import { logFailure, reply } from "../lib/intake.ts";
import { realServices } from "../lib/services.ts";

export default async (request: Request) => {
  try {
    return await handleFitCheck(request, realServices(readServerConfig()));
  } catch (error) {
    logFailure("fit check", error);
    return reply(500, false);
  }
};

// Generous on purpose: people in one event hall can share one internet address.
export const config = {
  path: "/api/fit-check",
  rateLimit: { windowLimit: 20, windowSize: 60, aggregateBy: ["ip", "domain"] },
};
