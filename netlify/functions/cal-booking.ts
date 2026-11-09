import { handleCalBooking } from "../lib/bookingLead.ts";
import { readServerConfig } from "../lib/config.ts";
import { logFailure, reply } from "../lib/intake.ts";
import { realServices } from "../lib/services.ts";

export default async (request: Request) => {
  try {
    return await handleCalBooking(request, realServices(readServerConfig()), process.env.CAL_WEBHOOK_SECRET);
  } catch (error) {
    logFailure("booking", error);
    return reply(500, false);
  }
};

export const config = {
  path: "/api/cal-booking",
};
