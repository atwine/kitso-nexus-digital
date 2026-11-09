import { netlifyCountStore } from "../lib/countStore.ts";
import { handleCount } from "../lib/counts.ts";
import { logFailure, reply } from "../lib/intake.ts";

// No rate limit: the free plan allows two and the forms need them. The most anyone
// can do here is pad the numbers (owner's decision, 9 Nov 2026).
export default async (request: Request) => {
  try {
    return await handleCount(request, netlifyCountStore);
  } catch (error) {
    logFailure("count", error);
    return reply(500, false);
  }
};

export const config = { path: "/api/count" };
