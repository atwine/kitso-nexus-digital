import { readServerConfig } from "../lib/config.ts";
import { netlifyCountStore } from "../lib/countStore.ts";
import { sendDailyCounts } from "../lib/counts.ts";
import { logFailure } from "../lib/intake.ts";
import { realServices } from "../lib/services.ts";

export default async () => {
  try {
    await sendDailyCounts(netlifyCountStore, realServices(readServerConfig()));
  } catch (error) {
    logFailure("daily counts", error);
  }
};

// 06:00 UTC is 08:00 in Gaborone, when the office opens.
export const config = { schedule: "0 6 * * *" };
