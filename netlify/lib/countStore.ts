// Where the counts live: Netlify's own storage. Each mark is its own entry, so two
// people counted at the same moment can't overwrite each other.
import { randomUUID } from "node:crypto";
import { getStore } from "@netlify/blobs";
import type { CountStore } from "./counts.ts";

const STORE_NAME = "fit-check-counts";
const NO_LABEL = "none";

export const netlifyCountStore: CountStore = {
  async add(date, step, source) {
    await getStore(STORE_NAME).set(`${date}/${step}/${source ?? NO_LABEL}/${randomUUID()}`, "1");
  },
  async entriesFor(date) {
    const { blobs } = await getStore(STORE_NAME).list({ prefix: `${date}/` });
    return blobs.map(({ key }) => {
      const [, step, source] = key.split("/");
      return { step, source: source === NO_LABEL ? null : source };
    });
  },
};
