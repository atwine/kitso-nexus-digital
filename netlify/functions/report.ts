import { logFailure, reply } from "../lib/intake.ts";
import { handleReport } from "../lib/reportLink.ts";

// No rate limit: the free plan allows two and the forms need them, and without the
// server's secret there is nothing here to guess or to wear down.
export default async (request: Request) => {
  try {
    return await handleReport(request, process.env.REPORT_LINK_SECRET);
  } catch (error) {
    logFailure("report", error);
    return reply(500, false);
  }
};

export const config = { path: "/api/report" };
