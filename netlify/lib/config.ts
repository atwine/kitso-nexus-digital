import { z } from "zod";

// Server settings come from environment variables: a local `.env` file while
// building, Netlify's site settings once live. Never from the code.
const emailList = z
  .string()
  .transform((s) => s.split(",").map((e) => e.trim()).filter(Boolean))
  .pipe(z.array(z.email()).min(1));

const ServerEnv = z.object({
  ODOO_URL: z.url({ protocol: /^https$/ }).transform((u) => u.replace(/\/+$/, "")),
  ODOO_DB: z.string().min(1),
  ODOO_API_KEY: z.string().min(20),
  ODOO_SALESPERSON_LOGIN: z.string().min(1),
  GMAIL_USER: z.email(),
  // Google shows app passwords as four groups of four letters.
  GMAIL_APP_PASSWORD: z
    .string()
    .transform((s) => s.replace(/\s+/g, ""))
    .pipe(z.string().length(16)),
  MAIL_FROM: z.email(),
  ALERT_TO: emailList,
});

export type ServerConfig = z.infer<typeof ServerEnv>;

export class ConfigError extends Error {}

/** Reads and checks the settings. Errors name the bad settings, never their values. */
export function readServerConfig(env: Record<string, string | undefined> = process.env): ServerConfig {
  const result = ServerEnv.safeParse(env);
  if (!result.success) {
    const names = [...new Set(result.error.issues.map((i) => String(i.path[0])))].sort();
    throw new ConfigError(`Missing or invalid server settings: ${names.join(", ")}`);
  }
  return result.data;
}
